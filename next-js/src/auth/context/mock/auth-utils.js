// ----------------------------------------------------------------------

export const signInWithPassword = async ({ email, password }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check credentials
  if (email === 'user@studio360.com' && password === '@demo1') {
    // Store login state in sessionStorage
    sessionStorage.setItem('mock-auth-logged-in', 'true');
    sessionStorage.setItem('mock-auth-email', email);
    
    return {
      user: {
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
      },
      accessToken: 'mock-access-token',
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

export const signUpWithPassword = async ({ email, password, firstName, lastName }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For mock purposes, only allow the specific user
  if (email === 'user@studio360.com' && password === '@demo1') {
    // Store login state in sessionStorage
    sessionStorage.setItem('mock-auth-logged-in', 'true');
    sessionStorage.setItem('mock-auth-email', email);
    
    return {
      user: {
        id: '8864c717-587d-472a-929a-8e5f298024da-0',
        displayName: `${firstName} ${lastName}`,
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
      },
      accessToken: 'mock-access-token',
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

export const signOut = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Clear sessionStorage
  sessionStorage.removeItem('mock-auth-logged-in');
  sessionStorage.removeItem('mock-auth-email');
  
  return { success: true };
}; 