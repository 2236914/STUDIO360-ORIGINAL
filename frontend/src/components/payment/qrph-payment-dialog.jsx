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

export function QRPHPaymentDialog({ open, onClose, paymentData, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrString, setQrString] = useState('');
  const [externalId, setExternalId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (open && paymentData) {
      createQRPHPayment();
    }
  }, [open, paymentData]);

  const createQRPHPayment = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await xenditPaymentService.createQRPHPayment(paymentData);
      
      if (result.success) {
        setQrCodeUrl(result.data.qrCodeUrl);
        setQrString(result.data.qrString);
        setExternalId(result.data.externalId);
        setExpiresAt(result.data.expiresAt);
        startPolling(result.data.externalId);
      } else {
        setError(result.error || 'Failed to create QRPH payment');
        onError?.(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      onError?.(err.message);
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

    // Clear interval after 15 minutes (QRPH expiration)
    setTimeout(() => {
      clearInterval(pollInterval);
      setPolling(false);
    }, 15 * 60 * 1000);
  };

  const handleClose = () => {
    setQrCodeUrl('');
    setQrString('');
    setExternalId('');
    setExpiresAt('');
    setError('');
    setPolling(false);
    onClose();
  };

  const copyQRString = () => {
    navigator.clipboard.writeText(qrString);
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
          <Iconify icon="eva:qr-code-outline" width={24} />
          <Typography variant="h6">Pay with QRPH</Typography>
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

          {qrCodeUrl && !loading && (
            <>
              <Alert severity="info">
                Scan the QR code below using your banking or e-wallet app to complete the payment.
                The QR code expires in 15 minutes.
              </Alert>

              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Box
                  component="img"
                  src={qrCodeUrl}
                  alt="QR Code for Payment"
                  sx={{
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: 300,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Amount: ₱{paymentData?.amount?.toLocaleString()}
                </Typography>

                {expiresAt && (
                  <Typography variant="caption" color="text.secondary">
                    Expires: {new Date(expiresAt).toLocaleString()}
                  </Typography>
                )}
              </Card>

              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:copy-outline" />}
                onClick={copyQRString}
                fullWidth
              >
                Copy QR String
              </Button>

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
