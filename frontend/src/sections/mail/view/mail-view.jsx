'use client';

import { useState, useEffect, useCallback } from 'react';

import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { DashboardContent } from 'src/layouts/dashboard';

import { Layout } from '../layout';
import { MailNav } from '../mail-nav';
import { MailList } from '../mail-list';
import { MailHeader } from '../mail-header';
import { MailCompose } from '../mail-compose';
import { MailDetails } from '../mail-details';

// ----------------------------------------------------------------------

const LABEL_INDEX = 'inbox';

// Support ticket labels for our system
const SUPPORT_LABELS = [
  { id: 'inbox', name: 'Inbox', color: '#1877F2', unreadCount: 5 },
  { id: 'sent', name: 'Sent', color: '#00A76F', unreadCount: 0 },
  { id: 'pending', name: 'Pending', color: '#FF8C00', unreadCount: 3 },
  { id: 'resolved', name: 'Resolved', color: '#00A76F', unreadCount: 0 },
  { id: 'spam', name: 'Spam', color: '#FF3030', unreadCount: 1 },
  { id: 'important', name: 'Important', color: '#FFC107', unreadCount: 2 },
];

// Mock support tickets data
const SUPPORT_TICKETS = {
  inbox: [
    {
      id: 'ticket_001',
      from: 'John Doe',
      email: 'john.doe@email.com',
      subject: 'Question about shipping times',
      message: 'Hi, I ordered a necklace yesterday and I was wondering about the shipping times to Cebu. Can you please provide more information?',
      timestamp: new Date('2024-01-20 10:30:00'),
      isRead: false,
      isStarred: true,
      labels: ['inbox', 'pending'],
      storeId: 'kitschstudio',
      source: 'chatbot',
      priority: 'normal'
    },
    {
      id: 'ticket_002',
      from: 'Maria Santos',
      email: 'maria.santos@gmail.com',
      subject: 'Custom order inquiry',
      message: 'Hello! I saw your beautiful earrings and I was wondering if you accept custom orders? I have a specific design in mind.',
      timestamp: new Date('2024-01-20 09:15:00'),
      isRead: false,
      isStarred: false,
      labels: ['inbox'],
      storeId: 'kitschstudio',
      source: 'direct',
      priority: 'high'
    },
    {
      id: 'ticket_003',
      from: 'Alex Rivera',
      email: 'alex.rivera@yahoo.com',
      subject: 'Payment issue',
      message: 'I tried to complete my payment using GCash but it keeps showing an error. Can you help me with this?',
      timestamp: new Date('2024-01-19 16:45:00'),
      isRead: true,
      isStarred: false,
      labels: ['inbox', 'important'],
      storeId: 'kitschstudio',
      source: 'chatbot',
      priority: 'urgent'
    },
    {
      id: 'ticket_004',
      from: 'Sarah Kim',
      email: 'sarah.kim@outlook.com',
      subject: 'Return request',
      message: 'Hi, I received my order but the size is not right. I would like to return it and get a different size. What should I do?',
      timestamp: new Date('2024-01-19 14:20:00'),
      isRead: true,
      isStarred: true,
      labels: ['inbox'],
      storeId: 'kitschstudio',
      source: 'email',
      priority: 'normal'
    },
    {
      id: 'ticket_005',
      from: 'David Chen',
      email: 'david.chen@gmail.com',
      subject: 'Product availability',
      message: 'Is the silver bracelet with pearls still available? I cannot find it on your website anymore.',
      timestamp: new Date('2024-01-18 11:30:00'),
      isRead: false,
      isStarred: false,
      labels: ['inbox'],
      storeId: 'kitschstudio',
      source: 'chatbot',
      priority: 'low'
    }
  ],
  sent: [],
  pending: [],
  resolved: [],
  spam: [],
  important: []
};

export function MailView() {
  const [selectedLabelId, setSelectedLabelId] = useState(LABEL_INDEX);
  const [selectedMailId, setSelectedMailId] = useState('');
  const [mails, setMails] = useState(SUPPORT_TICKETS);
  const [loading, setLoading] = useState(false);

  const mdUp = useResponsive('up', 'md');
  const openNav = useBoolean();
  const openMail = useBoolean();
  const openCompose = useBoolean();

  // Get current mails based on selected label
  const currentMails = mails[selectedLabelId] || [];
  const firstMailId = currentMails[0]?.id || '';

  const handleToggleCompose = useCallback(() => {
    if (openNav.value) {
      openNav.onFalse();
    }
    openCompose.onToggle();
  }, [openCompose, openNav]);

  const handleClickLabel = useCallback(
    (labelId) => {
      if (!mdUp) {
        openNav.onFalse();
      }
      setSelectedLabelId(labelId);
      setSelectedMailId(''); // Reset selected mail when changing labels
    },
    [openNav, mdUp]
  );

  const handleClickMail = useCallback(
    (mailId) => {
      if (!mdUp) {
        openMail.onFalse();
      }
      setSelectedMailId(mailId);
      
      // Mark as read when opened
      setMails(prev => ({
        ...prev,
        [selectedLabelId]: prev[selectedLabelId].map(mail => 
          mail.id === mailId ? { ...mail, isRead: true } : mail
        )
      }));
    },
    [openMail, selectedLabelId, mdUp]
  );

  // Auto-select first mail when changing labels
  useEffect(() => {
    if (!selectedMailId && firstMailId) {
      handleClickMail(firstMailId);
    }
  }, [firstMailId, handleClickMail, selectedMailId]);

  // Prevent body scroll when compose is open
  useEffect(() => {
    if (openCompose.value) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [openCompose.value]);

  // Load support tickets from localStorage (from chatbot)
  useEffect(() => {
    const storedTickets = localStorage.getItem('support_tickets');
    if (storedTickets) {
      const tickets = JSON.parse(storedTickets);
      // Convert stored tickets to mail format
      const formattedTickets = tickets.map(ticket => ({
        id: ticket.id,
        from: ticket.user.name,
        email: ticket.user.email,
        subject: `Support Request - ${ticket.id}`,
        message: ticket.message,
        timestamp: new Date(ticket.timestamp),
        isRead: false,
        isStarred: false,
        labels: ['inbox', 'pending'],
        storeId: ticket.storeId,
        source: 'chatbot',
        priority: 'normal'
      }));

      setMails(prev => ({
        ...prev,
        inbox: [...formattedTickets, ...prev.inbox]
      }));
    }
  }, []);

  const selectedMail = currentMails.find(mail => mail.id === selectedMailId);

  return (
    <>
      <DashboardContent
        maxWidth={false}
        sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}
      >
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
          Mail & Support
        </Typography>

        <Layout
          sx={{
            p: 1,
            borderRadius: 2,
            flex: '1 1 auto',
            bgcolor: 'background.neutral',
          }}
          slots={{
            header: (
              <MailHeader
                onOpenNav={openNav.onTrue}
                onOpenMail={currentMails.length ? openMail.onTrue : undefined}
                sx={{ display: { md: 'none' } }}
              />
            ),
            nav: (
              <MailNav
                labels={SUPPORT_LABELS}
                loading={loading}
                openNav={openNav.value}
                onCloseNav={openNav.onFalse}
                selectedLabelId={selectedLabelId}
                handleClickLabel={handleClickLabel}
                onToggleCompose={handleToggleCompose}
              />
            ),
            list: (
              <MailList
                mails={currentMails}
                empty={currentMails.length === 0}
                loading={loading}
                openMail={openMail.value}
                onCloseMail={openMail.onFalse}
                onClickMail={handleClickMail}
                selectedLabelId={selectedLabelId}
                selectedMailId={selectedMailId}
              />
            ),
            details: (
              <MailDetails
                mail={selectedMail}
                empty={currentMails.length === 0}
                loading={loading}
              />
            ),
          }}
        />
      </DashboardContent>

      {openCompose.value && <MailCompose onCloseCompose={openCompose.onFalse} />}
    </>
  );
}
