'use client';

import { use, useState, useEffect } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import {
  Box,
  Card,
  Chip,
  Stack,
  Paper,
  Button,
  Divider,
  Container,
  Accordion,
  TextField,
  Typography,
  CardContent,
  InputAdornment,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';

import { storefrontApi } from 'src/utils/api/storefront';

import { Iconify } from 'src/components/iconify';
import { StoreHeader } from 'src/components/store-header';
import { StoreFooter } from 'src/components/store-footer';
import { AnnouncementBanner } from 'src/components/announcement-banner';

// ----------------------------------------------------------------------

// Fallback FAQ data for when no FAQs are available
const FALLBACK_FAQS = [
  {
    id: '1',
    question: 'What are your shipping options?',
    answer: 'We offer multiple shipping options through JNT Express and SPX. Metro Manila delivery takes 1-2 days, while provincial delivery takes 3-5 days. We also offer same-day delivery for Metro Manila orders placed before 2 PM.',
    category: 'Shipping',
    active: true,
    helpful: 45,
    notHelpful: 3
  },
  {
    id: '2',
    question: 'How can I track my order?',
    answer: 'You can track your order using the tracking number sent to your email. Visit our tracking page or contact our support team. You can also use our chatbot to get instant tracking information by providing your order number and email.',
    category: 'Orders',
    active: true,
    helpful: 38,
    notHelpful: 2
  },
  {
    id: '3',
    question: 'What is your return policy?',
    answer: 'We accept returns within 7 days of delivery. Items must be in original condition with tags attached. Please contact our support team to initiate a return. Refunds will be processed within 3-5 business days after we receive the returned item.',
    category: 'Returns',
    active: true,
    helpful: 52,
    notHelpful: 5
  },
  {
    id: '4',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, GCash, PayMaya, and bank transfers. All payments are processed securely through our payment partners.',
    category: 'Payment',
    active: true,
    helpful: 67,
    notHelpful: 1
  },
  {
    id: '5',
    question: 'Do you offer bulk discounts?',
    answer: 'Yes! We offer special pricing for bulk orders. Contact us directly for custom quotes on orders over 50 items. We also have special packages for events, corporate orders, and resellers.',
    category: 'Orders',
    active: true,
    helpful: 23,
    notHelpful: 1
  },
  {
    id: '6',
    question: 'How do I contact customer support?',
    answer: 'You can reach us through our live chat widget, email at support@kitschstudio.com, or WhatsApp. Our support team is available Monday to Friday, 9 AM to 6 PM. For urgent matters, use our live chat for faster response.',
    category: 'Support',
    active: true,
    helpful: 41,
    notHelpful: 2
  },
  {
    id: '7',
    question: 'What are your business hours?',
    answer: 'Our customer support is available Monday to Friday, 9 AM to 6 PM (Philippine Standard Time). Our online store is open 24/7 for orders. Processing and shipping happen during business days.',
    category: 'Support',
    active: true,
    helpful: 34,
    notHelpful: 1
  },
  {
    id: '8',
    question: 'Do you ship internationally?',
    answer: 'Currently, we only ship within the Philippines. We are working on international shipping options and will announce them soon. Follow our social media for updates on international shipping availability.',
    category: 'Shipping',
    active: true,
    helpful: 28,
    notHelpful: 4
  }
];

// FAQ Categories
const FAQ_CATEGORIES = [
  'All',
  'Shipping',
  'Orders',
  'Returns',
  'Payment',
  'Support'
];

// FAQ Item Component
function FAQItem({ faq, onHelpful, onNotHelpful }) {
  const [expanded, setExpanded] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleHelpful = () => {
    if (!feedbackGiven) {
      onHelpful(faq.id);
      setFeedbackGiven(true);
    }
  };

  const handleNotHelpful = () => {
    if (!feedbackGiven) {
      onNotHelpful(faq.id);
      setFeedbackGiven(true);
    }
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        mb: 2,
        '&:before': { display: 'none' },
        '&.Mui-expanded': {
          boxShadow: (theme) => theme.shadows[2]
        }
      }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="eva:arrow-down-fill" />}
        sx={{
          px: 3,
          py: 2,
          '&.Mui-expanded': {
            minHeight: 'auto',
            '& .MuiAccordionSummary-content': {
              margin: '12px 0'
            }
          }
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
            {faq.question}
          </Typography>
          <Chip
            label={faq.category}
            size="small"
            variant="outlined"
            sx={{ ml: 'auto' }}
          />
        </Stack>
      </AccordionSummary>
      
      <AccordionDetails sx={{ px: 3, pb: 3 }}>
        <Stack spacing={3}>
          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            {faq.answer}
          </Typography>
          
          <Divider />
          
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Was this helpful?
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant={feedbackGiven ? "outlined" : "text"}
                startIcon={<Iconify icon="eva:thumbs-up-fill" />}
                onClick={handleHelpful}
                disabled={feedbackGiven}
                sx={{
                  color: feedbackGiven ? 'success.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: 'success.lighter'
                  }
                }}
              >
                {faq.helpful}
              </Button>
              
              <Button
                size="small"
                variant={feedbackGiven ? "outlined" : "text"}
                startIcon={<Iconify icon="eva:thumbs-down-fill" />}
                onClick={handleNotHelpful}
                disabled={feedbackGiven}
                sx={{
                  color: feedbackGiven ? 'error.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: 'error.lighter'
                  }
                }}
              >
                {faq.notHelpful}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

// Search and Filter Component
function SearchAndFilter({ searchQuery, onSearchChange, selectedCategory, onCategoryChange }) {
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Stack spacing={3}>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              borderRadius: 2
            }
          }}
        />
        
        {/* Category Filter */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {FAQ_CATEGORIES.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => onCategoryChange(category)}
              variant={selectedCategory === category ? "filled" : "outlined"}
              color={selectedCategory === category ? "primary" : "default"}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: selectedCategory === category ? 'primary.dark' : 'action.hover'
                }
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

// Contact Support Component
function ContactSupport() {
  return (
    <Card sx={{ bgcolor: 'primary.lighter', border: '1px solid', borderColor: 'primary.main' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify icon="eva:message-circle-fill" sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Still need help?
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400 }}>
            Can't find what you're looking for? Our support team is here to help you with any questions or concerns.
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:message-circle-fill" />}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Start Live Chat
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:email-fill" />}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'primary.lighter'
                }
              }}
            >
              Email Support
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// Main FAQ Page Component
export default function FAQPage({ params }) {
  // Handle both Promise and resolved params
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { storeId } = resolvedParams;
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch FAQ data from API
  useEffect(() => {
    async function fetchFAQs() {
      try {
        setLoading(true);
        const response = await storefrontApi.getFAQs(storeId);
        if (response.success && response.data && response.data.length > 0) {
          // Transform API data to match expected format
          const transformedFaqs = response.data.map(faq => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: 'General', // API doesn't have category, default to General
            active: faq.is_active !== false,
            helpful: 0,
            notHelpful: 0
          }));
          setFaqs(transformedFaqs);
        } else {
          // Use fallback FAQs if no data from API
          setFaqs(FALLBACK_FAQS);
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError(err.message);
        // Use fallback FAQs on error
        setFaqs(FALLBACK_FAQS);
      } finally {
        setLoading(false);
      }
    }

    if (storeId) {
      fetchFAQs();
    }
  }, [storeId]);

  // Set page title
  useEffect(() => {
    document.title = `FAQ | ${storeId} | STUDIO360`;
  }, [storeId]);

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory && faq.active;
  });

  const handleHelpful = (faqId) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === faqId ? { ...faq, helpful: faq.helpful + 1 } : faq
    ));
  };

  const handleNotHelpful = (faqId) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === faqId ? { ...faq, notHelpful: faq.notHelpful + 1 } : faq
    ));
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Header */}
      <StoreHeader storeId={storeId} />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={4}>
          {/* Page Header */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
              Find answers to common questions about our products, shipping, returns, and more.
            </Typography>
          </Box>

          {/* Search and Filter */}
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* FAQ Results */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'Question' : 'Questions'} Found
              </Typography>
              
              {searchQuery && (
                <Button
                  variant="text"
                  onClick={() => setSearchQuery('')}
                  startIcon={<Iconify icon="eva:close-fill" />}
                >
                  Clear Search
                </Button>
              )}
            </Stack>

            {/* FAQ List */}
            {filteredFaqs.length > 0 ? (
              <Stack spacing={2}>
                {filteredFaqs.map((faq) => (
                  <FAQItem
                    key={faq.id}
                    faq={faq}
                    onHelpful={handleHelpful}
                    onNotHelpful={handleNotHelpful}
                  />
                ))}
              </Stack>
            ) : (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Iconify
                  icon="eva:search-outline"
                  sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
                />
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                  No FAQs found
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                  Try adjusting your search terms or browse different categories
                </Typography>
              </Card>
            )}
          </Box>

          {/* Contact Support */}
          <ContactSupport />
        </Stack>
      </Container>

      {/* Footer */}
      <StoreFooter storeId={storeId} />
    </Box>
  );
}
