import { z as zod } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useIsomorphicLayoutEffect } from 'src/hooks/use-isomorphic-layout-effect';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import { Form, RHFTextField, RHFSelect } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { ClientOnly } from 'src/components/client-only';

import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';
import { CheckoutDelivery } from './checkout-delivery';
import { CheckoutPaymentMethods } from './checkout-payment-methods';
import { PROVINCES, getCitiesByProvince, getBarangaysByCity } from 'src/data/philippines-address';
import { calculateShippingOptions, getRegionDisplayName, getShippingRegion, categorizeShippingOptionsByCourier } from 'src/utils/shipping-calculator';

// ----------------------------------------------------------------------

// Default delivery options (fallback when no address is selected)
const DEFAULT_DELIVERY_OPTIONS = [
  { value: 0, label: 'Free', description: '5-7 days delivery' },
  { value: 120, label: 'Standard - PHP 120', description: '3-5 days delivery' },
  { value: 200, label: 'Express - PHP 200', description: '2-3 days delivery' },
];

const PAYMENT_OPTIONS = [
  {
    value: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay with cash when your order is delivered.',
  },
  {
    value: 'gcash',
    label: 'GCash',
    description: 'Pay using your GCash wallet.',
  },
  {
    value: 'paypal',
    label: 'PayPal',
    description: 'You will be redirected to PayPal website to complete your purchase securely.',
  },
  {
    value: 'credit',
    label: 'Credit / Debit card',
    description: 'We support Mastercard, Visa, Discover and Stripe.',
  },
];

const CARDS_OPTIONS = [
  { value: 'ViSa1', label: '**** **** **** 1212 - Jimmy Holland' },
  { value: 'ViSa2', label: '**** **** **** 2424 - Shawn Stokes' },
  { value: 'MasterCard', label: '**** **** **** 4545 - Cole Armstrong' },
];

// ----------------------------------------------------------------------


export const AddressPaymentSchema = zod.object({
  // Customer Information
  firstName: zod.string().min(1, { message: 'First name is required!' }),
  lastName: zod.string().min(1, { message: 'Last name is required!' }),
  email: zod.string().email({ message: 'Invalid email address!' }),
  phone: zod.string().min(1, { message: 'Phone number is required!' }),
  
  // Delivery Address
  address: zod.string().min(1, { message: 'Street address is required!' }),
  city: zod.string().min(1, { message: 'City/Municipality is required!' }),
  province: zod.string().min(1, { message: 'Province is required!' }),
  barangay: zod.string().min(1, { message: 'Barangay is required!' }),
  zipCode: zod.string().min(4, { message: 'ZIP code must be 4 digits!' }).max(4, { message: 'ZIP code must be 4 digits!' }),
  additionalInfo: zod.string().optional(),
  
  // Delivery & Payment
  delivery: zod.number(),
  payment: zod.string().min(1, { message: 'Payment method is required!' }),
});

// ----------------------------------------------------------------------

export function CheckoutAddressPayment() {
  const checkout = useCheckoutContext();
  const [availableCities, setAvailableCities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState(DEFAULT_DELIVERY_OPTIONS);
  const [categorizedDeliveryOptions, setCategorizedDeliveryOptions] = useState([]);
  const [customerRegion, setCustomerRegion] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    barangay: '',
    zipCode: '',
    additionalInfo: '',
    delivery: 0,
    payment: '',
  };

  const methods = useForm({
    resolver: zodResolver(AddressPaymentSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  // Watch for province and city changes
  const selectedProvince = useWatch({ control: methods.control, name: 'province' });
  const selectedCity = useWatch({ control: methods.control, name: 'city' });

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      const cities = getCitiesByProvince(selectedProvince);
      setAvailableCities(cities);
      // Reset city and barangay when province changes
      setValue('city', '');
      setValue('barangay', '');
      setAvailableBarangays([]);
    }
  }, [selectedProvince, setValue]);

  // Update barangays when city changes  
  useEffect(() => {
    if (selectedProvince && selectedCity) {
      const barangays = getBarangaysByCity(selectedProvince, selectedCity);
      setAvailableBarangays(barangays);
      // Reset barangay when city changes
      setValue('barangay', '');
    }
  }, [selectedProvince, selectedCity, setValue]);

  // Update delivery options when province changes (FIXED - no infinite loop + SSR safe)
  useEffect(() => {
    if (!isClient) return; // Skip on server-side rendering
    
    if (selectedProvince) {
      const region = getShippingRegion(selectedProvince);
      setCustomerRegion(region);
      
      // Calculate shipping options with order amount for free shipping eligibility
      const orderAmount = checkout.total || 0;
      const shippingOptions = calculateShippingOptions(selectedProvince, selectedCity, null, orderAmount);
      
      if (shippingOptions.length > 0) {
        const formattedOptions = shippingOptions.map(option => ({
          value: option.fee,
          label: option.fee === 0 ? 'Free' : `${option.courierName} - ₱${option.fee}`,
          description: option.description,
          courierName: option.courierName,
          region: option.region,
          disabled: option.disabled || false,
          available: option.available !== false,
          minAmount: option.minAmount
        }));
        
        setDeliveryOptions(formattedOptions);
        
        // Categorize options by courier for better UI organization
        const categorized = categorizeShippingOptionsByCourier(shippingOptions);
        setCategorizedDeliveryOptions(categorized);
      } else {
        setDeliveryOptions(DEFAULT_DELIVERY_OPTIONS);
        setCategorizedDeliveryOptions([]);
      }
    } else {
      setCustomerRegion(null);
      setDeliveryOptions(DEFAULT_DELIVERY_OPTIONS);
      setCategorizedDeliveryOptions([]);
    }
  }, [selectedProvince, selectedCity, isClient, checkout.total]); // Added checkout.total dependency

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Create billing address object
      const billingAddress = {
        name: `${data.firstName} ${data.lastName}`,
        phoneNumber: data.phone,
        fullAddress: `${data.address}, ${data.barangay}, ${data.city}, ${data.province}, ${data.zipCode}`,
        addressType: 'Home',
        primary: true,
      };

      // Update checkout context
      checkout.onCreateBilling(billingAddress);
      
      console.info('Order Data:', {
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
        address: billingAddress,
        delivery: data.delivery,
        payment: data.payment,
        items: checkout.items,
        total: checkout.total,
      });
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <ClientOnly fallback={<div>Loading checkout form...</div>}>
      <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid xs={12} md={8}>
          {/* Customer Information */}
          <Card 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            <CardHeader 
              title="Customer Information" 
              sx={{ 
                pb: 0,
                '& .MuiCardHeader-title': {
                  typography: 'h6',
                  fontWeight: 600
                }
              }}
            />
            <Box sx={{ p: { xs: 2, sm: 3 }, pt: 2 }}>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid xs={12} sm={6}>
                  <RHFTextField
                    name="firstName"
                    label="First Name"
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <RHFTextField
                    name="lastName"
                    label="Last Name"
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <RHFTextField
                    name="email"
                    label="Email Address"
                    type="email"
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <RHFTextField
                    name="phone"
                    label="Phone Number"
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>

          {/* Delivery Address */}
          <Card 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            <CardHeader 
              title="Delivery Address" 
              sx={{ 
                pb: 0,
                '& .MuiCardHeader-title': {
                  typography: 'h6',
                  fontWeight: 600
                }
              }}
            />
            <Box sx={{ p: { xs: 2, sm: 3 }, pt: 2 }}>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* Street Address */}
                <Grid xs={12}>
                  <RHFTextField
                    name="address"
                    label="Street Address"
                    placeholder="House number, street name, subdivision"
                    helperText="Include house/building number, street name, and subdivision if applicable"
                  />
                </Grid>

                {/* Province > City > Barangay Row */}
                <Grid xs={12} sm={4}>
                  <RHFSelect
                    name="province"
                    label="Province"
                    placeholder="Select Province"
                    options={[
                      { value: '', label: 'Select Province' },
                      ...PROVINCES.map((province) => ({ value: province, label: province }))
                    ]}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <RHFSelect
                    name="city"
                    label="City/Municipality"
                    placeholder="Select City"
                    disabled={!selectedProvince}
                    options={[
                      { value: '', label: selectedProvince ? 'Select City' : 'Select Province first' },
                      ...availableCities.map((city) => ({ value: city, label: city }))
                    ]}
                    helperText={!selectedProvince ? 'Please select a province first' : ''}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <RHFSelect
                    name="barangay"
                    label="Barangay"
                    placeholder="Select Barangay"
                    disabled={!selectedCity}
                    options={[
                      { value: '', label: selectedCity ? 'Select Barangay' : 'Select City first' },
                      ...availableBarangays.map((barangay) => ({ value: barangay, label: barangay }))
                    ]}
                    helperText={!selectedCity ? 'Please select a city first' : ''}
                  />
                </Grid>

                {/* ZIP Code and Additional Info Row */}
                <Grid xs={12} sm={6}>
                  <RHFTextField
                    name="zipCode"
                    label="ZIP Code"
                    placeholder="e.g. 4217"
                    inputProps={{ 
                      maxLength: 4,
                      pattern: '[0-9]*',
                      inputMode: 'numeric'
                    }}
                    helperText="4-digit postal code"
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <RHFTextField
                    name="additionalInfo"
                    label="Additional Info / Landmark"
                    placeholder="e.g. Near SM Mall, Beside Church"
                    helperText="Optional: Landmarks or additional directions"
                  />
                </Grid>

                {/* Address Preview */}
                {selectedProvince && selectedCity && (
                  <Grid xs={12}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        backgroundColor: (theme) => theme.vars?.palette?.grey?.[50] || '#F9FAFB',
                        borderRadius: 1,
                        border: (theme) => `1px solid ${theme.vars?.palette?.grey?.[200] || '#E5E7EB'}`
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Address Preview:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {methods.watch('address') && `${methods.watch('address')}, `}
                        {methods.watch('barangay') && `${methods.watch('barangay')}, `}
                        {selectedCity}, {selectedProvince}
                        {methods.watch('zipCode') && ` ${methods.watch('zipCode')}`}
                      </Typography>
                      {methods.watch('additionalInfo') && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Landmark: {methods.watch('additionalInfo')}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Card>

          {/* Delivery Options */}
          {customerRegion && isClient && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.lighter', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: 'primary.dark', fontWeight: 600 }}>
                📍 Shipping to: {getRegionDisplayName(customerRegion)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main' }}>
                Delivery options automatically calculated based on your address
              </Typography>
            </Box>
          )}
          <CheckoutDelivery onApplyShipping={checkout.onApplyShipping} options={deliveryOptions} categorizedOptions={categorizedDeliveryOptions} />

          {/* Payment Methods */}
          <CheckoutPaymentMethods
            options={{
              payments: PAYMENT_OPTIONS,
              cards: CARDS_OPTIONS,
            }}
            sx={{ my: 3 }}
          />

          <Button
            size="medium"
            color="inherit"
            variant="outlined"
            onClick={checkout.onBackStep}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            sx={{ 
              mb: 3,
              borderRadius: 2,
              borderColor: (theme) => theme.vars?.palette?.grey?.[300] || '#DFE3E8',
              '&:hover': {
                borderColor: (theme) => theme.vars?.palette?.grey?.[400] || '#C4CDD5',
                backgroundColor: (theme) => theme.vars?.palette?.grey?.[50] || '#F9FAFB'
              }
            }}
          >
            Back to Cart
          </Button>
        </Grid>

        <Grid xs={12} md={4}>
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
            sx={{
              py: 2.5,
              borderRadius: 2,
              fontSize: '1.125rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              },
              '&.Mui-disabled': {
                backgroundColor: (theme) => theme.vars?.palette?.grey?.[300] || '#DFE3E8',
                color: (theme) => theme.vars?.palette?.grey?.[500] || '#919EAB',
              }
            }}
          >
            Complete Order
          </LoadingButton>
        </Grid>
      </Grid>
    </Form>
    </ClientOnly>
  );
}
