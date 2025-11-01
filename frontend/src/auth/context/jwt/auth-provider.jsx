'use client';

import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import accountHistoryService from 'src/services/accountHistoryService';

import { removeSession } from './utils';
import { CONFIG } from 'src/config-global';
import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------


import { supabase } from './supabaseClient';

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    loading: true,
  });

  // Debounce health check for 60s
  let healthTsRef = { ts: 0 };

  const checkUserSession = useCallback(async () => {
    console.log('checkUserSession called');
    
      try {
        setState(prev => ({ ...prev, loading: true }));
        // Backend bootId check to detect server restarts
        let backendBootId = null;
        try {
        const now = Date.now();
        if (!healthTsRef.ts || now - healthTsRef.ts > 60000) {
          // Use relative URL in browser (Next.js proxy), absolute in SSR
          const healthUrl = typeof window !== 'undefined' 
            ? '/api/health'
            : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/health`;
          const resp = await fetch(healthUrl, { cache: 'no-store' });
          healthTsRef.ts = Date.now();
          if (resp.ok) {
            const j = await resp.json();
            backendBootId = j?.bootId || null;
            if (backendBootId && typeof window !== 'undefined') {
              const prev = sessionStorage.getItem('backend-boot-id');
              if (!prev) {
                sessionStorage.setItem('backend-boot-id', backendBootId);
              } else if (prev !== backendBootId) {
                // Backend restarted: do not force sign-out; update marker and continue
                sessionStorage.setItem('backend-boot-id', backendBootId);
              }
            }
          }
        }
      } catch (_) { /* ignore health errors */ }
      
  // First check if we have a stored session in localStorage
      console.log('Checking for stored session...');
      const sessionData = localStorage.getItem(STORAGE_KEY);
      
      if (sessionData) {
        try {
          console.log('Found session data, parsing...');
          const sessionJson = JSON.parse(sessionData);
          console.log('Parsed session data:', sessionJson);
          const { isActive, timestamp } = sessionJson;

          if (isActive === false) {
            console.log('Session is marked as inactive, logging out...');
            await logout();
            return;
          }

          // Do not enforce arbitrary 1-day local timestamp expiry; rely on auth provider session validity

          // Validate token with Supabase (persisted across refresh)
          console.log('Validating session with Supabase...');
          const { data: { session }, error } = await supabase.auth.getSession();
          console.log('Supabase session response:', { session, error });

          if (error || !session) {
            console.error('Invalid or expired session:', error);
            // Require explicit sign-in; do not auto-login from local metadata
            await logout();
            return;
          }

          console.log('Session is valid, fetching user data...');
          const { data: userModel, error: userError } = await supabase
            .from('user_model')
            .select('id, email, name, role')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user data:', userError);
            await logout();
            return;
          }

          setState({
            user: {
              id: session.user.id,
              email: session.user.email,
              displayName: userModel?.name || session.user.email,
              role: userModel?.role || '',
              photoURL: '',
              accessToken: session.access_token,
            },
            loading: false,
          });

          console.log('User session loaded successfully');
          return; // Exit early if we have a valid session
        } catch (error) {
          console.error('Error parsing session data:', error);
          await logout();
          return;
        }
      }
      
      // If we get here, there's no valid session
      console.log('No valid session found');
      setState({
        user: null,
        loading: false,
      });
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  const logout = useCallback(async () => {
    try {
      // Log logout activity to account history before signing out
      try {
        await accountHistoryService.logActivity({
          activityType: 'logout',
          status: 'successful',
          ipAddress: '127.0.0.1', // Simplified for now
          userAgent: navigator.userAgent,
          device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
          location: 'Unknown',
          timestamp: new Date().toISOString()
        });
        console.log('Logout activity logged successfully');
      } catch (historyError) {
        console.error('Failed to log logout activity:', historyError);
        // Don't fail the logout if history logging fails
      }

      // Sign out from Supabase Auth
      await supabase.auth.signOut();

      // Clear session
      removeSession();
      
      // Clear user state
      setState({ user: null, loading: false });
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/jwt/sign-in';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [setState]);

  // Check session on mount and set up listeners only when authenticated
  useEffect(() => {
    checkUserSession();

    // Visibility change listener always ok
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUserSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Only attach idle listeners when a user is present to avoid issues on auth pages
    let idleTimer;
    const IDLE_MS = 60 * 60 * 1000;
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        try {
          if (typeof window !== 'undefined') {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
              logout();
            }
          }
        } catch (_) {}
      }, IDLE_MS);
    };
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'];
    if (state.user) {
      activityEvents.forEach((evt) => window.addEventListener(evt, resetIdle, { passive: true }));
      resetIdle();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (idleTimer) clearTimeout(idleTimer);
      if (state.user) {
        activityEvents.forEach((evt) => window.removeEventListener(evt, resetIdle));
      }
    };
  }, [checkUserSession, state.user, logout]);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      checkUserSession,
      logout,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, logout, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
