'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Stack,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import xenditPaymentService from 'src/services/xenditPaymentService';

// ----------------------------------------------------------------------

export function GCashPaymentDialog({ open, onClose, paymentData, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [externalId, setExternalId] = useState('');
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (open && paymentData) {
      createGCashPayment();
    }
  }, [open, paymentData]);

  const createGCashPayment = async () => {
    setLoading(true);
    setError('');

    console.log(`[GCash Dialog] Creating payment with data:`, {
      shopName: paymentData?.shopName,
      amount: paymentData?.amount,
      hasShopName: !!paymentData?.shopName,
      paymentDataKeys: paymentData ? Object.keys(paymentData) : []
    });

    try {
      const result = await xenditPaymentService.createGCashPayment(paymentData);
      
      if (result.success) {
        setCheckoutUrl(result.data.checkoutUrl);
        setDeepLink(result.data.deepLink);
        setExternalId(result.data.externalId);
        startPolling(result.data.externalId);
      } else {
        setError(result.error || 'Failed to create GCash payment');
        onError?.(result.error);
      }
    } catch (err) {
      console.error('GCash Payment Error:', err);
      const errorMessage = err?.message || err?.response?.data?.message || 'Failed to connect to payment server. Please check your connection.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (paymentExternalId) => {
    setPolling(true);
    
    // Poll for payment status
    const pollInterval = setInterval(async () => {
      const result = await xenditPaymentService.pollPaymentStatus(paymentExternalId, 1);
      
      if (result.success && ['paid', 'failed', 'expired', 'cancelled'].includes(result.data.status)) {
        clearInterval(pollInterval);
        setPolling(false);
        
        if (result.data.status === 'paid') {
          onSuccess?.(result.data);
        } else {
          setError(`Payment ${result.data.status}`);
          onError?.(`Payment ${result.data.status}`);
        }
      }
    }, 3000); // Poll every 3 seconds

    // Clear interval after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setPolling(false);
    }, 10 * 60 * 1000);
  };

  const handleClose = () => {
    setCheckoutUrl('');
    setDeepLink('');
    setExternalId('');
    setError('');
    setPolling(false);
    onClose();
  };

  const openGCashApp = () => {
    if (deepLink) {
      window.open(deepLink, '_blank');
    } else if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
  };

  const openWebCheckout = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            component="img"
            src="/assets/icons/payment/ic-gcash.svg"
            alt="GCash"
            sx={{ width: 24, height: 24 }}
          />
          <Typography variant="h6">Pay with GCash</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {loading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {checkoutUrl && !loading && (
            <>
              <Alert severity="info">
                Complete your payment using GCash. You can pay through the GCash app or web browser.
              </Alert>

              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Box
                  component="img"
                  src="/assets/icons/payment/ic-gcash.svg"
                  alt="GCash Logo"
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                  }}
                />
                
                <Typography variant="h6" gutterBottom>
                  ₱{paymentData?.amount?.toLocaleString()}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {paymentData?.description || 'Payment via GCash'}
                </Typography>

                <Stack spacing={2}>
                  {deepLink && (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Iconify icon="eva:smartphone-outline" />}
                      onClick={openGCashApp}
                      fullWidth
                    >
                      Open GCash App
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Iconify icon="eva:globe-outline" />}
                    onClick={openWebCheckout}
                    fullWidth
                  >
                    Pay in Browser
                  </Button>
                </Stack>
              </Card>

              {polling && (
                <Alert severity="info" icon={<CircularProgress size={20} />}>
                  Waiting for payment confirmation...
                </Alert>
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
