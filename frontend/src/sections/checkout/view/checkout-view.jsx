'use client';

import dynamic from 'next/dynamic';

import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { PRODUCT_CHECKOUT_STEPS } from 'src/_mock/_product';

import { CheckoutCart } from '../checkout-cart';
import { CheckoutOrderComplete } from '../checkout-order-complete';
import { AnnouncementBanner } from 'src/components/announcement-banner';
import { StoreHeader } from 'src/components/store-header';
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
import { useCheckoutContext } from '../context';
import { CheckoutSteps } from '../checkout-steps';

// ----------------------------------------------------------------------

// Footer Component for Checkout
function CheckoutFooter() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 6, borderTop: '1px solid', borderColor: 'divider', mt: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Stack spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Logo
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Handcrafted jewelry and accessories for the modern individual.
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Kitsch.Studio
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Shop
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Collections
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Bestsellers
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  New arrivals
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                About us
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Our process
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Contact
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Social Media
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Support
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Shipping
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Returns
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  FAQ
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Enter your email
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Subscribe
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                By subscribing, you agree to our privacy policy
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            alignItems="center" 
            justifyContent="space-between"
            spacing={2}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Made with STUDIO360
            </Typography>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Terms of Service
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Privacy Policy
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export function CheckoutView() {
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
      <StoreHeader />

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
      <CheckoutFooter />
    </Box>
  );
}