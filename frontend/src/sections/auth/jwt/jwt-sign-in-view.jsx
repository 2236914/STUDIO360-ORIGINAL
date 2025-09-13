'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';
import { signInWithPassword } from 'src/auth/context/jwt';
import { setSession, removeSession } from 'src/auth/context/jwt/utils';
import { supabase } from 'src/auth/context/jwt/supabaseClient';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('Starting sign in process...');
      setErrorMsg('');
      
      // Clear any existing session data
      console.log('Clearing existing session...');
      await removeSession();
      
      // Perform the sign in
      console.log('Attempting to sign in with:', { email: data.email });
      const signInResult = await signInWithPassword({ email: data.email, password: data.password });
      console.log('Sign in result:', signInResult);
      
      // Verify the session was created
      console.log('Verifying session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Session data:', sessionData);
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to create session. Please try again.');
      }
      
      if (!sessionData?.session) {
        console.error('No session data received');
        throw new Error('No session data received from server');
      }
      
      // Update the auth state
      console.log('Updating auth state...');
      await checkUserSession?.();
      
      // Redirect to the dashboard
      console.log('Redirecting to dashboard...');
      router.push(paths.dashboard.root);
      
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Clear any partial session data
      try {
        await removeSession();
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
      
      // Set user-friendly error message
      let errorMessage = 'Failed to sign in. Please check your credentials and try again.';
      
      if (error?.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        console.error('Error details:', error.stack);
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = String(error.message);
      }
      
      console.log('Displaying error to user:', errorMessage);
      setErrorMsg(errorMessage);
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" />
      <Typography variant="h5">Sign in to your account</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {`Don't have an account?`}
        </Typography>

        <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2">
          Get started
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        name="email"
        label="Email address"
        placeholder="Enter your email"
        InputLabelProps={{ shrink: true }}
      />

      <Stack spacing={1.5}>
        <Field.Text
          name="password"
          label="Password"
          placeholder="Enter your password"
          type={password.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" justifyContent="flex-end">
          <Link
            component={RouterLink}
            href={paths.auth.jwt.forgotPassword}
            variant="subtitle2"
            color="inherit"
            underline="hover"
            sx={{ alignSelf: 'flex-end' }}
          >
            Forgot password?
          </Link>
        </Stack>
      </Stack>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Sign in..."
      >
        Sign in
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>
    </>
  );
}
