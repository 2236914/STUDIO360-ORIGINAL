'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { supabase } from 'src/auth/context/jwt/supabaseClient';

// ----------------------------------------------------------------------

const ForgotPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Must be a valid email' }),
});

export function JwtForgotPasswordView() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const methods = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}${paths.auth.jwt.resetPassword}`,
      });

      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg(error.message || 'Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Stack spacing={3} sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Forgot Password
      </Typography>

      {errorMsg && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorMsg}
        </Typography>
      )}

      {isSubmitted ? (
        <Stack spacing={2}>
          <Typography>
            We've sent a password reset link to your email. Please check your inbox.
          </Typography>
          <Link
            component={RouterLink}
            href={paths.auth.jwt.signIn}
            color="inherit"
            variant="subtitle2"
            sx={{
              mt: 3,
              mx: 'auto',
              alignItems: 'center',
              display: 'inline-flex',
            }}
          >
            Back to sign in
          </Link>
        </Stack>
      ) : (
        <form onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Email address</Typography>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                {...methods.register('email')}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: errors.email ? '1px solid red' : '1px solid #ccc',
                  width: '100%',
                }}
              />
              {errors.email && (
                <Typography color="error" variant="caption">
                  {errors.email.message}
                </Typography>
              )}
            </Stack>

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Send Reset Link
            </LoadingButton>

            <Link
              component={RouterLink}
              href={paths.auth.jwt.signIn}
              color="inherit"
              variant="subtitle2"
              sx={{
                mt: 3,
                mx: 'auto',
                alignItems: 'center',
                display: 'inline-flex',
              }}
            >
              Back to sign in
            </Link>
          </Stack>
        </form>
      )}
    </Stack>
  );
}
