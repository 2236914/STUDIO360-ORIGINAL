'use client';

import { useState, useEffect, use } from 'react';

import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Avatar,
  Typography,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';

import { useRouter } from 'next/navigation';

import { isStoreSubdomain } from 'src/utils/subdomain';
import { storefrontApi } from 'src/utils/api/storefront';

import { StoreHeader } from 'src/components/store-header';
import { StoreFooter } from 'src/components/store-footer';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function SubdomainShippingPage({ params }) {
  const { subdomain } = use(params);
  const router = useRouter();
  
  const [shippingData, setShippingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isValidStore, setIsValidStore] = useState(false);

  // All hooks must be called in the same order every time
  useEffect(() => {
    setIsClient(true);
    setIsValidStore(isStoreSubdomain());
  }, []);

  useEffect(() => {
    if (isClient && isValidStore) {
      loadShippingData();
    }
  }, [subdomain, isClient, isValidStore]);

  const loadShippingData = async () => {
    try {
      setLoading(true);
      const response = await storefrontApi.getShippingPage(subdomain);
      if (response.success) {
        setShippingData(response.data);
      } else {
        setError('Failed to load shipping page');
      }
    } catch (error) {
      console.error('Error loading shipping page:', error);
      setError('Failed to load shipping page');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push(`/${subdomain}`);
  };

  const handleFAQChange = (panel) => (event, isExpanded) => {
    setExpandedFAQ(isExpanded ? panel : false);
  };

  // Conditional rendering instead of early returns
  if (!isClient) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isValidStore) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h1>404</h1>
        <p>Shipping page not found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StoreHeader storeId={subdomain} />
      
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Page Header */}
        <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center', mb: 6 }}>
          Shipping & Returns
        </Typography>

        <Grid container spacing={4}>
          {/* Shipping Information */}
          <Grid item xs={12}>
            <Card sx={{ p: 4, mb: 4 }}>
              <Stack spacing={3}>
                <Typography variant="h4" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  Shipping Information
                </Typography>
                
                {/* Local Shipping */}
                {shippingData?.settings?.localShipping?.enabled && (
                  <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Iconify icon="eva:car-fill" />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Local Shipping
                      </Typography>
                    </Stack>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {shippingData.settings.localShipping.description || 'We offer local shipping within the Philippines. Delivery times vary by location.'}
                    </Typography>
                  </Box>
                )}

                {/* International Shipping */}
                {shippingData?.settings?.internationalShipping?.enabled && (
                  <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <Iconify icon="eva:globe-fill" />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        International Shipping
                      </Typography>
                    </Stack>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {shippingData.settings.internationalShipping.description || 'We ship internationally to select countries. Please contact us for shipping rates to your location.'}
                    </Typography>
                  </Box>
                )}

                {/* Shipping Rates */}
                {shippingData?.settings?.shippingRates?.enabled && (
                  <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <Iconify icon="eva:credit-card-fill" />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Shipping Rates
                      </Typography>
                    </Stack>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {shippingData.settings.shippingRates.description || 'Shipping rates are calculated at checkout based on your location and order weight.'}
                    </Typography>
                  </Box>
                )}

                {/* Show default message if no shipping info is configured */}
                {!shippingData?.settings?.localShipping?.enabled && 
                 !shippingData?.settings?.internationalShipping?.enabled && 
                 !shippingData?.settings?.shippingRates?.enabled && (
                  <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.neutral', borderRadius: 2 }}>
                    <Iconify icon="eva:car-fill" sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                      Shipping Information Coming Soon
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      We're working on setting up our shipping details. Please contact us for shipping inquiries.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid>

          {/* Return Policy */}
          <Grid item xs={12}>
            <Card sx={{ p: 4, mb: 4 }}>
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Iconify icon="eva:undo-fill" />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Return Policy
                  </Typography>
                </Stack>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {shippingData?.settings?.returnPolicy?.description || 
                   'We want you to be completely satisfied with your purchase. If you\'re not happy with your order, please contact us within 30 days of delivery to discuss return options.\n\n• Items must be in original condition\n• Returns must be initiated within 30 days\n• Customer is responsible for return shipping costs\n• Refunds will be processed within 5-7 business days after receiving returned items'}
                </Typography>
              </Stack>
            </Card>
          </Grid>

          {/* FAQ Section */}
          <Grid item xs={12}>
            <Card sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Typography variant="h4" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  Frequently Asked Questions
                </Typography>
                
                {shippingData?.faqs && shippingData.faqs.length > 0 ? (
                  <Stack spacing={2}>
                    {shippingData.faqs
                      .filter(faq => faq.is_active)
                      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                      .map((faq, index) => (
                        <Accordion 
                          key={faq.id}
                          expanded={expandedFAQ === `faq-${index}`}
                          onChange={handleFAQChange(`faq-${index}`)}
                          sx={{ 
                            border: '1px solid', 
                            borderColor: 'divider',
                            '&:before': { display: 'none' }
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<Iconify icon="eva:arrow-down-fill" />}
                            sx={{ 
                              bgcolor: 'background.neutral',
                              '&.Mui-expanded': {
                                bgcolor: 'primary.lighter',
                              }
                            }}
                          >
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {faq.question}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 2 }}>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: 'text.secondary',
                                lineHeight: 1.8,
                                whiteSpace: 'pre-line'
                              }}
                            >
                              {faq.answer}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                  </Stack>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.neutral', borderRadius: 2 }}>
                    <Iconify icon="eva:question-mark-circle-fill" sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                      FAQ Section Coming Soon
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      We're preparing answers to common questions. Feel free to contact us if you have any questions.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <StoreFooter storeId={subdomain} />
    </Box>
  );
}
