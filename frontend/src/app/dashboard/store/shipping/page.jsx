'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Stack,
  Typography,
  Grid,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Fab,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function ShippingReturnsPage() {
  useEffect(() => {
    document.title = 'Shipping & Returns | STUDIO360';
  }, []);

  // State for shipping section
  const [shippingSection, setShippingSection] = useState({
    headerImage: null,
    localShipping: {
      enabled: true,
      description: 'We ship locally within 3-5 business days. Returns within 5-7 days across Australia.',
    },
    internationalShipping: {
      enabled: true,
      description: 'Global delivery available for many items. Shipping information provided for every order.',
    },
    shippingRates: {
      enabled: true,
      description: 'Flat rate of $10 for local delivery. International shipping calculated at checkout.',
    },
  });

  // State for return policy
  const [returnPolicy, setReturnPolicy] = useState({
    description: `We want you to love your Kitsch Studio piece. Returns are straightforward and hassle-free:

• Returns accepted within 14 days
• Items must be unused and in original packaging
• Free return shipping for faulty or damaged items
• Simply contact us to initiate return process`
  });

  // State for FAQ section
  const [faqSection, setFaqSection] = useState([
    {
      id: 1,
      question: 'What shipping options do you offer?',
      answer: 'We offer standard and express shipping options. Standard shipping takes 5-7 business days while express shipping takes 2-3 business days.',
      visible: true,
    },
    {
      id: 2,
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most countries worldwide. International shipping costs vary by destination and will be calculated at checkout.',
      visible: true,
    },
    {
      id: 3,
      question: 'What is your return policy?',
      answer: 'We accept returns within 14 days of delivery. Items must be unused and in original packaging. Free returns for faulty items.',
      visible: true,
    },
    {
      id: 4,
      question: 'How can I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can use this to track your package on our website.',
      visible: true,
    },
  ]);

  const [expanded, setExpanded] = useState('shipping');
  const [saveStatus, setSaveStatus] = useState('');

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 1000);
  };

  const addFAQ = () => {
    const newFAQ = {
      id: Date.now(),
      question: 'New question',
      answer: 'Your answer here...',
      visible: true,
    };
    setFaqSection(prev => [...prev, newFAQ]);
  };

  const updateFAQ = (id, field, value) => {
    setFaqSection(prev => 
      prev.map(faq => 
        faq.id === id ? { ...faq, [field]: value } : faq
      )
    );
  };

  const deleteFAQ = (id) => {
    setFaqSection(prev => prev.filter(faq => faq.id !== id));
  };

  const toggleFAQVisibility = (id) => {
    setFaqSection(prev => 
      prev.map(faq => 
        faq.id === id ? { ...faq, visible: !faq.visible } : faq
      )
    );
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Shipping & Returns"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Store', href: paths.dashboard.store.root },
          { name: 'Shipping & Returns' },
        ]}
        action={
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:external-link-fill" />}
            onClick={() => window.open('/stores/your-store-id/shipping', '_blank')}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:save-fill" />}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Save Status Alert */}
      {saveStatus === 'saved' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Shipping & Returns changes saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Editor Panel */}
        <Grid item xs={12} md={8}>
          {/* Section 1: Shipping Information */}
          <Accordion 
            expanded={expanded === 'shipping'} 
            onChange={handleAccordionChange('shipping')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:car-fill" sx={{ color: 'primary.main' }} />
                <Typography variant="h6">Shipping Information Section</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                {/* Header Image Upload */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Header Image (Optional)
                  </Typography>
                  <Upload
                    file={shippingSection.headerImage}
                    onDrop={(acceptedFiles) => {
                      const file = acceptedFiles[0];
                      if (file) {
                        setShippingSection(prev => ({ ...prev, headerImage: file }));
                      }
                    }}
                    sx={{ 
                      minHeight: 200,
                      '& > div': {
                        minHeight: 200,
                      }
                    }}
                  />
                </Box>

                {/* Local Shipping */}
                <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Local Shipping
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={shippingSection.localShipping.enabled}
                            onChange={(e) => setShippingSection(prev => ({
                              ...prev,
                              localShipping: { ...prev.localShipping, enabled: e.target.checked }
                            }))}
                          />
                        }
                        label="Enable"
                      />
                    </Stack>
                    {shippingSection.localShipping.enabled && (
                      <TextField
                        fullWidth
                        label="Local Shipping Description"
                        value={shippingSection.localShipping.description}
                        onChange={(e) => setShippingSection(prev => ({
                          ...prev,
                          localShipping: { ...prev.localShipping, description: e.target.value }
                        }))}
                        multiline
                        rows={3}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Stack>
                </Card>

                {/* International Shipping */}
                <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        International Shipping
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={shippingSection.internationalShipping.enabled}
                            onChange={(e) => setShippingSection(prev => ({
                              ...prev,
                              internationalShipping: { ...prev.internationalShipping, enabled: e.target.checked }
                            }))}
                          />
                        }
                        label="Enable"
                      />
                    </Stack>
                    {shippingSection.internationalShipping.enabled && (
                      <TextField
                        fullWidth
                        label="International Shipping Description"
                        value={shippingSection.internationalShipping.description}
                        onChange={(e) => setShippingSection(prev => ({
                          ...prev,
                          internationalShipping: { ...prev.internationalShipping, description: e.target.value }
                        }))}
                        multiline
                        rows={3}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Stack>
                </Card>

                {/* Shipping Rates */}
                <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Shipping Rates
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={shippingSection.shippingRates.enabled}
                            onChange={(e) => setShippingSection(prev => ({
                              ...prev,
                              shippingRates: { ...prev.shippingRates, enabled: e.target.checked }
                            }))}
                          />
                        }
                        label="Enable"
                      />
                    </Stack>
                    {shippingSection.shippingRates.enabled && (
                      <TextField
                        fullWidth
                        label="Shipping Rates Description"
                        value={shippingSection.shippingRates.description}
                        onChange={(e) => setShippingSection(prev => ({
                          ...prev,
                          shippingRates: { ...prev.shippingRates, description: e.target.value }
                        }))}
                        multiline
                        rows={3}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Stack>
                </Card>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Section 2: Return Policy */}
          <Accordion 
            expanded={expanded === 'returns'} 
            onChange={handleAccordionChange('returns')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:undo-fill" sx={{ color: 'warning.main' }} />
                <Typography variant="h6">Return Policy Section</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Describe your return policy clearly to build customer trust.
                </Typography>
                
                <TextField
                  fullWidth
                  label="Return Policy Description"
                  value={returnPolicy.description}
                  onChange={(e) => setReturnPolicy(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={8}
                  helperText="Use bullet points (•) for better readability"
                  sx={{ mt: 2 }}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Section 3: FAQ Section */}
          <Accordion 
            expanded={expanded === 'faq'} 
            onChange={handleAccordionChange('faq')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:question-mark-circle-fill" sx={{ color: 'info.main' }} />
                <Typography variant="h6">FAQ Section</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ({faqSection.filter(faq => faq.visible).length} visible)
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {faqSection.map((faq, index) => (
                  <Card key={faq.id} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          FAQ #{index + 1}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={faq.visible}
                                onChange={() => toggleFAQVisibility(faq.id)}
                              />
                            }
                            label="Visible"
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteFAQ(faq.id)}
                          >
                            <Iconify icon="eva:trash-2-fill" />
                          </IconButton>
                        </Stack>
                      </Stack>
                      
                      <TextField
                        fullWidth
                        label="Question"
                        value={faq.question}
                        onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                      />
                      
                      <TextField
                        fullWidth
                        label="Answer"
                        value={faq.answer}
                        onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                        multiline
                        rows={3}
                      />
                    </Stack>
                  </Card>
                ))}
                
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  onClick={addFAQ}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add New FAQ
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Preview Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Live Preview
            </Typography>
            
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              {/* Header Preview */}
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 1, fontSize: 14 }}>
                  Shipping and Returns
                </Typography>
                <Box
                  sx={{
                    height: 80,
                    bgcolor: 'background.neutral',
                    borderRadius: 1,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="eva:image-fill" sx={{ color: 'text.disabled', fontSize: 20 }} />
                </Box>
              </Box>

              <Divider />

              {/* Shipping Info Preview */}
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 12 }}>
                  Shipping Information
                </Typography>
                {shippingSection.localShipping.enabled && (
                  <Box sx={{ mb: 1, p: 1, bgcolor: 'background.neutral', borderRadius: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                      Local Shipping
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {shippingSection.localShipping.description.substring(0, 50)}...
                    </Typography>
                  </Box>
                )}
                {shippingSection.internationalShipping.enabled && (
                  <Box sx={{ mb: 1, p: 1, bgcolor: 'background.neutral', borderRadius: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                      International Shipping
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {shippingSection.internationalShipping.description.substring(0, 50)}...
                    </Typography>
                  </Box>
                )}
              </Box>

              <Divider />

              {/* Return Policy Preview */}
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 12 }}>
                  Return Policy
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {returnPolicy.description.substring(0, 100)}...
                </Typography>
              </Box>

              <Divider />

              {/* FAQ Preview */}
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 12 }}>
                  FAQ ({faqSection.filter(faq => faq.visible).length} items)
                </Typography>
                {faqSection.filter(faq => faq.visible).slice(0, 2).map((faq) => (
                  <Box key={faq.id} sx={{ mb: 1, p: 1, bgcolor: 'background.neutral', borderRadius: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                      {faq.question.substring(0, 30)}...
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {faq.answer.substring(0, 40)}...
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
