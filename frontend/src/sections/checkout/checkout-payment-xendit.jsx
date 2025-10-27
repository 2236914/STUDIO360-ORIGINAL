import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';

import { addOrder } from 'src/services/ordersLocalService';
import xenditPaymentService from 'src/services/xenditPaymentService';

import { Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';
import { CheckoutDelivery } from './checkout-delivery';
import { CheckoutBillingInfo } from './checkout-billing-info';
import { CheckoutPaymentMethods } from './checkout-payment-methods';

// Import Xendit payment dialogs
import { QRPHPaymentDialog } from 'src/components/payment/qrph-payment-dialog';
import { GCashPaymentDialog } from 'src/components/payment/gcash-payment-dialog';
import { CardPaymentDialog } from 'src/components/payment/card-payment-dialog';

// ----------------------------------------------------------------------

const DELIVERY_OPTIONS = [
  { value: 0, label: 'Free', description: '5-7 days delivery' },
  { value: 10, label: 'Standard', description: '3-5 days delivery' },
  { value: 20, label: 'Express', description: '2-3 days delivery' },
];

const PAYMENT_OPTIONS = [
  {
    value: 'qrph',
    label: 'QRPh',
    description: 'Pay using QR Philippines for instant and secure payments.',
    icon: '/assets/icons/payment/ic-qrph.svg'
  },
  {
    value: 'gcash',
    label: 'GCash',
    description: 'Pay using your GCash wallet.',
    icon: '/assets/icons/payment/ic-gcash.svg'
  },
  {
    value: 'credit',
    label: 'Credit / Debit card',
    description: 'We support Mastercard, Visa, and other major cards via Xendit.',
    icon: 'logos:visa'
  },
];

const CARDS_OPTIONS = [
  { value: 'ViSa1', label: '**** **** **** 1212 - Jimmy Holland' },
  { value: 'ViSa2', label: '**** **** **** 2424 - Shawn Stokes' },
  { value: 'MasterCard', label: '**** **** **** 4545 - Cole Armstrong' },
];

// ----------------------------------------------------------------------

export const PaymentSchema = zod.object({
  payment: zod.string().min(1, { message: 'Payment is required!' }),
  // Not required
  delivery: zod.number(),
});

// ----------------------------------------------------------------------

export function CheckoutPayment() {
  const checkout = useCheckoutContext();
  
  // Payment dialog states
  const [qrphDialogOpen, setQrphDialogOpen] = useState(false);
  const [gcashDialogOpen, setGcashDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const defaultValues = { delivery: checkout.shipping, payment: '' };

  const methods = useForm({
    resolver: zodResolver(PaymentSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = methods;

  const selectedPayment = watch('payment');

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Compose order data
      const selectedDelivery = DELIVERY_OPTIONS.find((opt) => opt.value === data.delivery);
      const orderItems = (checkout.items || []).map((item) => ({
        id: item.id,
        name: item.name || item.title || `Item ${item.id}`,
        image: item.image || item.cover || item.thumbnail,
        quantity: item.quantity || 1,
        price: item.price || 0,
      }));

      const orderInput = {
        customer: {
          name: checkout?.billing?.name || 'Customer',
          email: checkout?.billing?.email || '',
          avatar: '/assets/images/avatar/avatar_1.jpg',
        },
        items: orderItems.length,
        orderItems,
        price: checkout.total || 0,
        status: 'pending',
        delivery: {
          method: selectedDelivery ? selectedDelivery.label : 'Standard',
          speed: selectedDelivery ? selectedDelivery.description : '3-5 days delivery',
          trackingNo: '',
        },
        shipping: {
          address: checkout?.billing?.fullAddress || '',
          phone: checkout?.billing?.phoneNumber || '',
        },
        payment: {
          method: data.payment,
        },
        summary: {
          subtotal: checkout.subtotal || 0,
          shipping: checkout.shipping || 0,
          discount: checkout.discount || 0,
          taxes: 0,
          total: checkout.total || 0,
        },
      };

      // Save order locally first
      const saved = addOrder(orderInput);

      // Prepare payment data for Xendit
      const paymentData = xenditPaymentService.formatPaymentData(
        orderInput,
        checkout.billing,
        data.payment
      );

      // Open appropriate payment dialog based on selected method
      switch (data.payment) {
        case 'qrph':
          setQrphDialogOpen(true);
          break;
        case 'gcash':
          setGcashDialogOpen(true);
          break;
        case 'credit':
          setCardDialogOpen(true);
          break;
        default:
          // For other payment methods, proceed with original flow
          checkout.onNextStep();
          checkout.onReset();
      }

      console.info('Order created:', saved);
    } catch (error) {
      console.error('Error creating order:', error);
      setPaymentError('Failed to create order. Please try again.');
    }
  });

  const handlePaymentSuccess = (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    setPaymentSuccess(true);
    setPaymentError('');
    
    // Close all dialogs
    setQrphDialogOpen(false);
    setGcashDialogOpen(false);
    setCardDialogOpen(false);
    
    // Proceed to next step
    setTimeout(() => {
      checkout.onNextStep();
      checkout.onReset();
    }, 2000);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPaymentError(error);
    setPaymentSuccess(false);
  };

  const handleCloseDialogs = () => {
    setQrphDialogOpen(false);
    setGcashDialogOpen(false);
    setCardDialogOpen(false);
    setPaymentError('');
  };

  // Prepare payment data for dialogs
  const paymentData = {
    amount: checkout.total || 0,
    description: `Payment for order`,
    customer: {
      firstName: checkout?.billing?.name?.split(' ')[0] || 'Customer',
      lastName: checkout?.billing?.name?.split(' ').slice(1).join(' ') || '',
      email: checkout?.billing?.email || '',
      phone: checkout?.billing?.phoneNumber || '',
    },
    orderId: `order_${Date.now()}`,
  };

  return (
    <>
      <Form methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
            <CheckoutDelivery onApplyShipping={checkout.onApplyShipping} options={DELIVERY_OPTIONS} />

            <CheckoutPaymentMethods
              options={{
                payments: PAYMENT_OPTIONS,
                cards: CARDS_OPTIONS,
              }}
              sx={{ my: 3 }}
            />

            {paymentError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {paymentError}
              </Alert>
            )}

            {paymentSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Payment successful! Redirecting...
              </Alert>
            )}

            <Button
              size="small"
              color="inherit"
              onClick={checkout.onBackStep}
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            >
              Back
            </Button>
          </Grid>

          <Grid xs={12} md={4}>
            <CheckoutBillingInfo billing={checkout.billing} onBackStep={checkout.onBackStep} />

            <CheckoutSummary
              total={checkout.total}
              subtotal={checkout.subtotal}
              discount={checkout.discount}
              shipping={checkout.shipping}
              onEdit={() => checkout.onGotoStep(0)}
            />

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={!selectedPayment}
            >
              Complete order
            </LoadingButton>
          </Grid>
        </Grid>
      </Form>

      {/* Payment Dialogs */}
      <QRPHPaymentDialog
        open={qrphDialogOpen}
        onClose={handleCloseDialogs}
        paymentData={paymentData}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      <GCashPaymentDialog
        open={gcashDialogOpen}
        onClose={handleCloseDialogs}
        paymentData={paymentData}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      <CardPaymentDialog
        open={cardDialogOpen}
        onClose={handleCloseDialogs}
        paymentData={paymentData}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </>
  );
}
