'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { PRODUCT_CHECKOUT_STEPS } from 'src/_mock/_product';

import { StoreHeader } from 'src/components/store-header';
import { StoreFooter } from 'src/components/store-footer';
import { AnnouncementBanner } from 'src/components/announcement-banner';

import { CheckoutCart } from '../checkout-cart';
import { useCheckoutContext } from '../context';
import { CheckoutSteps } from '../checkout-steps';
import { CheckoutOrderComplete } from '../checkout-order-complete';
// Dynamically import the problematic component to avoid SSR hydration issues
const CheckoutAddressPayment = dynamic(
  () => import('../checkout-address-payment').then((mod) => ({ default: mod.CheckoutAddressPayment })),
  { 
    ssr: false,
    loading: () => (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading checkout form...
      </div>
    )
  }
);

// ----------------------------------------------------------------------

export function CheckoutView({ storeId }) {
  const checkout = useCheckoutContext();

  useEffect(() => {
    checkout.initialStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Header */}
      <StoreHeader storeId={storeId} />

      {/* Main Checkout Content */}
      <Container sx={{ mb: 10, px: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h4" 
          sx={{ 
            my: { xs: 2, sm: 3, md: 5 },
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Checkout
        </Typography>

        <Grid container justifyContent={checkout.completed ? 'center' : 'flex-start'}>
          <Grid xs={12} md={8}>
            <CheckoutSteps activeStep={checkout.activeStep} steps={PRODUCT_CHECKOUT_STEPS} />
          </Grid>
        </Grid>

        <>
          {checkout.activeStep === 0 && <CheckoutCart />}
          
          {checkout.activeStep === 1 && <CheckoutAddressPayment />}
          
          {checkout.completed && (
            <CheckoutOrderComplete open onReset={checkout.onReset} onDownloadPDF={() => {}} />
          )}
        </>
      </Container>

      {/* Footer */}
      <StoreFooter storeId={storeId} />
    </Box>
  );
}