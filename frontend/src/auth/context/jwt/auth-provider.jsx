'use client';

import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import { _mock } from 'src/_mock';

import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken, removeSession } from './utils';

// ----------------------------------------------------------------------

// Mock user data for demo purposes
const MOCK_USERS = {
  'seller@studio360.com': {
    id: 'seller-001',
    email: 'seller@studio360.com',
    displayName: 'Kitsch Studio',
    role: 'seller',
    photoURL: _mock.image.avatar(1),
  },
  'admin@studio360.com': {
    id: 'admin-001',
    email: 'admin@studio360.com',
    displayName: 'IT Admin',
    role: 'admin_it',
    photoURL: _mock.image.avatar(2),
  },
};

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    loading: true,
  });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        // Get user email from token or session storage
        const userEmail = sessionStorage.getItem('user-email');
        
        if (userEmail && MOCK_USERS[userEmail]) {
          const mockUser = MOCK_USERS[userEmail];
          
          setState({ 
            user: { 
              ...mockUser, 
              accessToken,
            }, 
            loading: false 
          });
        } else {
          // No valid user found, clear session
          removeSession();
          setState({ user: null, loading: false });
        }
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
