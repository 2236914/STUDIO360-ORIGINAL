import { supabase } from './supabaseClient';
import { setSession } from './utils';

export const signInWithPassword = async ({ email, password }) => {
  try {
    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const user = data.user;
    if (!user) throw new Error('No user returned from Supabase Auth');

    // Fetch user info from user_model by id
    const { data: userData, error: userError } = await supabase
      .from('user_model')
      .select('role, name, email')
      .eq('id', user.id)
      .single();
    if (userError || !userData) throw new Error('User info not found');

    // Store session and user info
    sessionStorage.setItem('user-email', userData.email);
    setSession(data.session?.access_token || '');
    sessionStorage.setItem('user-role', userData.role);
    sessionStorage.setItem('user-name', userData.name || '');
  } catch (error) {
    console.error('Error during sign in:', error);
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
    return { user };
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};