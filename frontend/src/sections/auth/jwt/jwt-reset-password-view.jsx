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

const ResetPasswordSchema = zod.object({
  password: zod
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
  confirmPassword: zod.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function JwtResetPasswordView({ token }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
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
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg(error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isSuccess) {
    return (
      <Stack spacing={3} sx={{ maxWidth: 400, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Password Updated
        </Typography>
        <Typography>
          Your password has been updated successfully. You can now sign in with your new password.
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
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Reset Password
      </Typography>

      {errorMsg && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errorMsg}
        </Typography>
      )}

      <form onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="subtitle2">New Password</Typography>
            <input
              name="password"
              type="password"
              placeholder="Enter your new password"
              {...methods.register('password')}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: errors.password ? '1px solid red' : '1px solid #ccc',
                width: '100%',
                marginBottom: '8px',
              }}
            />
            {errors.password && (
              <Typography color="error" variant="caption">
                {errors.password.message}
              </Typography>
            )}
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2">Confirm New Password</Typography>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              {...methods.register('confirmPassword')}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: errors.confirmPassword ? '1px solid red' : '1px solid #ccc',
                width: '100%',
              }}
            />
            {errors.confirmPassword && (
              <Typography color="error" variant="caption">
                {errors.confirmPassword.message}
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
            Reset Password
          </LoadingButton>

          <Link
            component={RouterLink}
            href={paths.auth.jwt.signIn}
            color="inherit"
            variant="subtitle2"
            sx={{
              mt: 1,
              mx: 'auto',
              alignItems: 'center',
              display: 'inline-flex',
            }}
          >
            Back to sign in
          </Link>
        </Stack>
      </form>
    </Stack>
  );
}
