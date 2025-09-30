'use client';

import { useState, use, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';

import { varFade } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { AnnouncementBanner } from 'src/components/announcement-banner';
import { StoreHeader } from 'src/components/store-header';

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
function ShippingInfoSection() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Left Column - Shipping Information */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              {/* Local Shipping */}
              <m.div {...varFade().inUp}>
                <Stack spacing={2}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Local shipping
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Packages ship within 2-3 business days. Delivery takes 3-5 days across Australia.
                  </Typography>
                  <Divider />
                </Stack>
              </m.div>

              {/* International Shipping */}
              <m.div {...varFade().inUp}>
                <Stack spacing={2}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    International shipping
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Global deliveries take 7-14 days. Tracking information provided for every order.
                  </Typography>
                  <Divider />
                </Stack>
              </m.div>

              {/* Shipping Rates */}
              <m.div {...varFade().inUp}>
                <Stack spacing={2}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Shipping rates
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Flat rate of $5 for local orders. International shipping calculated at checkout.
                  </Typography>
                  <Divider />
                </Stack>
              </m.div>
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
function ReturnPolicySection() {
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
                
                <Typography variant="h6" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  We want you to love your Kitsch.Studio piece. Returns are straightforward and customer-focused.
                </Typography>

                <Stack spacing={2}>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'text.primary',
                        mt: 1,
                        flexShrink: 0
                      }}
                    />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      Returns accepted within 14 days
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'text.primary',
                        mt: 1,
                        flexShrink: 0
                      }}
                    />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      Item must be unused and in original packaging
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'text.primary',
                        mt: 1,
                        flexShrink: 0
                      }}
                    />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      Full refund issued to original payment method
                    </Typography>
                  </Stack>
                </Stack>

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
function FAQSection() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      id: 'faq1',
      question: 'Question text goes here.',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.'
    },
    {
      id: 'faq2',
      question: 'Question text goes here.',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.'
    },
    {
      id: 'faq3',
      question: 'Question text goes here.',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.'
    },
    {
      id: 'faq4',
      question: 'Question text goes here.',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.'
    },
    {
      id: 'faq5',
      question: 'Question text goes here.',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.'
    }
  ];

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

// Footer Component (reused from other pages)
function StoreFooter() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 6, borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
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

          {/* Kitsch Studio */}
          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Kitsch.Studio
              </Typography>
              <Stack spacing={1}>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Shop
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Collections
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Bestsellers
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  New arrivals
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Company
                </Link>
              </Stack>
            </Stack>
          </Grid>

          {/* About us */}
          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                About us
              </Typography>
              <Stack spacing={1}>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Our process
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Contact
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Social Media
                </Link>
              </Stack>
            </Stack>
          </Grid>

          {/* Support */}
          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Support
              </Typography>
              <Stack spacing={1}>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Shipping
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Returns
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  FAQ
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Subscribe
                </Link>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                Join our newsletter to stay up to date on new collections and artisan stories.
              </Typography>
            </Stack>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={3}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Enter your email
              </Typography>
              <TextField
                placeholder="Enter your email"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem'
                  }
                }}
              />
              <Button
                variant="contained"
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  px: 3,
                  py: 1
                }}
              >
                Subscribe
              </Button>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                By subscribing, you agree to our privacy policy
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'success.lighter',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'success.main'
                }}
              >
                <Typography variant="body2" sx={{ color: 'success.main' }}>
                  Thank you for subscribing
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'error.main' }}>
                Something went wrong with your subscription
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Section */}
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
                Cookies settings
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Terms of Service
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Cookies Settings
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

export default function ShippingReturnsPage({ params }) {
  const theme = useTheme();
  const { storeId } = use(params);

  // Set page title
  useEffect(() => {
    document.title = `Shipping & Returns | Kitsch Studio | STUDIO360`;
  }, [storeId]);

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Header */}
      <StoreHeader />
      
      {/* Main Title */}
      <MainTitleSection />
      
      {/* Shipping Information */}
      <ShippingInfoSection />
      
      {/* Return Policy */}
      <ReturnPolicySection />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Footer */}
      <StoreFooter />
    </Box>
  );
}
