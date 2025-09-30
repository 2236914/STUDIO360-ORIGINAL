'use client';

import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { VoucherNewEditForm } from '../voucher-new-edit-form';

// ----------------------------------------------------------------------

export function VoucherEditView({ id }) {
  const router = useRouter();
  const [currentVoucher, setCurrentVoucher] = useState(null);
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
        
        setCurrentVoucher(sampleVoucher);
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

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (!currentVoucher) {
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

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit voucher"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vouchers', href: paths.dashboard.vouchers.root },
          { name: currentVoucher.name },
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

      <VoucherNewEditForm currentVoucher={currentVoucher} />
    </DashboardContent>
  );
}
