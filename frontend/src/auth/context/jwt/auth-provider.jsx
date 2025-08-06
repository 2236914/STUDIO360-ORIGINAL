'use client';

import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

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
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (session && session.user) {
        setSession(session.access_token);
        // Optionally, fetch extra user info from user_model
        const { data: userModel, error: userError } = await supabase
          .from('user_model')
          .select('id, email, name, role')
          .eq('id', session.user.id)
          .single();
        setState({
          user: {
            id: session.user.id,
            email: session.user.email,
            displayName: userModel?.name || session.user.email,
            role: userModel?.role || '',
            photoURL: '', // You can add avatar logic here if needed
            accessToken: session.access_token,
          },
          loading: false,
        });
      } else {
        setState({ user: null, loading: false });
      }
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

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
