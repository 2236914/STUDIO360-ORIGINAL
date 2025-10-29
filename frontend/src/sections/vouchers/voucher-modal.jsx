'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { vouchersApi } from 'src/services/vouchersService';

import { VoucherNewEditForm } from './voucher-new-edit-form';
import { VoucherDetailsView } from './view/voucher-details-view';

// ----------------------------------------------------------------------

export function VoucherModal({ 
  open, 
  onClose, 
  mode = 'create', // 'create', 'edit', 'view'
  voucherId = null,
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [voucherData, setVoucherData] = useState(null);

  // Fetch voucher data for edit mode
  useEffect(() => {
    const fetchVoucherData = async () => {
      if (mode === 'edit' && voucherId && open) {
        try {
          setLoading(true);
          const voucher = await vouchersApi.getVoucherById(voucherId);
          
          // Transform database data to match form structure
          const transformedVoucher = {
            id: voucher.id,
            name: voucher.name,
            code: voucher.code,
            description: voucher.description || '',
            type: voucher.type,
            value: parseFloat(voucher.discount_value || 0),
            discount_value: voucher.discount_value,
            minOrderAmount: parseFloat(voucher.min_purchase_amount || 0),
            maxDiscount: voucher.max_discount_amount ? parseFloat(voucher.max_discount_amount) : '',
            usageLimit: voucher.usage_limit || '',
            validFrom: voucher.start_date ? new Date(voucher.start_date) : new Date(),
            validUntil: voucher.end_date ? new Date(voucher.end_date) : undefined,
            applicableTo: voucher.applicable_product_ids ? 'products' : (voucher.applicable_category_ids ? 'categories' : 'all'),
            applicableIds: voucher.applicable_product_ids || voucher.applicable_category_ids || [],
            status: voucher.status,
            is_active: voucher.is_active,
            created_at: voucher.created_at,
            createdAt: voucher.created_at,
          };
          
          setVoucherData(transformedVoucher);
        } catch (error) {
          console.error('Error fetching voucher:', error);
          setVoucherData(null);
        } finally {
          setLoading(false);
        }
      } else {
        setVoucherData(null);
      }
    };

    fetchVoucherData();
  }, [mode, voucherId, open]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    handleClose();
  };

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Voucher';
      case 'edit':
        return 'Edit Voucher';
      case 'view':
        return 'Voucher Details';
      default:
        return 'Voucher';
    }
  };

  const getMaxWidth = () => {
    switch (mode) {
      case 'view':
        return 'lg';
      case 'create':
      case 'edit':
        return 'xl';
      default:
        return 'md';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={getMaxWidth()}
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '95vh',
          height: mode === 'view' ? '90vh' : 'auto',
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {getTitle()}
          <IconButton 
            onClick={handleClose}
            disabled={loading}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {mode === 'view' && voucherId && (
          <VoucherDetailsView id={voucherId} isModal onClose={handleClose} />
        )}
        
        {(mode === 'create' || mode === 'edit') && (
          <Box sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : (
              <VoucherNewEditForm 
                currentVoucher={mode === 'edit' ? voucherData : null}
                isModal
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
