'use client';

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
  FormControlLabel
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock FAQ data - in real app this would come from API
const MOCK_FAQ = [
  {
    id: 1,
    question: "What are your shipping options?",
    answer: "We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free shipping on orders over ₱500."
  },
  {
    id: 2,
    question: "How do I track my order?",
    answer: "You can track your order using your order number and email address. Click 'Track my order' below for instant tracking."
  },
  {
    id: 3,
    question: "What is your return policy?",
    answer: "We offer 30-day returns for unused items in original packaging. Contact us for return authorization."
  },
  {
    id: 4,
    question: "Do you offer bulk discounts?",
    answer: "Yes! We offer special pricing for bulk orders. Contact us directly for custom quotes on orders over 50 items."
  },
  {
    id: 5,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, GCash, and bank transfers."
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

// Order tracking component
function OrderTracking({ onBack, onSubmit }) {
  const [orderData, setOrderData] = useState({
    orderNumber: '',
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderData.orderNumber && orderData.email) {
      // Mock order tracking - in real app this would call API
      const mockOrderStatus = {
        orderNumber: orderData.orderNumber,
        status: 'Shipped',
        trackingNumber: 'TRK123456789',
        estimatedDelivery: '2024-01-15',
        items: ['Love Yourself First Flower Bouquet Vinyl Sticker']
      };
      onSubmit(mockOrderStatus);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
        Track Your Order
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.5 }}>
        Enter your order number and email address to get real-time tracking information.
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            placeholder="Order Number"
            value={orderData.orderNumber}
            onChange={(e) => setOrderData({ ...orderData, orderNumber: e.target.value })}
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
            value={orderData.email}
            onChange={(e) => setOrderData({ ...orderData, email: e.target.value })}
            required
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: 2
              }
            }}
          />

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onBack}
              sx={{ flex: 1, borderRadius: 2 }}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ 
                flex: 1, 
                borderRadius: 2,
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Track Order
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}

// Main chat widget component
export function ChatWidget({ storeName = "Kitsch Studio" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('initial'); // initial, prechat, chat, tracking
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isOnline, setIsOnline] = useState(true); // Mock online status
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock FAQ search
  const searchFAQ = (query) => {
    const lowerQuery = query.toLowerCase();
    return MOCK_FAQ.find(faq => 
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery)
    );
  };

  const handleInitialChat = () => {
    setCurrentView('prechat');
  };

  const handleTrackOrder = () => {
    setCurrentView('tracking');
  };

  const handlePreChatSubmit = (formData) => {
    setUserInfo(formData);
    setCurrentView('chat');
    
    // Add welcome message
    const welcomeMessage = {
      id: Date.now(),
      message: `Hi ${formData.firstName}! Do you have a question about the shop?`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '/placeholder.svg'
    };
    setMessages([welcomeMessage]);
  };

  const handleOrderTrackingSubmit = (orderStatus) => {
    setCurrentView('chat');
    
    const trackingMessage = {
      id: Date.now(),
      message: `Order #${orderStatus.orderNumber} Status: ${orderStatus.status}\n\nTracking Number: ${orderStatus.trackingNumber}\nEstimated Delivery: ${orderStatus.estimatedDelivery}\n\nItems: ${orderStatus.items.join(', ')}`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '/placeholder.svg'
    };
    setMessages([trackingMessage]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      message: userInput,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Check FAQ for response
    const faqMatch = searchFAQ(userInput);
    
    setTimeout(() => {
      let responseMessage;
      
      if (faqMatch) {
        responseMessage = {
          id: Date.now() + 1,
          message: faqMatch.answer,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '/placeholder.svg'
        };
      } else {
        // No FAQ match - offer email support
        responseMessage = {
          id: Date.now() + 1,
          message: "I couldn't find a specific answer to your question. Would you like me to connect you with our support team via email? They'll get back to you within 24 hours.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: '/placeholder.svg'
        };
      }
      
      setMessages(prev => [...prev, responseMessage]);
    }, 1000);

    setUserInput('');
  };

  const handleBack = () => {
    if (currentView === 'prechat' || currentView === 'tracking') {
      setCurrentView('initial');
    } else if (currentView === 'chat') {
      setCurrentView('initial');
      setMessages([]);
      setUserInfo(null);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'prechat':
        return <PreChatForm onSubmit={handlePreChatSubmit} onCancel={handleBack} />;
      case 'tracking':
        return <OrderTracking onBack={handleBack} onSubmit={handleOrderTrackingSubmit} />;
      case 'chat':
        return (
          <Box sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton onClick={handleBack} size="small">
                  <Iconify icon="eva:arrow-back-fill" />
                </IconButton>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                  {storeName}
                </Typography>
                <Chip 
                  label={isOnline ? "Online" : "Offline"} 
                  size="small" 
                  color={isOnline ? "success" : "default"}
                  variant="outlined"
                />
              </Stack>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
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
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <form onSubmit={handleSendMessage}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton size="small">
                    <Iconify icon="eva:plus-fill" />
                  </IconButton>
                  <TextField
                    fullWidth
                    placeholder="Write message"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                        borderRadius: 2
                      }
                    }}
                  />
                  <IconButton type="submit" size="small">
                    <Iconify icon="eva:paper-plane-fill" />
                  </IconButton>
                </Stack>
              </form>
            </Box>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            {/* Chat with us section */}
            <Box sx={{ bgcolor: 'grey.800', p: 3, borderRadius: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                Chat with us
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
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

            {/* Instant answers section */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Instant answers
              </Typography>
              <Button
                variant="outlined"
                onClick={handleTrackOrder}
                sx={{
                  borderColor: 'divider',
                  color: 'text.primary',
                  borderRadius: 2,
                  px: 3,
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.lighter'
                  }
                }}
              >
                Track my order
              </Button>
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
            height: { xs: 'calc(100vh - 48px)', sm: 600 },
            maxHeight: 600,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 8,
            zIndex: 1001,
            display: isOpen ? 'block' : 'none',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.800' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={handleBack} size="small" sx={{ color: 'white' }}>
                <Iconify icon="eva:arrow-back-fill" />
              </IconButton>
              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, flex: 1 }}>
                {storeName}
              </Typography>
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
          <Box sx={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>
            {renderContent()}
          </Box>
        </Box>
      </Fade>
    </>
  );
}
