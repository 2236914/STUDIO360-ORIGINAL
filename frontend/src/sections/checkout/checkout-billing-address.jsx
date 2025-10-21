import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { DeliveryAddressForm } from 'src/components/delivery-address-form';

import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';

// ----------------------------------------------------------------------

export function CheckoutBillingAddress() {
  const checkout = useCheckoutContext();

  const handleAddressSubmit = (addressData) => {
    // Create address object in the format expected by checkout
    const formattedAddress = {
      id: Date.now().toString(),
      fullAddress: `${addressData.streetAddress}, ${addressData.barangay}, ${addressData.city}, ${addressData.province} ${addressData.zipCode}`,
      addressType: 'Home',
      ...addressData
    };
    
    checkout.onCreateBilling(formattedAddress);
  };

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={8}>
        <Box sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Delivery Address
          </Typography>
          
          <DeliveryAddressForm 
            onSubmit={handleAddressSubmit}
            defaultValues={checkout.billing}
            showTitle={false}
          />
        </Box>

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
        <CheckoutSummary
          total={checkout.total}
          subtotal={checkout.subtotal}
          discount={checkout.discount}
        />
      </Grid>
    </Grid>
  );
}
