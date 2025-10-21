'use client';

import { useState, useEffect, useCallback } from 'react';

import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { mailApi } from 'src/services/mailService';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';

import { Layout } from '../layout';
import { MailNav } from '../mail-nav';
import { MailList } from '../mail-list';
import { MailHeader } from '../mail-header';
import { MailCompose } from '../mail-compose';
import { MailDetails } from '../mail-details';

// ----------------------------------------------------------------------

const LABEL_INDEX = 'inbox';

// Support ticket labels for our system - reset to zero counts
const SUPPORT_LABELS = [
  { id: 'inbox', name: 'Inbox', color: '#1877F2', unreadCount: 0 },
  { id: 'sent', name: 'Sent', color: '#00A76F', unreadCount: 0 },
  { id: 'pending', name: 'Pending', color: '#FF8C00', unreadCount: 0 },
  { id: 'resolved', name: 'Resolved', color: '#00A76F', unreadCount: 0 },
  { id: 'spam', name: 'Spam', color: '#FF3030', unreadCount: 0 },
  { id: 'important', name: 'Important', color: '#FFC107', unreadCount: 0 },
];

// Empty support tickets data - will be populated from database
const SUPPORT_TICKETS = {
  inbox: [],
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
  const [allMails, setAllMails] = useState([]); // Store all mails from DB
  const [labels, setLabels] = useState(SUPPORT_LABELS);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const mdUp = useResponsive('up', 'md');
  const openNav = useBoolean();
  const openMail = useBoolean();
  const openCompose = useBoolean();

  // Load mail from database
  useEffect(() => {
    loadMail();
    loadLabelsWithCounts();
  }, []);

  const loadMail = async () => {
    try {
      setLoading(true);
      const mailData = await mailApi.getMail();
      
      // Store all mails
      setAllMails(mailData);
      
      // Group mails by labels
      const grouped = SUPPORT_LABELS.reduce((acc, label) => {
        acc[label.id] = [];
        return acc;
      }, {});

      mailData.forEach(mail => {
        if (mail.labels && Array.isArray(mail.labels)) {
          mail.labels.forEach(labelId => {
            if (grouped[labelId]) {
              grouped[labelId].push({
                id: mail.id,
                from: mail.from_name,
                email: mail.from_email,
                subject: mail.subject,
                message: mail.message,
                timestamp: new Date(mail.received_at || mail.created_at),
                isRead: mail.is_read,
                isStarred: mail.is_starred,
                labels: mail.labels,
                status: mail.status,
                priority: mail.priority,
                source: mail.source,
                attachments: mail.attachments || [],
              });
            }
          });
        }
      });

      setMails(grouped);
      setInitialLoad(false);
    } catch (error) {
      console.error('Error loading mail:', error);
      toast.error('Failed to load mail');
      setInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  const loadLabelsWithCounts = async () => {
    try {
      const counts = await mailApi.getLabelCounts();
      
      // Update label unread counts
      const updatedLabels = SUPPORT_LABELS.map(label => ({
        ...label,
        unreadCount: counts[label.id]?.unread || 0,
      }));
      
      setLabels(updatedLabels);
    } catch (error) {
      console.error('Error loading label counts:', error);
    }
  };

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
    async (mailId) => {
      if (!mdUp) {
        openMail.onFalse();
      }
      setSelectedMailId(mailId);
      
      // Mark as read when opened
      try {
        await mailApi.markAsRead(mailId, true);
        
        // Update local state
        setMails(prev => ({
          ...prev,
          [selectedLabelId]: prev[selectedLabelId].map(mail => 
            mail.id === mailId ? { ...mail, isRead: true } : mail
          )
        }));
        
        // Reload label counts
        loadLabelsWithCounts();
      } catch (error) {
        console.error('Error marking mail as read:', error);
      }
    },
    [openMail, selectedLabelId, mdUp]
  );

  const handleToggleStar = async (mailId) => {
    try {
      await mailApi.toggleStar(mailId);
      
      // Update local state
      setMails(prev => ({
        ...prev,
        [selectedLabelId]: prev[selectedLabelId].map(mail =>
          mail.id === mailId ? { ...mail, isStarred: !mail.isStarred } : mail
        )
      }));
      
      toast.success('Mail updated');
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('Failed to update mail');
    }
  };

  const handleDeleteMail = async (mailId) => {
    try {
      await mailApi.deleteMail(mailId);
      
      // Remove from local state
      setMails(prev => ({
        ...prev,
        [selectedLabelId]: prev[selectedLabelId].filter(mail => mail.id !== mailId)
      }));
      
      // Clear selection if deleted mail was selected
      if (selectedMailId === mailId) {
        setSelectedMailId('');
      }
      
      toast.success('Mail deleted successfully');
      loadLabelsWithCounts();
    } catch (error) {
      console.error('Error deleting mail:', error);
      toast.error('Failed to delete mail');
    }
  };

  const handleSendMail = async (mailData) => {
    try {
      await mailApi.createMail(mailData);
      toast.success('Mail sent successfully!');
      openCompose.onFalse();
      
      // Reload mails
      loadMail();
      loadLabelsWithCounts();
    } catch (error) {
      console.error('Error sending mail:', error);
      toast.error('Failed to send mail');
    }
  };

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
                labels={labels}
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

      {openCompose.value && (
        <MailCompose 
          onCloseCompose={openCompose.onFalse} 
          onSendMail={handleSendMail}
        />
      )}
    </>
  );
}
