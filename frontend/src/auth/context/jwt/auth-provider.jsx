'use client';

import { useMemo, useEffect, useCallback, useState } from 'react';

import { useSetState } from 'src/hooks/use-set-state';
import { useRouter } from 'src/routes/hooks';

import { _mock } from 'src/_mock';

import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken, removeSession } from './utils';

// ----------------------------------------------------------------------

import { supabase } from './supabaseClient';

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    loading: true,
  });

  const checkUserSession = useCallback(async () => {
    console.log('checkUserSession called');
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // First check if we have a stored session in localStorage
      console.log('Checking for stored session...');
      const sessionData = localStorage.getItem(STORAGE_KEY);
      
      if (sessionData) {
        try {
          console.log('Found session data, parsing...');
          const sessionJson = JSON.parse(sessionData);
          console.log('Parsed session data:', sessionJson);
          
          const { isActive, timestamp, token } = sessionJson;
          
          // If session is marked as inactive, clear it
          if (isActive === false) {
            console.log('Session is marked as inactive, logging out...');
            await logout();
            return;
          }
          
          // Check if token is expired (older than 1 day)
          const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          const isExpired = (Date.now() - timestamp) > oneDay;
          
          if (isExpired) {
            console.log('Session has expired, logging out...');
            await logout();
            return;
          }
          
          // Validate token with Supabase
          console.log('Validating session with Supabase...');
          const { data: { session }, error } = await supabase.auth.getSession();
          console.log('Supabase session response:', { session, error });
          
          if (error || !session) {
            console.error('Invalid or expired session:', error);
            await logout();
            return;
          }
          
          console.log('Session is valid, fetching user data...');
          
          // Fetch user info from user_model
          const { data: userModel, error: userError } = await supabase
            .from('user_model')
            .select('id, email, name, role')
            .eq('id', session.user.id)
            .single();
            
          console.log('User model data:', { userModel, userError });
            
          if (userError) {
            console.error('Error fetching user data:', userError);
            throw userError;
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

  // Check session on mount
  useEffect(() => {
    checkUserSession();
    
    // Set up visibility change handler to check session when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUserSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkUserSession]);

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
