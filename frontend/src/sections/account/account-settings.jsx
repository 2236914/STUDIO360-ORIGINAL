import { useForm } from 'react-hook-form';
import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { useAuthContext } from 'src/auth/hooks';
import { supabase } from 'src/auth/context/jwt/supabaseClient';

// ----------------------------------------------------------------------

export function AccountSettings() {
  const { user } = useAuthContext();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Password Change Form
  const passwordMethods = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Email Change Form
  const emailMethods = useForm({
    defaultValues: {
      currentEmail: user?.email || '',
      newEmail: '',
      confirmEmail: '',
      password: '',
    },
  });

  // Update email when user changes
  useEffect(() => {
    if (user?.email) {
      emailMethods.setValue('currentEmail', user.email);
    }
  }, [user?.email, emailMethods]);

  const handleChangePassword = useCallback(async (data) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      if (data.newPassword.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      setPasswordLoading(true);

      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        throw error;
      }

      passwordMethods.reset();
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  }, [passwordMethods]);

  const handleChangeEmail = useCallback(async (data) => {
    try {
      if (data.newEmail !== data.confirmEmail) {
        toast.error('New email addresses do not match');
        return;
      }

      if (!data.newEmail.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }

      setEmailLoading(true);

      // Update email using Supabase
      const { error } = await supabase.auth.updateUser({
        email: data.newEmail
      });

      if (error) {
        throw error;
      }

      emailMethods.reset({
        currentEmail: data.newEmail,
        newEmail: '',
        confirmEmail: '',
        password: '',
      });
      toast.success('Email change request sent! Please check your new email for verification.');
    } catch (error) {
      console.error('Email change error:', error);
      toast.error(error.message || 'Failed to change email');
    } finally {
      setEmailLoading(false);
    }
  }, [emailMethods]);

  const handleSendPasswordReset = useCallback(async () => {
    try {
      const currentEmail = emailMethods.getValues('currentEmail');
      setResetLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(currentEmail, {
        redirectTo: `${window.location.origin}/auth/jwt/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast.success(`Password reset link sent to ${currentEmail}`);
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setResetLoading(false);
    }
  }, [emailMethods]);

  const handleSendEmailVerification = useCallback(async () => {
    try {
      setVerifyLoading(true);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email || emailMethods.getValues('currentEmail'),
      });

      if (error) {
        throw error;
      }

      toast.success(`Verification link sent to ${user?.email || emailMethods.getValues('currentEmail')}`);
    } catch (error) {
      console.error('Email verification error:', error);
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setVerifyLoading(false);
    }
  }, [emailMethods, user?.email]);

  return (
    <Stack spacing={3}>
      {/* Password Change Section */}
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Iconify icon="solar:lock-password-bold" width={32} sx={{ color: 'primary.main' }} />
            <Stack>
              <Typography variant="h6">Change Password</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Update your password to keep your account secure
              </Typography>
            </Stack>
          </Stack>

          <Form methods={passwordMethods} onSubmit={passwordMethods.handleSubmit(handleChangePassword)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Field.Text
                  name="currentPassword"
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          <Iconify
                            icon={showCurrentPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Field.Text
                  name="newPassword"
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          <Iconify
                            icon={showNewPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field.Text
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          <Iconify
                            icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <LoadingButton
                    variant="outlined"
                    onClick={handleSendPasswordReset}
                    loading={resetLoading}
                    startIcon={<Iconify icon="solar:letter-bold" />}
                  >
                    Send Reset Link
                  </LoadingButton>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={passwordLoading}
                    startIcon={<Iconify icon="solar:lock-password-bold" />}
                  >
                    Change Password
                  </LoadingButton>
                </Stack>
              </Grid>
            </Grid>
          </Form>
        </Box>
      </Card>

      {/* Email Change Section */}
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Iconify icon="solar:letter-bold" width={32} sx={{ color: 'info.main' }} />
            <Stack>
              <Typography variant="h6">Change Email Address</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Update your primary email address for account communications
              </Typography>
            </Stack>
          </Stack>

          <Form methods={emailMethods} onSubmit={emailMethods.handleSubmit(handleChangeEmail)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Field.Text
                  name="currentEmail"
                  label="Current Email Address"
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:letter-bold" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field.Text
                  name="newEmail"
                  label="New Email Address"
                  placeholder="newemail@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:letter-bold" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Field.Text
                  name="confirmEmail"
                  label="Confirm New Email"
                  placeholder="newemail@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:letter-bold" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Field.Text
                  name="password"
                  label="Current Password (for verification)"
                  type="password"
                  placeholder="Enter your current password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:lock-password-bold" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <LoadingButton
                    variant="outlined"
                    onClick={handleSendEmailVerification}
                    loading={verifyLoading}
                    startIcon={<Iconify icon="solar:verified-check-bold" />}
                  >
                    Verify Current Email
                  </LoadingButton>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={emailLoading}
                    startIcon={<Iconify icon="solar:letter-bold" />}
                  >
                    Change Email
                  </LoadingButton>
                </Stack>
              </Grid>
            </Grid>
          </Form>
        </Box>
      </Card>

      {/* Security Information */}
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'success.main', bgcolor: 'success.lighter' }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="flex-start" spacing={2}>
            <Iconify icon="solar:shield-check-bold" sx={{ color: 'success.main', mt: 0.5 }} />
            <Stack>
              <Typography variant="subtitle2" sx={{ color: 'success.dark' }}>
                Security Best Practices
              </Typography>
              <Typography variant="body2" sx={{ color: 'success.dark', mt: 1 }}>
                Follow these guidelines to keep your account secure:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2, color: 'success.dark' }}>
                <li>Use a strong password with at least 8 characters</li>
                <li>Include uppercase, lowercase, numbers, and special characters</li>
                <li>Don't reuse passwords from other accounts</li>
                <li>Update your password regularly (every 3-6 months)</li>
                <li>Keep your email address up to date for security notifications</li>
                <li>Log out from shared or public computers</li>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Card>

      {/* Account Deletion Section */}
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'error.main', bgcolor: 'error.lighter' }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="flex-start" spacing={2}>
            <Iconify icon="solar:danger-bold" sx={{ color: 'error.main', mt: 0.5 }} />
            <Stack sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'error.dark' }}>
                Danger Zone
              </Typography>
              <Typography variant="body2" sx={{ color: 'error.dark', mt: 1, mb: 2 }}>
                Once you delete your account, there is no going back. Please be certain.
                All your data, including shop information, orders, and customer data will be permanently deleted.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                onClick={() => {
                  toast.error('Account deletion is not available in demo mode');
                }}
                sx={{ alignSelf: 'flex-start' }}
              >
                Delete Account
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Card>
    </Stack>
  );
}
