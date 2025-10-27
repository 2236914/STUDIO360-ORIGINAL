'use client';

/**
 * ChatWidget Component - Frontstore Customer Support Chatbot with Groq Integration
 * 
 * Features:
 * 1. Loads FAQs from database via /api/assistant/faqs/:subdomain
 * 2. Uses Groq AI for intelligent responses when seller is offline
 * 3. Real-time chat when seller is online
 * 4. Automatic email notification when seller is offline (Groq reply + email)
 * 
 * Groq Setup (in backend/.env):
 * - LLM_API_KEY=gsk_your_groq_api_key
 * - LLM_MODEL=llama-3.3-70b-versatile
 * - LLM_PROVIDER=groq
 * 
 * TODO: Implement seller online/offline status tracking
 * TODO: Add email notification when seller is offline
 */

import { useRef, useState, useEffect } from 'react';

import {
  Box,
  Chip,
  Fade,
  Stack,
  Slide,
  Button,
  Avatar,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import axios from 'axios';
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

// FAQ data from Kitsch Studio client
const MOCK_FAQ = [
  {
    id: 1,
    question: "What are your shipping options?",
    answer: "We offer multiple shipping options through JNT Express and SPX. Metro Manila delivery takes 1-2 days, while provincial delivery takes 3-5 days. We also offer same-day delivery for Metro Manila orders placed before 2 PM."
  },
  {
    id: 2,
    question: "How do I track my order?",
    answer: "You can track your order using the tracking number sent to your email. Visit our tracking page or contact our support team. You can also use our chatbot to get instant tracking information by providing your order number and email."
  },
  {
    id: 3,
    question: "What is your return policy?",
    answer: "We accept returns within 7 days of delivery. Items must be in original condition with tags attached. Please contact our support team to initiate a return. Refunds will be processed within 3-5 business days after we receive the returned item."
  },
  {
    id: 4,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, GCash, PayMaya, and bank transfers. All payments are processed securely through our payment partners."
  },
  {
    id: 5,
    question: "Do you offer bulk discounts?",
    answer: "Yes! We offer special pricing for bulk orders. Contact us directly for custom quotes on orders over 50 items. We also have special packages for events, corporate orders, and resellers."
  },
  {
    id: 6,
    question: "How can I contact customer support?",
    answer: "You can reach us through our live chat widget, email at kitschstudioofficial@gmail.com, or WhatsApp. Our support team is available Monday to Friday, 9 AM to 6 PM. For urgent matters, use our live chat for faster response."
  },
  {
    id: 7,
    question: "What are your customer support hours?",
    answer: "Our customer support is available Monday to Friday, 9 AM to 6 PM (Philippine Standard Time). Our online store is open 24/7 for orders. Processing and shipping happen during business days."
  },
  {
    id: 8,
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within the Philippines. We are working on international shipping options and will announce them soon. Follow our social media for updates on international shipping availability."
  }
];

// Chat message component
function ChatMessage({ message, isUser, timestamp, avatar }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent={isUser ? 'flex-end' : 'flex-start'}
      sx={{ mb: 2 }}
    >
      {!isUser && avatar && (
        <Avatar
          src={avatar}
          sx={{ width: 32, height: 32, mt: 0.5 }}
        />
      )}
      <Stack
        sx={{
          maxWidth: '80%',
          bgcolor: isUser ? 'primary.main' : 'grey.100',
          color: isUser ? 'white' : 'text.primary',
          px: 2,
          py: 1.5,
          borderRadius: 2,
          position: 'relative'
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
          {message}
        </Typography>
        {timestamp && (
          <Typography
            variant="caption"
            sx={{
              color: isUser ? 'rgba(255,255,255,0.7)' : 'text.secondary',
              fontSize: '0.7rem',
              mt: 0.5,
              display: 'block'
            }}
          >
            {timestamp}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

// Pre-chat form component
function PreChatForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    optIn: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.email) {
      onSubmit(formData);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
        Before we get started
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.5 }}>
        Please provide your information so we can reply to you if you leave the chat.
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: 2
              }
            }}
          />
          
          <TextField
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: 2
              }
            }}
          />
          
          <TextField
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: 2
              }
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.optIn}
                onChange={(e) => setFormData({ ...formData, optIn: e.target.checked })}
                size="small"
              />
            }
            label={
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Opt in to get special email promotions and updates. You can opt out anytime.
              </Typography>
            }
            sx={{ alignItems: 'flex-start', mt: 1 }}
          />

          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4, mt: 2 }}>
            By proceeding, you agree to the sharing of your data with third parties for the provision, and improvement, of the services. This site is protected by hCaptcha and its{' '}
            <Typography component="span" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
              Privacy Policy
            </Typography>{' '}
            and{' '}
            <Typography component="span" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
              Terms of Service
            </Typography>{' '}
            apply.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{ flex: 1, borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ 
                flex: 1, 
                borderRadius: 2,
                bgcolor: 'grey.600',
                '&:hover': { bgcolor: 'grey.700' }
              }}
            >
              Start chat
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}

// Unique ID generator to prevent duplicate keys
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Main chat widget component
export function ChatWidget({ storeName = "Kitsch Studio" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('initial'); // initial, prechat, chat
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isOnline, setIsOnline] = useState(true); // Seller online status
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [faqsLoaded, setFaqsLoaded] = useState(false);
  const [awaitingEmail, setAwaitingEmail] = useState(false);
  const [collectedEmail, setCollectedEmail] = useState(null);
  const [collectedName, setCollectedName] = useState('Customer');
  const [showEndChatConfirm, setShowEndChatConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load FAQs when component mounts
  useEffect(() => {
    const loadFAQs = async () => {
      if (faqsLoaded) return;
      
      try {
        // Get subdomain from the current path or use storeName
        // For now, just use default subdomain since we don't have dynamic routing
        const subdomain = storeName || 'default';
        const response = await axios.get(`${CONFIG.site.serverUrl}/api/assistant/faqs/${subdomain}`);
        
        if (response.data.success && response.data.data.length > 0) {
          // Use database FAQs - remove duplicates by question
          const uniqueFAQs = response.data.data.filter((faq, index, self) =>
            index === self.findIndex(f => f.question === faq.question)
          );
          setFaqs(uniqueFAQs);
        } else {
          // Fallback to mock FAQs
          setFaqs(MOCK_FAQ);
        }
        setFaqsLoaded(true);
      } catch (error) {
        console.error('Error loading FAQs:', error);
        // Fallback to mock FAQs on error
        setFaqs(MOCK_FAQ);
        setFaqsLoaded(true);
      }
    };

    loadFAQs();
  }, [storeName, faqsLoaded]);

  // FAQ search from loaded FAQs
  const searchFAQ = (query) => {
    if (faqs.length === 0) return null;
    const lowerQuery = query.toLowerCase();
    return faqs.find(faq => 
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery)
    );
  };

  const handleInitialChat = () => {
    setCurrentView('prechat');
  };

  const handleDirectChat = (message) => {
    // Go directly to chat without pre-chat form
    setCurrentView('chat');
    setMessages([]);
    
    // Add simple welcome message
    const welcomeMessage = {
      id: generateUniqueId(),
      message: 'Hi! How can I help you today?',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '/placeholder.svg'
    };
    setMessages([welcomeMessage]);
    
    // Send the message if provided
    if (message && message.trim()) {
      handleSendDirectMessage(message.trim());
    }
    setUserInput('');
  };

  const handleSendDirectMessage = async (message) => {
    // Check if we're waiting for email and this message contains an email
    if (awaitingEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const possibleEmail = message.trim();
      
      if (emailRegex.test(possibleEmail)) {
        setCollectedEmail(possibleEmail);
        setAwaitingEmail(false);
        
        // Show confirmation
        const confirmMessage = {
          id: generateUniqueId(),
          message: `Thanks! I've saved your email (${possibleEmail}). Now, how can I help you today?`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '/placeholder.svg'
        };
        setMessages(prev => [...prev, confirmMessage]);
        return; // Don't send email as a question
      }
    }
    
    const userMessage = {
      id: generateUniqueId(),
      message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${CONFIG.site.serverUrl}/api/assistant/message`, {
        message,
        sessionId: sessionId,
        context: {
          storeName,
          page: 'storefront',
          email: collectedEmail,
          name: collectedName
        }
      });

      if (response.data.success) {
        const assistantMessage = {
          id: generateUniqueId() + 1,
          message: response.data.data.reply,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '/placeholder.svg'
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (response.data.data.sessionId && !sessionId) {
          setSessionId(response.data.data.sessionId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const faqMatch = searchFAQ(message);
      
      let responseMessage;
      if (faqMatch) {
        responseMessage = {
          id: generateUniqueId(),
          message: faqMatch.answer,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '/placeholder.svg'
        };
      } else {
        responseMessage = {
          id: generateUniqueId(),
          message: "I'm having trouble connecting right now. Please try again in a moment.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '/placeholder.svg'
        };
      }
      setMessages(prev => [...prev, responseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFAQClick = async (question) => {
    // Show pre-chat form first (as requested in UX feedback)
    // Store the FAQ question to send after form submission
    sessionStorage.setItem('pendingFAQ', question);
    setCurrentView('prechat');
    setMessages([]);
  };

  const handlePreChatSubmit = async (formData) => {
    setUserInfo(formData);
    setCurrentView('chat');
    
    // Check if there's a pending FAQ question
    const pendingFAQ = sessionStorage.getItem('pendingFAQ');
    
    // Add welcome message
    const welcomeMessage = {
      id: generateUniqueId(),
      message: `Hi ${formData.firstName}! How can I help you today?`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '/placeholder.svg'
    };
    setMessages([welcomeMessage]);
    
    // If there's a pending FAQ, send it
    if (pendingFAQ) {
      sessionStorage.removeItem('pendingFAQ');
      setTimeout(() => {
        handleSendDirectMessage(pendingFAQ);
      }, 500);
    }
  };


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = {
      id: generateUniqueId(),
      message: userInput,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const messageText = userInput;
    setUserInput('');

    try {
      // Call backend assistant API
      const response = await axios.post(`${CONFIG.site.serverUrl}/api/assistant/message`, {
        message: messageText,
        sessionId: sessionId,
        context: {
          storeName,
          userInfo,
          page: 'storefront'
        }
      });

      if (response.data.success) {
        const assistantMessage = {
          id: generateUniqueId() + 1,
          message: response.data.data.reply,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '/placeholder.svg'
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Set session ID if we got one
        if (response.data.data.sessionId && !sessionId) {
          setSessionId(response.data.data.sessionId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to FAQ search
      const faqMatch = searchFAQ(messageText);
      
      let responseMessage;
      if (faqMatch) {
        responseMessage = {
          id: generateUniqueId(),
          message: faqMatch.answer,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '/placeholder.svg'
        };
      } else {
        responseMessage = {
          id: generateUniqueId(),
          message: "I'm having trouble connecting right now. Please try again in a moment.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '/placeholder.svg'
        };
      }
      setMessages(prev => [...prev, responseMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentView === 'prechat') {
      setCurrentView('initial');
    } else if (currentView === 'chat') {
      setCurrentView('initial');
      setMessages([]);
      setUserInfo(null);
      setSessionId(null);
      setUserInput(''); // Clear any pending input
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'prechat':
        return (
          <Box sx={{ height: '100%', overflowY: 'auto' }}>
            <PreChatForm onSubmit={handlePreChatSubmit} onCancel={handleBack} />
          </Box>
        );
      case 'chat':
        return (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            {/* Messages */}
            <Box sx={{ flex: 1, pt: 2, px: 2, pb: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              {!isOnline && (
                <ChatMessage
                  message="Hi, we're not currently online. So please send any info that will help us best assist you. We'll respond as soon as we can via the contact information you provided."
                  isUser={false}
                  timestamp="Automated"
                />
              )}
              
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg.message}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                  avatar={msg.avatar}
                />
              ))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box sx={{ pt: 1.5, px: 2, pb: 1.5, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
              <Stack spacing={1}>
                <form onSubmit={handleSendMessage}>
                  <TextField
                    fullWidth
                    placeholder="Type message"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    size="small"
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: 'divider'
                        }
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton 
                          type="submit" 
                          size="small" 
                          disabled={isLoading || !userInput.trim()}
                          sx={{ mr: -1.5 }}
                        >
                          <Iconify icon="eva:paper-plane-fill" />
                        </IconButton>
                      )
                    }}
                  />
                </form>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => setShowEndChatConfirm(true)}
                  sx={{ 
                    color: 'text.secondary',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main'
                    }
                  }}
                >
                  End chat
                </Button>
              </Stack>
            </Box>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 2, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Chatbot Branding */}
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary', 
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 1.5,
                display: 'block'
              }}
            >
              STUDIO 360 CHATBOT
            </Typography>

            {/* FAQ Chips - Vertical Layout */}
            <Box sx={{ flex: 1, mb: 2 }}>
              <Stack spacing={0.75}>
                {(faqs.length > 0 ? faqs : MOCK_FAQ)
                  .slice(0, 6)
                  .map((faq, index) => (
                  <Chip
                    key={faq.id || index}
                    label={faq.question}
                    onClick={() => handleFAQClick(faq.question)}
                sx={{
                      cursor: 'pointer',
                      justifyContent: 'flex-start',
                      bgcolor: 'background.paper',
                      border: '1px solid',
                  borderColor: 'divider',
                      height: 36,
                  color: 'text.primary',
                      fontSize: '0.8rem',
                      width: '100%',
                  '&:hover': {
                    borderColor: 'primary.main',
                        bgcolor: 'primary.lighter',
                        color: 'primary.main'
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Chat with us section - Moved to Bottom */}
            <Box sx={{ bgcolor: 'grey.800', p: 1, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 0.25, fontSize: '0.95rem' }}>
                Chat with us
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.75, fontSize: '0.8rem' }}>
                👋 Hi, message us with any questions. We're happy to help!
              </Typography>
              <TextField
                fullWidth
                placeholder="Write message"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 2
                  }
                }}
                onClick={handleInitialChat}
              />
            </Box>
          </Box>
        );
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        <Slide direction="up" in={!isOpen} mountOnEnter unmountOnExit>
          <IconButton
            onClick={() => setIsOpen(true)}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 56,
              height: 56,
              boxShadow: 3,
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <Iconify icon="eva:message-circle-fill" width={24} />
          </IconButton>
        </Slide>
      </Box>

      {/* Chat Widget */}
      <Fade in={isOpen}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 400 },
            maxWidth: 400,
            height: { xs: 'calc(100vh - 48px)', sm: 500 },
            maxHeight: 500,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 8,
            zIndex: 1001,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.800', flexShrink: 0 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={handleBack} size="small" sx={{ color: 'white' }}>
                <Iconify icon="eva:arrow-back-fill" />
              </IconButton>
              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, flex: 1 }}>
                {storeName}
              </Typography>
              {currentView === 'chat' && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: isOnline ? 'primary.light' : 'text.disabled',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem'
                  }}
                >
                  {isOnline ? "Online" : "Offline"}
                </Typography>
              )}
              <IconButton 
                onClick={() => setIsOpen(false)} 
                size="small" 
                sx={{ color: 'white' }}
              >
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Stack>
          </Box>

          {/* Content */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0
          }}>
            {renderContent()}
          </Box>
        </Box>
      </Fade>

      {/* End Chat Confirmation Dialog */}
      <Dialog
        open={showEndChatConfirm}
        onClose={() => setShowEndChatConfirm(false)}
        aria-labelledby="end-chat-dialog-title"
        aria-describedby="end-chat-dialog-description"
      >
        <DialogTitle id="end-chat-dialog-title">
          End Chat?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="end-chat-dialog-description">
            Are you sure you want to end this chat? Your conversation history will be lost and you'll return to the initial screen.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowEndChatConfirm(false)}
            autoFocus
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setMessages([]);
              setUserInfo(null);
              setSessionId(null);
              setUserInput('');
              setCurrentView('initial');
              setShowEndChatConfirm(false);
            }}
            variant="contained"
            color="primary"
          >
            End Chat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
