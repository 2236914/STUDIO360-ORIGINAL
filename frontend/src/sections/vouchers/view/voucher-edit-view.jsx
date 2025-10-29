'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { vouchersApi } from 'src/services/vouchersService';

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
        
        // Fetch voucher from database
        const voucherData = await vouchersApi.getVoucherById(id);
        
        if (!voucherData) {
          toast.error('Voucher not found');
          setCurrentVoucher(null);
          setLoading(false);
          return;
        }

        // Transform database data to match form structure
        const transformedVoucher = {
          id: voucherData.id,
          code: voucherData.code,
          name: voucherData.name,
          description: voucherData.description || '',
          type: voucherData.type,
          value: parseFloat(voucherData.discount_value || 0),
          minOrderAmount: parseFloat(voucherData.min_purchase_amount || 0),
          maxDiscount: voucherData.max_discount_amount ? parseFloat(voucherData.max_discount_amount) : '',
          usageLimit: voucherData.usage_limit || '',
          usageLimitPerUser: voucherData.usage_limit_per_user || 1,
          validFrom: voucherData.start_date,
          validUntil: voucherData.end_date,
          status: voucherData.status,
          isActive: voucherData.is_active,
          // Handle JSONB fields
          applicableTo: voucherData.applicable_product_ids ? 'products' : 
                       voucherData.applicable_category_ids ? 'categories' : 'all',
          applicableIds: voucherData.applicable_product_ids || 
                        voucherData.applicable_category_ids || [],
        };
        
        setCurrentVoucher(transformedVoucher);
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
