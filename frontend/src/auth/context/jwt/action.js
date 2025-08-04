'use client';

import { setSession } from './utils';
import { STORAGE_KEY } from './constant';

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }) => {
  try {
    // Validate credentials
    if (email === 'admin@studio360.com' && password === '@demo1') {
      // Admin login - create mock session
      const mockToken = `mock-admin-token-${Date.now()}`;
      sessionStorage.setItem('user-email', email);
      setSession(mockToken);
    } else if (email === 'seller@studio360.com' && password === '@demo1') {
      // Seller login - create mock session
      const mockToken = `mock-seller-token-${Date.now()}`;
      sessionStorage.setItem('user-email', email);
      setSession(mockToken);
    } else {
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ email, password, firstName, lastName }) => {
  try {
    // Mock sign up - just create a session like sign in
    const mockToken = `mock-signup-token-${Date.now()}`;
    sessionStorage.setItem('user-email', email);
    sessionStorage.setItem(STORAGE_KEY, mockToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    await setSession(null);
    // Clear user email from session storage
    sessionStorage.removeItem('user-email');
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
