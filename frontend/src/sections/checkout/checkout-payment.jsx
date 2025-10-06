import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';
import { CheckoutDelivery } from './checkout-delivery';
import { CheckoutBillingInfo } from './checkout-billing-info';
import { CheckoutPaymentMethods } from './checkout-payment-methods';
import { addOrder } from 'src/services/ordersLocalService';

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
    value: 'paypal',
    label: 'PayPal',
    description: 'You will be redirected to PayPal website to complete your purchase securely.',
    icon: 'logos:paypal'
  },
  {
    value: 'credit',
    label: 'Credit / Debit card',
    description: 'We support Mastercard, Visa, Discover and Stripe.',
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

  const defaultValues = { delivery: checkout.shipping, payment: '' };

  const methods = useForm({
    resolver: zodResolver(PaymentSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Compose and save order (front-only)
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
        items: orderItems.length, // keep compatibility with current list view
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

      const saved = addOrder(orderInput);

      checkout.onNextStep();
      checkout.onReset();
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
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
          >
            Complete order
          </LoadingButton>
        </Grid>
      </Grid>
    </Form>
  );
}
