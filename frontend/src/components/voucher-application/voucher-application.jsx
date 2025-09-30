'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export function VoucherApplication({ 
  onVoucherApplied, 
  orderAmount, 
  appliedVoucher,
  onRemoveVoucher 
}) {
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setError('Please enter a voucher code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Here you would make an API call to validate the voucher
      // For now, we'll simulate with sample validation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate voucher validation
      const mockVoucher = {
        id: 1,
        code: voucherCode.toUpperCase(),
        name: 'Welcome Discount',
        type: 'percentage',
        value: 10,
        discount: (orderAmount * 10) / 100,
        isFreeShipping: false,
      };

      // Validate voucher code
      if (voucherCode.toUpperCase() === 'WELCOME10') {
        onVoucherApplied(mockVoucher);
        setVoucherCode('');
        toast.success('Voucher applied successfully!');
      } else if (voucherCode.toUpperCase() === 'SAVE20') {
        const fixedVoucher = {
          ...mockVoucher,
          name: 'Save $20',
          type: 'fixed_amount',
          value: 20,
          discount: Math.min(20, orderAmount),
        };
        onVoucherApplied(fixedVoucher);
        setVoucherCode('');
        toast.success('Voucher applied successfully!');
      } else if (voucherCode.toUpperCase() === 'FREESHIP') {
        const freeShippingVoucher = {
          ...mockVoucher,
          name: 'Free Shipping',
          type: 'free_shipping',
          value: 0,
          discount: 0,
          isFreeShipping: true,
        };
        onVoucherApplied(freeShippingVoucher);
        setVoucherCode('');
        toast.success('Free shipping voucher applied!');
      } else {
        setError('Invalid voucher code');
      }
    } catch (error) {
      console.error('Error applying voucher:', error);
      setError('Failed to apply voucher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    onRemoveVoucher();
    toast.success('Voucher removed');
  };

  const renderAppliedVoucher = () => {
    if (!appliedVoucher) return null;

    return (
      <Alert
        severity="success"
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={handleRemoveVoucher}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle2">
            Voucher Applied: {appliedVoucher.code}
          </Typography>
          <Typography variant="body2">
            {appliedVoucher.name}
          </Typography>
          {appliedVoucher.isFreeShipping ? (
            <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
              Free shipping applied
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
              Discount: {appliedVoucher.type === 'percentage' 
                ? `${appliedVoucher.value}% off` 
                : `${fCurrency(appliedVoucher.value)} off`
              }
            </Typography>
          )}
        </Stack>
      </Alert>
    );
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Apply Voucher
      </Typography>

      {renderAppliedVoucher()}

      {!appliedVoucher && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              placeholder="Enter voucher code"
              value={voucherCode}
              onChange={(e) => {
                setVoucherCode(e.target.value.toUpperCase());
                setError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleApplyVoucher();
                }
              }}
              error={!!error}
              helperText={error}
            />
            <Button
              variant="contained"
              onClick={handleApplyVoucher}
              loading={loading}
              disabled={!voucherCode.trim() || loading}
              sx={{ minWidth: 100 }}
            >
              Apply
            </Button>
          </Stack>

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Try these sample codes:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label="WELCOME10"
                size="small"
                onClick={() => setVoucherCode('WELCOME10')}
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label="SAVE20"
                size="small"
                onClick={() => setVoucherCode('SAVE20')}
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label="FREESHIP"
                size="small"
                onClick={() => setVoucherCode('FREESHIP')}
                sx={{ cursor: 'pointer' }}
              />
            </Stack>
          </Box>
        </Stack>
      )}
    </Card>
  );
}
