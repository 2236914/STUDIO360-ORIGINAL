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
  TextField,
  InputAdornment,
} from '@mui/material';

import { useRouter } from 'next/navigation';

import { isStoreSubdomain } from 'src/utils/subdomain';
import { storefrontApi } from 'src/utils/api/storefront';

import { StoreHeader } from 'src/components/store-header';
import { StoreFooter } from 'src/components/store-footer';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function SubdomainFAQPage({ params }) {
  const { subdomain } = use(params);
  const router = useRouter();
  
  const [faqData, setFaqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFAQs, setFilteredFAQs] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [isValidStore, setIsValidStore] = useState(false);

  // All hooks must be called in the same order every time
  useEffect(() => {
    setIsClient(true);
    setIsValidStore(isStoreSubdomain());
  }, []);

  useEffect(() => {
    if (isClient && isValidStore) {
      loadFAQData();
    }
  }, [subdomain, isClient, isValidStore]);

  useEffect(() => {
    if (faqData?.faqs) {
      filterFAQs();
    }
  }, [searchQuery, faqData]);

  const loadFAQData = async () => {
    try {
      setLoading(true);
      const response = await storefrontApi.getFAQs(subdomain);
      if (response.success) {
        setFaqData({ faqs: response.data });
      } else {
        setError('Failed to load FAQ page');
      }
    } catch (error) {
      console.error('Error loading FAQ page:', error);
      setError('Failed to load FAQ page');
    } finally {
      setLoading(false);
    }
  };

  const filterFAQs = () => {
    if (!faqData?.faqs) return;
    
    const filtered = faqData.faqs.filter(faq => 
      faq.is_active && (
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    
    setFilteredFAQs(filtered);
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
        <p>FAQ page not found</p>
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
        {/* Back Button */}
        <Button
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={handleBackToHome}
          sx={{ mb: 4 }}
        >
          Back to Home
        </Button>

        {/* Page Header */}
        <Stack spacing={3} sx={{ mb: 6, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, mx: 'auto' }}>
            <Iconify icon="eva:question-mark-circle-fill" width={40} />
          </Avatar>
          
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Frequently Asked Questions
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Find answers to common questions about our products, shipping, returns, and more.
          </Typography>
        </Stack>

        {/* Search Bar */}
        <Card sx={{ p: 3, mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        </Card>

        {/* FAQ Content */}
        <Grid container spacing={4}>
          {/* FAQ List */}
          <Grid item xs={12}>
            <Card sx={{ p: 4 }}>
              <Stack spacing={3}>
                {filteredFAQs.length > 0 ? (
                  <>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      {searchQuery ? `Search Results (${filteredFAQs.length})` : 'All Questions'}
                    </Typography>
                    
                    <Stack spacing={2}>
                      {filteredFAQs
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                        .map((faq, index) => (
                          <Accordion 
                            key={faq.id}
                            expanded={expandedFAQ === `faq-${index}`}
                            onChange={handleFAQChange(`faq-${index}`)}
                            sx={{ 
                              border: '1px solid', 
                              borderColor: 'divider',
                              '&:before': { display: 'none' },
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              }
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<Iconify icon="eva:arrow-down-fill" />}
                              sx={{ 
                                bgcolor: 'background.neutral',
                                '&.Mui-expanded': {
                                  bgcolor: 'primary.lighter',
                                },
                                '&:hover': {
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
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Iconify icon="eva:search-fill" sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                      No FAQs found
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      {searchQuery ? 'Try adjusting your search terms' : 'No FAQs are currently available'}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid>

          {/* Contact Support */}
          <Grid item xs={12}>
            <Card sx={{ p: 4, bgcolor: 'primary.lighter' }}>
              <Stack spacing={3} sx={{ textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto' }}>
                  <Iconify icon="eva:message-circle-fill" width={30} />
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Still have questions?
                </Typography>
                
                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
                  Can't find what you're looking for? Our support team is here to help you with any questions or concerns.
                </Typography>
                
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="eva:email-fill" />}
                    onClick={() => router.push(`/${subdomain}/about`)}
                    sx={{ borderRadius: 2 }}
                  >
                    Contact Us
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="eva:arrow-back-fill" />}
                    onClick={handleBackToHome}
                    sx={{ borderRadius: 2 }}
                  >
                    Back to Home
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <StoreFooter storeId={subdomain} />
    </Box>
  );
}
