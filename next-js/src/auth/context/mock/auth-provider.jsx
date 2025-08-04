'use client';

import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    loading: true,
  });

  const checkUserSession = useCallback(async () => {
    try {
      // Check if user is logged in from sessionStorage
      const isLoggedIn = sessionStorage.getItem('mock-auth-logged-in');
      const userEmail = sessionStorage.getItem('mock-auth-email');
      
      if (isLoggedIn && userEmail === 'user@studio360.com') {
        const mockUser = {
          id: '8864c717-587d-472a-929a-8e5f298024da-0',
          displayName: 'Jaydon Frankie',
          email: 'user@studio360.com',
          photoURL: '/assets/images/avatar/avatar_default.jpg',
          phoneNumber: '+1 234 567 8900',
          country: 'United States',
          address: '90210 Broadway Blvd',
          state: 'California',
          city: 'San Francisco',
          zipCode: '94116',
          about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.',
          role: 'user',
          isPublic: true,
          accessToken: 'mock-access-token',
        };
        
        setState({ user: mockUser, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
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
      user: state.user
        ? {
            ...state.user,
            role: state.user?.role ?? 'user',
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
} 