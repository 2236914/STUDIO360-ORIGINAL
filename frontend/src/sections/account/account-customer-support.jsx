import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { useBoolean } from 'src/hooks/use-boolean';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export function AccountCustomerSupport() {
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [gmailEnabled, setGmailEnabled] = useState(true);
  const [faqChatbotEnabled, setFaqChatbotEnabled] = useState(true);
  
  const [faqs, setFaqs] = useState([
    {
      id: '1',
      question: 'What are your shipping options?',
      answer: 'We offer multiple shipping options through JNT Express and SPX. Metro Manila delivery takes 1-2 days, while provincial delivery takes 3-5 days.',
      category: 'Shipping',
      active: true,
    },
    {
      id: '2',
      question: 'How can I track my order?',
      answer: 'You can track your order using the tracking number sent to your email. Visit our tracking page or contact our support team.',
      category: 'Orders',
      active: true,
    },
    {
      id: '3',
      question: 'What is your return policy?',
      answer: 'We accept returns within 7 days of delivery. Items must be in original condition with tags attached.',
      category: 'Returns',
      active: true,
    },
  ]);

  const faqDialog = useBoolean();
  const editFaqDialog = useBoolean();
  const deleteFaqDialog = useBoolean();
  const [currentFaq, setCurrentFaq] = useState(null);

  const methods = useForm({
    defaultValues: {
      whatsappNumber: '+63 912 345 6789',
      whatsappWelcomeMessage: 'Hi! Welcome to Kitsch Studio! How can we help you today?',
      whatsappBusinessHours: 'Monday to Friday, 9AM to 6PM',
      gmailAddress: 'kitschstudioofficial@gmail.com',
      gmailAutoReply: 'Thank you for contacting us! We will get back to you within 24 hours.',
      gmailSignature: 'Best regards,\nKitsch Studio Support Team\nkitschstudioofficial@gmail.com',
      faqChatbotName: 'Kitsch Assistant',
      faqWelcomeMessage: 'Hello! I\'m here to help answer your questions. You can ask me about shipping, orders, returns, and more!',
      faqFallbackMessage: 'I\'m sorry, I don\'t have an answer for that question. Let me connect you with our support team.',
    },
  });

  const faqMethods = useForm({
    defaultValues: {
      question: '',
      answer: '',
      category: '',
    },
  });

  const handleSave = useCallback(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Customer support settings updated successfully!');
      console.info('Customer Support Data:', { ...data, whatsappEnabled, gmailEnabled, faqChatbotEnabled, faqs });
    } catch (error) {
      toast.error('Failed to update customer support settings');
    }
  }, [whatsappEnabled, gmailEnabled, faqChatbotEnabled, faqs]);

  const handleTestWhatsApp = useCallback(() => {
    const phoneNumber = methods.getValues('whatsappNumber');
    const message = methods.getValues('whatsappWelcomeMessage');
    
    // Remove non-numeric characters from phone number
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new window
    window.open(whatsappUrl, '_blank');
    toast.info('WhatsApp test link opened in new window');
  }, [methods]);

  const handleTestGmail = useCallback(() => {
    const email = methods.getValues('gmailAddress');
    const subject = 'Test Email from Kitsch Studio';
    const body = methods.getValues('gmailAutoReply');
    
    // Create mailto URL
    const gmailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.location.href = gmailUrl;
    toast.info('Email client opened');
  }, [methods]);

  const handleAddFaq = useCallback(async (data) => {
    try {
      const newFaq = {
        id: Date.now().toString(),
        question: data.question,
        answer: data.answer,
        category: data.category,
        active: true,
      };
      setFaqs((prev) => [...prev, newFaq]);
      faqMethods.reset();
      faqDialog.onFalse();
      toast.success('FAQ added successfully!');
    } catch (error) {
      toast.error('Failed to add FAQ');
    }
  }, [faqMethods, faqDialog]);

  const handleEditFaq = useCallback((faq) => {
    setCurrentFaq(faq);
    faqMethods.reset({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
    });
    editFaqDialog.onTrue();
  }, [faqMethods, editFaqDialog]);

  const handleUpdateFaq = useCallback(async (data) => {
    try {
      setFaqs((prev) => prev.map((faq) =>
        faq.id === currentFaq.id
          ? { ...faq, question: data.question, answer: data.answer, category: data.category }
          : faq
      ));
      editFaqDialog.onFalse();
      setCurrentFaq(null);
      toast.success('FAQ updated successfully!');
    } catch (error) {
      toast.error('Failed to update FAQ');
    }
  }, [currentFaq, editFaqDialog]);

  const handleDeleteFaq = useCallback((faq) => {
    setCurrentFaq(faq);
    deleteFaqDialog.onTrue();
  }, [deleteFaqDialog]);

  const confirmDeleteFaq = useCallback(() => {
    setFaqs((prev) => prev.filter((faq) => faq.id !== currentFaq.id));
    deleteFaqDialog.onFalse();
    setCurrentFaq(null);
    toast.success('FAQ deleted successfully!');
  }, [currentFaq, deleteFaqDialog]);

  const handleToggleFaq = useCallback((faqId) => {
    setFaqs((prev) => prev.map((faq) =>
      faq.id === faqId ? { ...faq, active: !faq.active } : faq
    ));
    toast.success('FAQ status updated!');
  }, []);

  return (
    <Form methods={methods} onSubmit={methods.handleSubmit(handleSave)}>
      <Stack spacing={3}>
        {/* WhatsApp Section */}
        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="ic:baseline-whatsapp" width={32} sx={{ color: '#25D366' }} />
                <Typography variant="h6">WhatsApp Integration</Typography>
              </Stack>
              <FormControlLabel
                control={
                  <Switch
                    checked={whatsappEnabled}
                    onChange={(event) => setWhatsappEnabled(event.target.checked)}
                  />
                }
                label={whatsappEnabled ? 'Enabled' : 'Disabled'}
              />
            </Stack>

            {whatsappEnabled && (
              <Stack spacing={3}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Configure your WhatsApp business integration for automated customer support.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Field.Text
                      name="whatsappNumber"
                      label="WhatsApp Business Number"
                      placeholder="+63 912 345 6789"
                      InputProps={{
                        startAdornment: (
                          <Iconify icon="ic:baseline-whatsapp" sx={{ color: '#25D366', mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field.Text
                      name="whatsappBusinessHours"
                      label="Business Hours"
                      placeholder="Monday to Friday, 9AM to 6PM"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field.Text
                      name="whatsappWelcomeMessage"
                      label="Welcome Message"
                      multiline
                      rows={3}
                      placeholder="Hi! Welcome to our store..."
                    />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="ic:baseline-whatsapp" />}
                    onClick={handleTestWhatsApp}
                    sx={{ color: '#25D366', borderColor: '#25D366' }}
                  >
                    Test WhatsApp
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:settings-bold" />}
                    disabled
                    sx={{ opacity: 0.5 }}
                  >
                    Configure Automation (Coming Soon)
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        </Card>

        {/* Gmail Section */}
        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="logos:google-gmail" width={32} />
                <Typography variant="h6">Gmail Integration</Typography>
              </Stack>
              <FormControlLabel
                control={
                  <Switch
                    checked={gmailEnabled}
                    onChange={(event) => setGmailEnabled(event.target.checked)}
                  />
                }
                label={gmailEnabled ? 'Enabled' : 'Disabled'}
              />
            </Stack>

            {gmailEnabled && (
              <Stack spacing={3}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Configure your Gmail business integration for automated email support.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Field.Text
                      name="gmailAddress"
                      label="Support Email Address"
                      placeholder="kitschstudioofficial@gmail.com"
                      InputProps={{
                        startAdornment: (
                          <Iconify icon="solar:letter-bold" sx={{ color: 'text.secondary', mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field.Text
                      name="gmailAutoReply"
                      label="Auto-Reply Message"
                      placeholder="Thank you for contacting us..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field.Text
                      name="gmailSignature"
                      label="Email Signature"
                      multiline
                      rows={4}
                      placeholder="Best regards,&#10;Your Company Name&#10;contact@company.com"
                    />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="logos:google-gmail" />}
                    onClick={handleTestGmail}
                  >
                    Test Email
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:settings-bold" />}
                    disabled
                    sx={{ opacity: 0.5 }}
                  >
                    Configure Automation (Coming Soon)
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        </Card>

        {/* FAQ Chatbot Section */}
        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="solar:chat-round-dots-bold" width={32} sx={{ color: 'primary.main' }} />
                <Typography variant="h6">FAQ Chatbot</Typography>
              </Stack>
              <FormControlLabel
                control={
                  <Switch
                    checked={faqChatbotEnabled}
                    onChange={(event) => setFaqChatbotEnabled(event.target.checked)}
                  />
                }
                label={faqChatbotEnabled ? 'Enabled' : 'Disabled'}
              />
            </Stack>

            {faqChatbotEnabled && (
              <Stack spacing={3}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Configure your AI-powered FAQ chatbot to automatically answer common customer questions.
                  This will provide instant support and reduce manual response time.
                </Typography>

                {/* Chatbot Settings */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Field.Text
                      name="faqChatbotName"
                      label="Chatbot Name"
                      placeholder="e.g., Kitsch Assistant"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Total Active FAQs: {faqs.filter(faq => faq.active).length}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      onClick={faqDialog.onTrue}
                      size="small"
                    >
                      Add FAQ
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Field.Text
                      name="faqWelcomeMessage"
                      label="Welcome Message"
                      multiline
                      rows={2}
                      placeholder="Hello! I'm here to help answer your questions..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field.Text
                      name="faqFallbackMessage"
                      label="Fallback Message (when no answer found)"
                      multiline
                      rows={2}
                      placeholder="I'm sorry, I don't have an answer for that question..."
                    />
                  </Grid>
                </Grid>

                {/* FAQ List */}
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1">FAQ Management</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {faqs.length} total FAQs ({faqs.filter(faq => faq.active).length} active)
                    </Typography>
                  </Stack>

                  {faqs.length === 0 ? (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        No FAQs configured yet
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={faqDialog.onTrue}
                      >
                        Add First FAQ
                      </Button>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {faqs.map((faq, index) => (
                        <Accordion key={faq.id} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                          <AccordionSummary
                            expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                            sx={{ 
                              bgcolor: faq.active ? 'background.paper' : 'background.neutral',
                              '& .MuiAccordionSummary-content': { alignItems: 'center' }
                            }}
                          >
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', mr: 2 }}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: faq.active ? 'success.main' : 'grey.400',
                                  }}
                                />
                                <Stack>
                                  <Typography variant="subtitle2">
                                    {faq.question}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Category: {faq.category}
                                  </Typography>
                                </Stack>
                              </Stack>
                              
                              <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditFaq(faq)}
                                >
                                  <Iconify icon="solar:pen-bold" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color={faq.active ? 'warning' : 'success'}
                                  onClick={() => handleToggleFaq(faq.id)}
                                >
                                  <Iconify icon={faq.active ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteFaq(faq)}
                                >
                                  <Iconify icon="solar:trash-bin-trash-bold" />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              <strong>Answer:</strong> {faq.answer}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  )}
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:chat-round-dots-bold" />}
                    onClick={() => toast.info('Chatbot preview will be available soon!')}
                  >
                    Preview Chatbot
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Iconify icon="solar:settings-bold" />}
                    disabled
                    sx={{ opacity: 0.5 }}
                  >
                    Configure AI Training (Coming Soon)
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        </Card>


        {/* Save Button */}
        <Stack direction="row" justifyContent="flex-end">
          <Button type="submit" variant="contained" size="large">
            Save Customer Support Settings
          </Button>
        </Stack>

        {/* Add FAQ Dialog */}
        <Dialog open={faqDialog.value} onClose={faqDialog.onFalse} maxWidth="md" fullWidth>
          <DialogTitle>Add FAQ</DialogTitle>
          <Form methods={faqMethods} onSubmit={faqMethods.handleSubmit(handleAddFaq)}>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Field.Text
                  name="category"
                  label="Category"
                  placeholder="e.g., Shipping, Orders, Returns, Payment"
                  autoFocus
                />
                <Field.Text
                  name="question"
                  label="Question"
                  placeholder="e.g., What are your shipping options?"
                  multiline
                  rows={2}
                />
                <Field.Text
                  name="answer"
                  label="Answer"
                  placeholder="Provide a detailed answer to help customers..."
                  multiline
                  rows={4}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={faqDialog.onFalse}>Cancel</Button>
              <Button type="submit" variant="contained">
                Add FAQ
              </Button>
            </DialogActions>
          </Form>
        </Dialog>

        {/* Edit FAQ Dialog */}
        <Dialog open={editFaqDialog.value} onClose={editFaqDialog.onFalse} maxWidth="md" fullWidth>
          <DialogTitle>Edit FAQ</DialogTitle>
          <Form methods={faqMethods} onSubmit={faqMethods.handleSubmit(handleUpdateFaq)}>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Field.Text
                  name="category"
                  label="Category"
                  placeholder="e.g., Shipping, Orders, Returns, Payment"
                  autoFocus
                />
                <Field.Text
                  name="question"
                  label="Question"
                  placeholder="e.g., What are your shipping options?"
                  multiline
                  rows={2}
                />
                <Field.Text
                  name="answer"
                  label="Answer"
                  placeholder="Provide a detailed answer to help customers..."
                  multiline
                  rows={4}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={editFaqDialog.onFalse}>Cancel</Button>
              <Button type="submit" variant="contained">
                Update FAQ
              </Button>
            </DialogActions>
          </Form>
        </Dialog>

        {/* Delete FAQ Confirmation Dialog */}
        <Dialog open={deleteFaqDialog.value} onClose={deleteFaqDialog.onFalse} maxWidth="sm" fullWidth>
          <DialogTitle>Delete FAQ</DialogTitle>
          <DialogContent>
            <Typography sx={{ mt: 1 }}>
              Are you sure you want to delete this FAQ?
            </Typography>
            {currentFaq && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {currentFaq.question}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  Category: {currentFaq.category}
                </Typography>
              </Box>
            )}
            <Typography variant="body2" sx={{ color: 'warning.main', mt: 2 }}>
              ⚠️ This action cannot be undone. The FAQ will be permanently removed from your chatbot.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={deleteFaqDialog.onFalse}>Cancel</Button>
            <Button onClick={confirmDeleteFaq} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Form>
  );
}
