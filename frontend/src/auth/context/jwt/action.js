import { supabase } from './supabaseClient';
import { setSession, removeSession } from './utils';

// Map Supabase/Gotrue auth errors to a stable, user-friendly shape
function normalizeAuthError(err) {
  const raw = typeof err === 'string' ? err : err?.message || '';
  const lower = raw.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('email or password')) {
    return { code: 'invalid_credentials', message: 'Invalid email or password. Please try again.' };
  }
  if (lower.includes('email not confirmed')) {
    return { code: 'email_not_confirmed', message: 'Please confirm your email before signing in.' };
  }
  if (lower.includes('rate limit')) {
    return { code: 'rate_limited', message: 'Too many attempts. Please wait a moment and try again.' };
  }
  return { code: 'auth_error', message: raw || 'Authentication failed. Please try again.' };
}

export const signInWithPassword = async ({ email, password }) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('signInWithPassword()', { email });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const friendly = normalizeAuthError(error);
      return { ok: false, ...friendly };
    }

    const user = data?.user;
    if (!user) {
      return { ok: false, code: 'no_user', message: 'Authentication failed. Please try again.' };
    }

    // Fetch user info from user_model by id
    const { data: userData, error: userError } = await supabase
      .from('user_model')
      .select('role, name, email')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        ok: false,
        code: 'user_not_provisioned',
        message: 'Account is not provisioned. Please contact the administrator.',
      };
    }

    // Store session and user info in localStorage
    try {
      localStorage.setItem('user-email', userData.email);
      localStorage.setItem('user-role', userData.role);
      localStorage.setItem('user-name', userData.name || '');
    } catch (_) {
      // ignore storage issues (SSR/non-browser), not fatal to auth flow
    }

    // Set the session with the access token
    const accessToken = data.session?.access_token;
    if (accessToken) {
      await setSession(accessToken);
    }

    return { ok: true, user, session: data.session, userData };
  } catch (error) {
    // Ensure we clean up on unexpected errors
    try {
      await removeSession();
    } catch (_) {
      // noop
    }
    const friendly = normalizeAuthError(error);
    return { ok: false, ...friendly };
  }
};

// New: Sign up with Supabase Auth and insert extra info in user_model
export const signUpWithPassword = async ({ email, password, name, role = 'user' }) => {
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