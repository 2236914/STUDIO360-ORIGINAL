'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export default function ToastDemoPage() {
  const [loading, setLoading] = useState(false);

  // Create actions
  const handleCreateSuccess = () => {
    toast.success('Item created successfully!');
  };

  const handleCreateError = () => {
    toast.error('Failed to create item. Please try again.');
  };

  const handleCreateInfo = () => {
    toast.info('Creating new item...');
  };

  const handleCreateWarning = () => {
    toast.warning('Item name is required before creating.');
  };

  // Update actions
  const handleUpdateSuccess = () => {
    toast.success('Item updated successfully!');
  };

  const handleUpdateError = () => {
    toast.error('Failed to update item. Please try again.');
  };

  const handleUpdateInfo = () => {
    toast.info('Updating item...');
  };

  const handleUpdateWarning = () => {
    toast.warning('No changes detected to update.');
  };

  // Delete actions
  const handleDeleteSuccess = () => {
    toast.success('Item deleted successfully!');
  };

  const handleDeleteError = () => {
    toast.error('Failed to delete item. Please try again.');
  };

  const handleDeleteInfo = () => {
    toast.info('Deleting item...');
  };

  const handleDeleteWarning = () => {
    toast.warning('This action cannot be undone.');
  };

  // Promise-based actions
  const handleCreateWithPromise = async () => {
    setLoading(true);
    
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve('Item created successfully!');
        } else {
          reject('Failed to create item');
        }
      }, 2000);
    });

    toast.promise(promise, {
      loading: 'Creating item...',
      success: (data) => data,
      error: (err) => err,
    });

    try {
      await promise;
    } catch (error) {
      // Error is handled by toast.promise
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWithPromise = async () => {
    setLoading(true);
    
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve('Item updated successfully!');
        } else {
          reject('Failed to update item');
        }
      }, 2000);
    });

    toast.promise(promise, {
      loading: 'Updating item...',
      success: (data) => data,
      error: (err) => err,
    });

    try {
      await promise;
    } catch (error) {
      // Error is handled by toast.promise
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWithPromise = async () => {
    setLoading(true);
    
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve('Item deleted successfully!');
        } else {
          reject('Failed to delete item');
        }
      }, 2000);
    });

    toast.promise(promise, {
      loading: 'Deleting item...',
      success: (data) => data,
      error: (err) => err,
    });

    try {
      await promise;
    } catch (error) {
      // Error is handled by toast.promise
    } finally {
      setLoading(false);
    }
  };

  // Custom toast actions
  const handleCustomToast = () => {
    toast('This is a custom toast message', {
      description: 'With additional description text',
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo clicked'),
      },
    });
  };

  const handleToastWithIcon = () => {
    toast.success('Custom icon toast!', {
      icon: '🎉',
      description: 'This toast has a custom emoji icon',
    });
  };

  const handleDismissibleToast = () => {
    toast.success('This toast will auto-dismiss in 10 seconds', {
      duration: 10000,
      description: 'You can also manually dismiss it',
    });
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Toast Demo"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Toast Demo' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.root}
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back to Dashboard
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        {/* Create Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Iconify 
                  icon="mingcute:add-line" 
                  width={48} 
                  sx={{ color: 'success.main', mb: 1 }} 
                />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Create Actions
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Toast messages for creating new items
                </Typography>
              </Box>

              <Divider />

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={handleCreateSuccess}
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                >
                  Success Toast
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleCreateError}
                  startIcon={<Iconify icon="solar:danger-bold" />}
                >
                  Error Toast
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="info"
                  onClick={handleCreateInfo}
                  startIcon={<Iconify icon="solar:info-circle-bold" />}
                >
                  Info Toast
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  onClick={handleCreateWarning}
                  startIcon={<Iconify icon="solar:danger-triangle-bold" />}
                >
                  Warning Toast
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleCreateWithPromise}
                  disabled={loading}
                  startIcon={<Iconify icon="solar:clock-circle-bold" />}
                >
                  Promise Toast
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* Update Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Iconify 
                  icon="solar:pen-bold" 
                  width={48} 
                  sx={{ color: 'info.main', mb: 1 }} 
                />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Update Actions
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Toast messages for updating existing items
                </Typography>
              </Box>

              <Divider />

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={handleUpdateSuccess}
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                >
                  Success Toast
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleUpdateError}
                  startIcon={<Iconify icon="solar:danger-bold" />}
                >
                  Error Toast
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="info"
                  onClick={handleUpdateInfo}
                  startIcon={<Iconify icon="solar:info-circle-bold" />}
                >
                  Info Toast
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  onClick={handleUpdateWarning}
                  startIcon={<Iconify icon="solar:danger-triangle-bold" />}
                >
                  Warning Toast
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateWithPromise}
                  disabled={loading}
                  startIcon={<Iconify icon="solar:clock-circle-bold" />}
                >
                  Promise Toast
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* Delete Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Iconify 
                  icon="solar:trash-bin-trash-bold" 
                  width={48} 
                  sx={{ color: 'error.main', mb: 1 }} 
                />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Delete Actions
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Toast messages for deleting items
                </Typography>
              </Box>

              <Divider />

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={handleDeleteSuccess}
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                >
                  Success Toast
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteError}
                  startIcon={<Iconify icon="solar:danger-bold" />}
                >
                  Error Toast
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="info"
                  onClick={handleDeleteInfo}
                  startIcon={<Iconify icon="solar:info-circle-bold" />}
                >
                  Info Toast
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  onClick={handleDeleteWarning}
                  startIcon={<Iconify icon="solar:danger-triangle-bold" />}
                >
                  Warning Toast
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleDeleteWithPromise}
                  disabled={loading}
                  startIcon={<Iconify icon="solar:clock-circle-bold" />}
                >
                  Promise Toast
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* Custom Toast Actions */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Iconify 
                  icon="solar:magic-stick-bold" 
                  width={48} 
                  sx={{ color: 'primary.main', mb: 1 }} 
                />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Custom Toast Actions
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Advanced toast configurations and customizations
                </Typography>
              </Box>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCustomToast}
                    startIcon={<Iconify icon="solar:magic-stick-bold" />}
                  >
                    Custom Toast
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleToastWithIcon}
                    startIcon={<Iconify icon="solar:emoji-funny-bold" />}
                  >
                    Custom Icon
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleDismissibleToast}
                    startIcon={<Iconify icon="solar:clock-circle-bold" />}
                  >
                    Auto-dismiss
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      toast.success('Multiple toasts!', { duration: 3000 });
                      setTimeout(() => toast.info('Second toast!', { duration: 3000 }), 500);
                      setTimeout(() => toast.warning('Third toast!', { duration: 3000 }), 1000);
                    }}
                    startIcon={<Iconify icon="solar:layers-bold" />}
                  >
                    Multiple Toasts
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </Card>
        </Grid>

        {/* Toast Information */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ color: 'text.primary' }}>
                Toast Component Features
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                      Available Methods:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      • toast.success() - Green success messages<br/>
                      • toast.error() - Red error messages<br/>
                      • toast.warning() - Orange warning messages<br/>
                      • toast.info() - Blue info messages<br/>
                      • toast() - Default toast messages<br/>
                      • toast.promise() - Promise-based toasts
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                      Customization Options:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      • Custom icons and emojis<br/>
                      • Action buttons (Undo, etc.)<br/>
                      • Auto-dismiss timing<br/>
                      • Multiple toast positions<br/>
                      • Promise-based loading states
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
