'use client';

import { useState, useEffect } from 'react';

import { useTheme } from '@mui/material/styles';
import {
  Box,
  Tab,
  Card,
  Grid,
  Chip,
  Tabs,
  List,
  Stack,
  Badge,
  Paper,
  Avatar,
  ListItem,
  Container,
  TextField,
  Typography,
  IconButton,
  CardContent,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock chat data - in real app this would come from API
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    userEmail: 'john.doe@email.com',
    userName: 'John Doe',
    status: 'active',
    lastMessage: 'How do I track my order?',
    lastMessageAt: '2024-01-15T10:30:00Z',
    messageCount: 5,
    unreadCount: 2,
    createdAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    userEmail: 'jane.smith@email.com',
    userName: 'Jane Smith',
    status: 'active',
    lastMessage: 'Thank you for the help!',
    lastMessageAt: '2024-01-15T09:45:00Z',
    messageCount: 8,
    unreadCount: 0,
    createdAt: '2024-01-15T08:30:00Z'
  },
  {
    id: '3',
    userEmail: 'mike.wilson@email.com',
    userName: 'Mike Wilson',
    status: 'closed',
    lastMessage: 'Order tracking information received',
    lastMessageAt: '2024-01-14T16:20:00Z',
    messageCount: 3,
    unreadCount: 0,
    createdAt: '2024-01-14T15:00:00Z'
  },
  {
    id: '4',
    userEmail: 'sarah.jones@email.com',
    userName: 'Sarah Jones',
    status: 'active',
    lastMessage: 'What are your return policies?',
    lastMessageAt: '2024-01-15T11:15:00Z',
    messageCount: 4,
    unreadCount: 1,
    createdAt: '2024-01-15T10:45:00Z'
  }
];

const MOCK_MESSAGES = {
  '1': [
    {
      id: '1',
      message: 'Hi! I need help tracking my order',
      isUser: true,
      timestamp: '2024-01-15T09:00:00Z'
    },
    {
      id: '2',
      message: 'Hello! I\'d be happy to help you track your order. Can you please provide your order number?',
      isUser: false,
      timestamp: '2024-01-15T09:01:00Z'
    },
    {
      id: '3',
      message: 'My order number is #12345',
      isUser: true,
      timestamp: '2024-01-15T09:02:00Z'
    },
    {
      id: '4',
      message: 'Thank you! Your order #12345 is currently being processed and will be shipped within 2-3 business days. You\'ll receive a tracking number via email once it ships.',
      isUser: false,
      timestamp: '2024-01-15T09:03:00Z'
    },
    {
      id: '5',
      message: 'How do I track my order?',
      isUser: true,
      timestamp: '2024-01-15T10:30:00Z'
    }
  ]
};

// Chat Stats Component
function ChatStats() {
  const stats = [
    {
      title: 'Active Conversations',
      value: '12',
      change: '+3',
      changeType: 'positive',
      icon: 'eva:message-circle-fill'
    },
    {
      title: 'Total Messages Today',
      value: '156',
      change: '+24',
      changeType: 'positive',
      icon: 'eva:chatbubble-fill'
    },
    {
      title: 'Avg Response Time',
      value: '2.3 min',
      change: '-0.5',
      changeType: 'positive',
      icon: 'eva:clock-fill'
    },
    {
      title: 'Customer Satisfaction',
      value: '4.8/5',
      change: '+0.2',
      changeType: 'positive',
      icon: 'eva:star-fill'
    }
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'primary.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Iconify icon={stat.icon} sx={{ color: 'primary.main', fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: stat.changeType === 'positive' ? 'success.main' : 'error.main',
                      fontWeight: 500
                    }}
                  >
                    {stat.change} from yesterday
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

// Conversation List Component
function ConversationList({ conversations, selectedConversation, onSelectConversation }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'closed': return 'default';
      case 'archived': return 'warning';
      default: return 'default';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } 
      return date.toLocaleDateString();
    
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Conversations
          </Typography>
        </Box>
        
        <List sx={{ p: 0 }}>
          {conversations.map((conversation) => (
            <ListItem
              key={conversation.id}
              button
              selected={selectedConversation?.id === conversation.id}
              onClick={() => onSelectConversation(conversation)}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: 'primary.lighter',
                  '&:hover': {
                    bgcolor: 'primary.lighter'
                  }
                }
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    conversation.unreadCount > 0 ? (
                      <Chip
                        label={conversation.unreadCount}
                        size="small"
                        sx={{
                          bgcolor: 'error.main',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 18,
                          minWidth: 18
                        }}
                      />
                    ) : null
                  }
                >
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {conversation.userName.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {conversation.userName}
                    </Typography>
                    <Chip
                      label={conversation.status}
                      size="small"
                      color={getStatusColor(conversation.status)}
                      variant="outlined"
                    />
                  </Stack>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 0.5
                      }}
                    >
                      {conversation.lastMessage}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {formatTime(conversation.lastMessageAt)}
                    </Typography>
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {conversation.messageCount} msgs
                </Typography>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

// Chat Conversation Component
function ChatConversation({ conversation, messages, onSendMessage, onCloseConversation }) {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(conversation.id, newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {conversation.userName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {conversation.userName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {conversation.userEmail}
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Chip
              label={conversation.status}
              size="small"
              color={conversation.status === 'active' ? 'success' : 'default'}
              variant="outlined"
            />
            <IconButton onClick={() => onCloseConversation(conversation.id)}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, p: 2, overflowY: 'auto', maxHeight: 400 }}>
        <Stack spacing={2}>
          {messages.map((message) => (
            <Stack
              key={message.id}
              direction="row"
              spacing={1}
              justifyContent={message.isUser ? 'flex-end' : 'flex-start'}
            >
              {!message.isUser && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {conversation.userName.charAt(0).toUpperCase()}
                </Avatar>
              )}
              
              <Box
                sx={{
                  maxWidth: '70%',
                  bgcolor: message.isUser ? 'primary.main' : 'grey.100',
                  color: message.isUser ? 'white' : 'text.primary',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  position: 'relative'
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                  {message.message}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: message.isUser ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontSize: '0.7rem',
                    mt: 0.5,
                    display: 'block'
                  }}
                >
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <form onSubmit={handleSendMessage}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                  borderRadius: 2
                }
              }}
            />
            <IconButton type="submit" disabled={!newMessage.trim()}>
              <Iconify icon="eva:paper-plane-fill" />
            </IconButton>
          </Stack>
        </form>
      </Box>
    </Card>
  );
}

// Main Chat Dashboard Component
export default function ChatDashboard() {
  const theme = useTheme();
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Load messages for selected conversation
    if (selectedConversation) {
      setMessages(MOCK_MESSAGES);
    }
  }, [selectedConversation]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = (conversationId, message) => {
    // In real app, this would send to API
    const newMessage = {
      id: Date.now().toString(),
      message,
      isUser: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));

    // Update conversation last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: message,
              lastMessageAt: new Date().toISOString(),
              messageCount: conv.messageCount + 1
            }
          : conv
      )
    );
  };

  const handleCloseConversation = (conversationId) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, status: 'closed' }
          : conv
      )
    );
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Chat Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Manage customer conversations and provide real-time support
          </Typography>
        </Box>

        {/* Stats */}
        <ChatStats />

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Active Conversations" />
            <Tab label="All Conversations" />
            <Tab label="Closed Conversations" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Main Content */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Conversation List */}
            <Grid item xs={12} md={4}>
              <ConversationList
                conversations={conversations.filter(c => c.status === 'active')}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
              />
            </Grid>

            {/* Chat Conversation */}
            <Grid item xs={12} md={8}>
              {selectedConversation ? (
                <ChatConversation
                  conversation={selectedConversation}
                  messages={messages[selectedConversation.id] || []}
                  onSendMessage={handleSendMessage}
                  onCloseConversation={handleCloseConversation}
                />
              ) : (
                <Card sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Iconify
                      icon="eva:message-circle-outline"
                      sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
                    />
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                      Select a conversation
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      Choose a conversation from the list to start chatting
                    </Typography>
                  </Box>
                </Card>
              )}
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              {selectedConversation ? (
                <ChatConversation
                  conversation={selectedConversation}
                  messages={messages[selectedConversation.id] || []}
                  onSendMessage={handleSendMessage}
                  onCloseConversation={handleCloseConversation}
                />
              ) : (
                <Card sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Iconify
                      icon="eva:message-circle-outline"
                      sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
                    />
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                      Select a conversation
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      Choose a conversation from the list to start chatting
                    </Typography>
                  </Box>
                </Card>
              )}
            </Grid>
          </Grid>
        )}

        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <ConversationList
                conversations={conversations.filter(c => c.status === 'closed')}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              {selectedConversation ? (
                <ChatConversation
                  conversation={selectedConversation}
                  messages={messages[selectedConversation.id] || []}
                  onSendMessage={handleSendMessage}
                  onCloseConversation={handleCloseConversation}
                />
              ) : (
                <Card sx={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Iconify
                      icon="eva:message-circle-outline"
                      sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
                    />
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                      Select a conversation
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                      Choose a conversation from the list to start chatting
                    </Typography>
                  </Box>
                </Card>
              )}
            </Grid>
          </Grid>
        )}

        {tabValue === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Chat Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                      24h
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Average Response Time
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
                      98%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      First Response Rate
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
