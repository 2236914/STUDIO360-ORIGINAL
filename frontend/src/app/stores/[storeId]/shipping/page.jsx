'use client';

import { m } from 'framer-motion';
import { use, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Accordion from '@mui/material/Accordion';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CircularProgress from '@mui/material/CircularProgress';

import { storefrontApi } from 'src/utils/api/storefront';

import { varFade } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { StoreHeader } from 'src/components/store-header';
import { StoreFooter } from 'src/components/store-footer';
import { AnnouncementBanner } from 'src/components/announcement-banner';

// ----------------------------------------------------------------------


// Main Title Section
function MainTitleSection() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3} alignItems="center" textAlign="center">
          <m.div {...varFade().inUp}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Shipping and Returns
            </Typography>
          </m.div>

          <m.div {...varFade().inUp}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 400,
                maxWidth: 600,
                lineHeight: 1.6
              }}
            >
              We ship locally and internationally with care. Each package is wrapped like a precious gift.
            </Typography>
          </m.div>
        </Stack>
      </Container>
    </Box>
  );
}

// Shipping Information Section
function ShippingInfoSection({ shippingData }) {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Left Column - Shipping Information */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              {/* Local Shipping */}
              {shippingData?.localShipping?.enabled && (
                <m.div {...varFade().inUp}>
                  <Stack spacing={2}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Local shipping
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {shippingData.localShipping.description || 'Local shipping available'}
                    </Typography>
                    <Divider />
                  </Stack>
                </m.div>
              )}

              {/* International Shipping */}
              {shippingData?.internationalShipping?.enabled && (
                <m.div {...varFade().inUp}>
                  <Stack spacing={2}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      International shipping
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {shippingData.internationalShipping.description || 'International shipping available'}
                    </Typography>
                    <Divider />
                  </Stack>
                </m.div>
              )}

              {/* Shipping Rates */}
              {shippingData?.shippingRates?.enabled && (
                <m.div {...varFade().inUp}>
                  <Stack spacing={2}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Shipping rates
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {shippingData.shippingRates.description || 'Competitive shipping rates available'}
                    </Typography>
                    <Divider />
                  </Stack>
                </m.div>
              )}
            </Stack>
          </Grid>

          {/* Right Column - Image Placeholder */}
          <Grid item xs={12} md={6}>
            <m.div {...varFade().inUp}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: 300, md: 400 },
                  bgcolor: '#E5E5E5',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Iconify 
                  icon="solar:gallery-minimalistic-bold" 
                  sx={{ 
                    fontSize: 64, 
                    color: '#A0A0A0' 
                  }} 
                />
              </Box>
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// Return Policy Section
function ReturnPolicySection({ shippingData }) {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Left Column - Return Policy */}
          <Grid item xs={12} md={6}>
            <m.div {...varFade().inUp}>
              <Stack spacing={4}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Return Policy
                </Typography>
                
                <Typography variant="h6" sx={{ color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {shippingData?.returnPolicy?.description || 'Returns are accepted within a specified timeframe. Please contact us for more details.'}
                </Typography>

                <Stack direction="row" spacing={3} alignItems="center">
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'text.primary',
                      color: 'text.primary',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        bgcolor: 'transparent'
                      }
                    }}
                  >
                    Return
                  </Button>
                  <Link 
                    href="#" 
                    sx={{ 
                      color: 'text.primary', 
                      textDecoration: 'none', 
                      fontWeight: 500,
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    Contact →
                  </Link>
                </Stack>
              </Stack>
            </m.div>
          </Grid>

          {/* Right Column - Empty for now */}
          <Grid item xs={12} md={6}>
            {/* Empty space to match wireframe */}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// FAQ Section
function FAQSection({ shippingData }) {
  const faqs = shippingData?.faqs || [];
  const [expanded, setExpanded] = useState(faqs.length > 0 ? faqs[0].id : null);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (faqs.length === 0) {
    return null; // Don't show FAQ section if no FAQs available
  }

  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Left Column - FAQ Intro */}
          <Grid item xs={12} md={6}>
            <m.div {...varFade().inUp}>
              <Stack spacing={4}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  FAQs
                </Typography>
                
                <Typography variant="h6" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
                </Typography>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'text.primary',
                    color: 'text.primary',
                    px: 4,
                    py: 1.5,
                    alignSelf: 'flex-start',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      bgcolor: 'transparent'
                    }
                  }}
                >
                  Contact
                </Button>
              </Stack>
            </m.div>
          </Grid>

          {/* Right Column - FAQ Items */}
          <Grid item xs={12} md={6}>
            <m.div {...varFade().inUp}>
              <Stack spacing={0}>
                {faqs.map((faq, index) => (
                  <Box key={faq.id}>
                    <Accordion
                      expanded={expanded === faq.id}
                      onChange={handleChange(faq.id)}
                      sx={{
                        boxShadow: 'none',
                        border: 'none',
                        '&:before': {
                          display: 'none',
                        },
                        '&.Mui-expanded': {
                          margin: 0,
                        }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<Iconify icon="eva:arrow-upward-fill" width={16} />}
                        sx={{
                          px: 0,
                          py: 2,
                          '& .MuiAccordionSummary-content': {
                            margin: 0,
                          }
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 0, pb: 2 }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                    {index < faqs.length - 1 && <Divider />}
                  </Box>
                ))}
              </Stack>
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

export default function ShippingReturnsPage({ params }) {
  const theme = useTheme();
  // Handle both Promise and resolved params
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { storeId } = resolvedParams;
  const [shippingData, setShippingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch shipping page data
  useEffect(() => {
    async function fetchShippingData() {
      try {
        setLoading(true);
        const response = await storefrontApi.getShippingPage(storeId);
        if (response.success) {
          setShippingData(response.data);
        }
      } catch (err) {
        console.error('Error fetching shipping data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (storeId) {
      fetchShippingData();
    }
  }, [storeId]);

  // Set page title
  useEffect(() => {
    document.title = `Shipping & Returns | ${storeId} | STUDIO360`;
  }, [storeId]);

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
        <AnnouncementBanner />
        <StoreHeader storeId={storeId} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h4" color="error">
            Error loading shipping page
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {error}
          </Typography>
        </Container>
        <StoreFooter storeId={storeId} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Header */}
      <StoreHeader storeId={storeId} />
      
      {/* Main Title */}
      <MainTitleSection />
      
      {/* Shipping Information */}
      <ShippingInfoSection shippingData={shippingData} />
      
      {/* Return Policy */}
      <ReturnPolicySection shippingData={shippingData} />
      
      {/* FAQ Section */}
      <FAQSection shippingData={shippingData} />
      
      {/* Footer */}
      <StoreFooter storeId={storeId} />
    </Box>
  );
}
