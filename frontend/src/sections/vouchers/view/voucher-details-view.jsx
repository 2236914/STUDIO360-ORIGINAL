'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { fCurrency, fPercent } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function VoucherDetailsView({ id }) {
  const router = useRouter();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setLoading(true);
        
        // Here you would make an API call to fetch the voucher
        // For now, we'll simulate with sample data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const sampleVoucher = {
          id: parseInt(id),
          code: 'WELCOME10',
          name: 'Welcome Discount',
          description: '10% off for new customers',
          type: 'percentage',
          value: 10,
          minOrderAmount: 50,
          maxDiscount: 20,
          usageLimit: 100,
          usedCount: 25,
          validFrom: '2024-01-01T00:00:00Z',
          validUntil: '2024-12-31T23:59:59Z',
          applicableTo: 'all',
          status: 'active',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z',
        };
        
        setVoucher(sampleVoucher);
      } catch (error) {
        console.error('Error fetching voucher:', error);
        toast.error('Failed to load voucher details');
        router.push(paths.dashboard.vouchers.root);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVoucher();
    }
  }, [id, router]);

  const handleBack = () => {
    router.push(paths.dashboard.vouchers.root);
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: { label: 'Active', color: 'success' },
      inactive: { label: 'Inactive', color: 'default' },
      expired: { label: 'Expired', color: 'error' },
      used: { label: 'Used', color: 'warning' },
    };
    return configs[status] || { label: status, color: 'default' };
  };

  const getTypeConfig = (type) => {
    const configs = {
      percentage: { label: 'Percentage Discount', color: 'primary' },
      fixed_amount: { label: 'Fixed Amount', color: 'secondary' },
      free_shipping: { label: 'Free Shipping', color: 'info' },
      buy_x_get_y: { label: 'Buy X Get Y', color: 'warning' },
    };
    return configs[type] || { label: type, color: 'default' };
  };

  const renderValue = () => {
    if (voucher.type === 'percentage') {
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 'fontWeightBold' }}>
            {fPercent(voucher.value)}
          </Typography>
          {voucher.maxDiscount && (
            <Typography variant="body2" color="text.secondary">
              (max {fCurrency(voucher.maxDiscount)})
            </Typography>
          )}
        </Stack>
      );
    }

    if (voucher.type === 'fixed_amount') {
      return (
        <Typography variant="h4" sx={{ fontWeight: 'fontWeightBold' }}>
          {fCurrency(voucher.value)}
        </Typography>
      );
    }

    if (voucher.type === 'free_shipping') {
      return (
        <Typography variant="h4" sx={{ fontWeight: 'fontWeightBold', color: 'success.main' }}>
          Free Shipping
        </Typography>
      );
    }

    return (
      <Typography variant="h4" sx={{ fontWeight: 'fontWeightBold' }}>
        {voucher.value}
      </Typography>
    );
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (!voucher) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Voucher not found"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Vouchers', href: paths.dashboard.vouchers.root },
            { name: 'Not found' },
          ]}
          action={
            <Button
              variant="text"
              color="inherit"
              onClick={handleBack}
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              sx={{ 
                color: 'text.primary',
                '&:hover': { bgcolor: 'transparent' }
              }}
            >
              Back
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />
      </DashboardContent>
    );
  }

  const statusConfig = getStatusConfig(voucher.status);
  const typeConfig = getTypeConfig(voucher.type);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={voucher.name}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vouchers', href: paths.dashboard.vouchers.root },
          { name: voucher.name },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              component={RouterLink}
              href={paths.dashboard.vouchers.edit(voucher.id)}
              variant="contained"
              startIcon={<Iconify icon="eva:edit-fill" />}
            >
              Edit
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={handleBack}
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              sx={{ 
                color: 'text.primary',
                '&:hover': { bgcolor: 'transparent' }
              }}
            >
              Back
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Voucher Code
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'fontWeightBold', fontFamily: 'monospace' }}>
                  {voucher.code}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {voucher.description || 'No description provided'}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Usage Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Used Count
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'fontWeightBold' }}>
                        {voucher.usedCount}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Usage Limit
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'fontWeightBold' }}>
                        {voucher.usageLimit || 'Unlimited'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                {voucher.usageLimit && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Usage Progress:
                      </Typography>
                      <Box sx={{ flex: 1, height: 8, bgcolor: 'grey.300', borderRadius: 0.5, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            width: `${(voucher.usedCount / voucher.usageLimit) * 100}%`,
                            height: '100%',
                            bgcolor: voucher.usedCount >= voucher.usageLimit ? 'error.main' : 'primary.main',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round((voucher.usedCount / voucher.usageLimit) * 100)}%
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Voucher Details
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Chip
                      variant="soft"
                      label={typeConfig.label}
                      color={typeConfig.color}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      variant="soft"
                      label={statusConfig.label}
                      color={statusConfig.color}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Value
                    </Typography>
                    {renderValue()}
                  </Box>

                  {voucher.minOrderAmount > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Minimum Order Amount
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'fontWeightMedium' }}>
                        {fCurrency(voucher.minOrderAmount)}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Valid From
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'fontWeightMedium' }}>
                      {fDate(voucher.validFrom)}
                    </Typography>
                  </Box>

                  {voucher.validUntil && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Valid Until
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'fontWeightMedium' }}>
                        {fDate(voucher.validUntil)}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Applicable To
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'fontWeightMedium', textTransform: 'capitalize' }}>
                      {voucher.applicableTo.replace('_', ' ')}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'fontWeightMedium' }}>
                      {fDate(voucher.createdAt)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'fontWeightMedium' }}>
                      {fDate(voucher.updatedAt)}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
