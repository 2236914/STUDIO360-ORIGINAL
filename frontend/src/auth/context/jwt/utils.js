import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import { STORAGE_KEY } from './constant';
import { supabase } from './supabaseClient';

// ----------------------------------------------------------------------

export function jwtDecode(token) {
  try {
    if (!token) return null;

    // Handle mock tokens for demo
    if (token.startsWith('mock-')) {
      return {
        exp: Date.now() / 1000 + (24 * 60 * 60), // 24 hours from now
        email: sessionStorage.getItem('user-email'),
      };
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken) {
  if (!accessToken) {
    return false;
  }
  
  // Check if session is marked as active
  try {
    const sessionData = localStorage.getItem(STORAGE_KEY);
    if (sessionData) {
      const { isActive } = JSON.parse(sessionData);
      if (isActive === false) {
        return false;
      }
    }
  } catch (error) {
    console.error('Error checking session status:', error);
    return false;
  }

  try {
    // Handle mock tokens for demo
    if (accessToken.startsWith('mock-')) {
      return true; // Mock tokens are always valid for demo
    }

    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// ----------------------------------------------------------------------

export function tokenExpired(exp) {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  setTimeout(() => {
    try {
      alert('Token expired!');
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.href = paths.auth.jwt.signIn;
    } catch (error) {
      console.error('Error during token expiration:', error);
      throw error;
    }
  }, timeLeft);
}

// ----------------------------------------------------------------------

export async function setSession(accessToken) {
  console.log('setSession called with token:', accessToken ? 'Token exists' : 'No token');
  
  try {
    if (accessToken) {
      console.log('Storing token in localStorage...');
      // Store token in localStorage with a timestamp
      const sessionData = {
        token: accessToken,
        timestamp: new Date().getTime(),
        isActive: true
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      console.log('Token stored in localStorage');
      
      // Set axios default auth header
      console.log('Setting axios auth header...');
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      console.log('Axios auth header set');

      // Handle mock tokens for demo
      if (accessToken.startsWith('mock-')) {
        console.log('Using mock token, skipping expiration check');
        return;
      }

      console.log('Decoding token...');
      const decodedToken = jwtDecode(accessToken);
      console.log('Token decoded successfully');

      if (decodedToken && 'exp' in decodedToken) {
        console.log('Setting up token expiration check...');
        tokenExpired(decodedToken.exp);
        console.log('Token expiration check set up');
      } else {
        console.warn('No expiration in token');
      }
    } else {
      console.log('No access token provided, removing session');
      await removeSession();
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

export async function removeSession() {
  console.log('removeSession called');

  try {
    // Clear all auth-related data from storage
    const keysToRemove = [
      STORAGE_KEY,
      'user-email',
      'user-role',
      'user-name',
      // Legacy keys that might exist from older implementations
      'sb-access-token',
      'sb-refresh-token',
      'sb-auth-token',
      'sb-auth-token-code-verifier',
      // Supabase v2 default key
      '@supabase.auth.token',
    ];

    // Also remove project-scoped Supabase key: sb-<project-ref>-auth-token
    try {
      const supabaseUrl = supabase?.supabaseUrl || '';
      const match = supabaseUrl.match(/^https?:\/\/([^.]+)\./);
      const projectRef = match && match[1] ? match[1] : null;
      if (projectRef) {
        keysToRemove.push(`sb-${projectRef}-auth-token`);
      }
    } catch (e) {
      // ignore parsing issues
    }

    keysToRemove.forEach((key) => {
      try { localStorage.removeItem(key); } catch (_) {}
      try { sessionStorage.removeItem(key); } catch (_) {}
    });

    // Clear axios headers
    console.log('Clearing axios auth header...');
    delete axios.defaults.headers.common.Authorization;

    // Intentionally DO NOT call supabase.auth.signOut() here to avoid races.
    // Sign-out network calls should be handled by the caller (e.g., logout()).
  } catch (error) {
    console.error('Error during remove session:', error);
    throw error;
  }
}
