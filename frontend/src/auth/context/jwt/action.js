import { supabase } from './supabaseClient';
import { setSession, removeSession } from './utils';

export const signInWithPassword = async ({ email, password }) => {
  console.log('Starting signInWithPassword with email:', email);
  
  try {
    // Authenticate with Supabase Auth
    console.log('Calling supabase.auth.signInWithPassword...');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    console.log('Supabase auth response:', { data, error });
    
    if (error) {
      console.error('Supabase auth error:', error);
      throw new Error(error.message || 'Authentication failed');
    }
    
    const user = data?.user;
    if (!user) {
      console.error('No user returned from Supabase Auth');
      throw new Error('No user returned from authentication');
    }
    
    console.log('User authenticated, fetching user data...');

    // Fetch user info from user_model by id
    const { data: userData, error: userError } = await supabase
      .from('user_model')
      .select('role, name, email')
      .eq('id', user.id)
      .single();
      
    console.log('User data from user_model:', { userData, userError });
    
    if (userError || !userData) {
      console.error('User info not found in user_model');
      throw new Error('User information not found');
    }

    // Store session and user info in localStorage
    console.log('Storing user data in localStorage...');
    localStorage.setItem('user-email', userData.email);
    localStorage.setItem('user-role', userData.role);
    localStorage.setItem('user-name', userData.name || '');
    
    // Set the session with the access token
    const accessToken = data.session?.access_token;
    console.log('Setting session with access token:', accessToken ? 'Token exists' : 'No token');
    
    if (accessToken) {
      await setSession(accessToken);
      console.log('Session set successfully');
    } else {
      console.warn('No access token in session data');
    }
    
    return { user, session: data.session };
  } catch (error) {
    console.error('Error during sign in:', error);
    // Ensure we clean up on error
    try {
      await removeSession();
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    throw error;
  }
};

// New: Sign up with Supabase Auth and insert extra info in user_modelexport const signUpWithPassword = async ({ email, password, name, role = 'user' }) => {
  try {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    const user = data.user;
    if (!user) throw new Error('No user returned from Supabase Auth');

    // Insert extra info into user_model
    const { error: insertError } = await supabase.from('user_model').insert([
      {
        id: user.id, // Link to Supabase Auth user
        email: user.email,
        name,
        role,
      }
    ]);
    if (insertError) throw new Error(insertError.message);
    // Store user info in localStorage
    localStorage.setItem('user-email', user.email);
    localStorage.setItem('user-role', role);
    localStorage.setItem('user-name', name || '');
    
    // Set the session with the access token if available
    if (data.session?.access_token) {
      await setSession(data.session.access_token);
    }
    
    return { user };
  } catch (error) {
    console.error('Error during sign up:', error);
    // Clean up on error
    await removeSession();
    throw error;
  }
};