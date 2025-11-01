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
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import xenditPaymentService from 'src/services/xenditPaymentService';

// ----------------------------------------------------------------------

export function CardPaymentDialog({ open, onClose, paymentData, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
  });
  const [cardToken, setCardToken] = useState('');
  const [step, setStep] = useState('form'); // 'form', 'processing', 'success', 'error'

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setStep('form');
      setError('');
      setLoading(false);
      setCardData({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: '',
      });
      setCardToken('');
    }
  }, [open]);

  const handleClose = () => {
    setCardData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
    });
    setCardToken('');
    setError('');
    setStep('form');
    onClose();
  };

  const handleInputChange = (field) => (event) => {
    setCardData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const formatCardNumber = (value) => {
    // Ensure value is a string
    if (typeof value !== 'string' && value != null) {
      value = String(value);
    }
    if (!value) return '';
    
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleCardNumberChange = (event) => {
    const inputValue = event?.target?.value ?? event ?? '';
    const formatted = formatCardNumber(inputValue);
    setCardData(prev => ({
      ...prev,
      cardNumber: formatted,
    }));
  };

  const validateForm = () => {
    const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = cardData;
    
    // Ensure cardNumber is a string before calling replace
    const cleanCardNumber = typeof cardNumber === 'string' ? cardNumber : String(cardNumber || '');
    if (!cleanCardNumber || cleanCardNumber.replace(/\s/g, '').length < 13) {
      setError('Please enter a valid card number');
      return false;
    }
    
    if (!expiryMonth || !expiryYear) {
      setError('Please select expiry date');
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      setError('Please enter a valid CVV');
      return false;
    }
    
    if (!cardholderName.trim()) {
      setError('Please enter cardholder name');
      return false;
    }

    // Check if card is expired
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(expiryYear) < currentYear || 
        (parseInt(expiryYear) === currentYear && parseInt(expiryMonth) < currentMonth)) {
      setError('Card has expired');
      return false;
    }

    return true;
  };

  const createCardToken = async () => {
    const { cardNumber, expiryMonth, expiryYear, cvv } = cardData;
    
    // Ensure cardNumber is a string before calling replace
    const cleanCardNumber = typeof cardNumber === 'string' ? cardNumber.replace(/\s/g, '') : String(cardNumber || '').replace(/\s/g, '');
    
    const tokenData = {
      cardNumber: cleanCardNumber,
      expiryMonth: parseInt(expiryMonth),
      expiryYear: parseInt(expiryYear),
      cvv: String(cvv || ''),
      isMultipleUse: false,
    };

    try {
      const result = await xenditPaymentService.createCardToken(tokenData);
      
      if (result.success && result.data?.tokenId) {
        return result.data.tokenId;
      } else {
        throw new Error(result.error || 'Failed to create card token');
      }
    } catch (err) {
      // Re-throw with better error message for connection issues
      if (err?.message?.includes('CONNECTION_REFUSED') || err?.message?.includes('ERR_CONNECTION_REFUSED') || err?.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to payment server. Please check your connection.');
      }
      throw err;
    }
  };

  const processPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setStep('processing');

    try {
      // First create card token
      const token = await createCardToken();
      setCardToken(token);

      // Then process payment with token
      const paymentDataWithToken = {
        ...paymentData,
        cardToken: token,
      };

      const result = await xenditPaymentService.createCardPayment(paymentDataWithToken);
      
      if (result.success) {
        setStep('success');
        onSuccess?.(result.data);
      } else {
        setError(result.error || 'Payment failed');
        setStep('error');
        onError?.(result.error);
      }
    } catch (err) {
      console.error('Card Payment Error:', err);
      const errorMessage = err?.message || err?.response?.data?.message || 'Failed to connect to payment server. Please check your connection.';
      setError(errorMessage);
      setStep('error');
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return {
        value: month.toString().padStart(2, '0'),
        label: month.toString().padStart(2, '0'),
      };
    });
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => {
      const year = currentYear + i;
      return {
        value: year.toString(),
        label: year.toString(),
      };
    });
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
          <Iconify icon="eva:credit-card-outline" width={24} />
          <Typography variant="h6">Pay with Credit/Debit Card</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {step === 'form' && (
            <>
              <Alert severity="info">
                Enter your card details to complete the payment securely.
              </Alert>

              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    value={cardData.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    inputProps={{ maxLength: 19 }}
                  />

                  <TextField
                    fullWidth
                    label="Cardholder Name"
                    value={cardData.cardholderName}
                    onChange={handleInputChange('cardholderName')}
                    placeholder="John Doe"
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Expiry Month</InputLabel>
                        <Select
                          value={cardData.expiryMonth}
                          label="Expiry Month"
                          onChange={handleInputChange('expiryMonth')}
                        >
                          {generateMonthOptions().map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Expiry Year</InputLabel>
                        <Select
                          value={cardData.expiryYear}
                          label="Expiry Year"
                          onChange={handleInputChange('expiryYear')}
                        >
                          {generateYearOptions().map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="CVV"
                    value={cardData.cvv}
                    onChange={handleInputChange('cvv')}
                    placeholder="123"
                    inputProps={{ maxLength: 4 }}
                    type="password"
                  />

                  <Typography variant="body2" color="text.secondary">
                    Amount: ₱{paymentData?.amount?.toLocaleString()}
                  </Typography>
                </Stack>
              </Card>

              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}
            </>
          )}

          {step === 'processing' && (
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Processing Payment...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please wait while we process your payment securely.
              </Typography>
            </Box>
          )}

          {step === 'success' && (
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <Iconify icon="eva:checkmark-circle-fill" width={60} color="success.main" />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Payment Successful!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Your payment has been processed successfully.
              </Typography>
            </Box>
          )}

          {step === 'error' && (
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <Iconify icon="eva:close-circle-fill" width={60} color="error.main" />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Payment Failed
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {error || 'An error occurred while processing your payment.'}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        {step === 'form' && (
          <>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={processPayment}
              disabled={loading}
            >
              Pay ₱{paymentData?.amount?.toLocaleString()}
            </Button>
          </>
        )}
        
        {(step === 'success' || step === 'error') && (
          <Button onClick={handleClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
