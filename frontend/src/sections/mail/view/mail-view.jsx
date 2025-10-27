'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { mailApi } from 'src/services/mailService';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';

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
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'archive', 'delete'
  const [deleteConfirmMail, setDeleteConfirmMail] = useState(null);

  const mdUp = useResponsive('up', 'md');
  const openNav = useBoolean();
  const openMail = useBoolean();
  const openCompose = useBoolean();
  const [replyMail, setReplyMail] = useState(null);

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
          const mailObj = {
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
            is_archived: mail.is_archived || false,
            deleted_at: mail.deleted_at,
          };
          
          mail.labels.forEach(labelId => {
            if (grouped[labelId]) {
              grouped[labelId].push(mailObj);
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

  // Filter mails based on active tab
  const filterMailsByTab = (mailsToFilter) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    switch (activeTab) {
      case 'new':
        // Show mail from last 7 days
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        return mailsToFilter.filter(mail => {
          const mailDate = mail.timestamp ? new Date(mail.timestamp) : new Date();
          return mailDate >= sevenDaysAgo;
        });
      case 'archive':
        // Show archived mail
        return mailsToFilter.filter(mail => {
          // Check if mail has archived status, is_archived flag, or in archived label
          return mail.is_archived === true || 
                 mail.labels?.includes('archived') || 
                 mail.status === 'archived';
        });
      case 'delete':
        // Show mail older than 30 days that hasn't been deleted yet
        return mailsToFilter.filter(mail => {
          // Don't show already deleted mails
          if (mail.deleted_at) return false;
          
          const mailDate = mail.timestamp ? new Date(mail.timestamp) : new Date();
          return mailDate < thirtyDaysAgo;
        });
      default:
        return mailsToFilter;
    }
  };

  // Get current mails based on selected label
  let rawMails = mails[selectedLabelId] || [];
  
  // For archive and delete tabs, we need to look across all labels, not just selected one
  if (activeTab === 'archive' || activeTab === 'delete') {
    // Combine all mails from all labels
    rawMails = Object.values(mails).flat();
    // Remove duplicates by id
    const seen = new Set();
    rawMails = rawMails.filter(mail => {
      if (seen.has(mail.id)) return false;
      seen.add(mail.id);
      return true;
    });
  }
  
  // Filter by tab
  const filteredMails = filterMailsByTab(rawMails);
  const currentMails = filteredMails;
  const firstMailId = currentMails[0]?.id || '';

  const handleToggleCompose = useCallback(() => {
    if (openNav.value) {
      openNav.onFalse();
    }
    // Clear reply mail when opening compose for new message
    if (!openCompose.value) {
      setReplyMail(null);
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

  const handleDeleteMail = (mailId) => {
    // Show confirmation instead of deleting immediately
    setDeleteConfirmMail(mailId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmMail) return;
    
    try {
      await mailApi.deleteMail(deleteConfirmMail);
      
      // Remove from local state
      setMails(prev => ({
        ...prev,
        [selectedLabelId]: prev[selectedLabelId].filter(mail => mail.id !== deleteConfirmMail)
      }));
      
      // Clear selection if deleted mail was selected
      if (selectedMailId === deleteConfirmMail) {
        setSelectedMailId('');
      }
      
      setDeleteConfirmMail(null);
      toast.success('Mail deleted successfully');
      loadLabelsWithCounts();
    } catch (error) {
      console.error('Error deleting mail:', error);
      toast.error('Failed to delete mail');
    }
  };

  const handleArchiveMail = async (mailId) => {
    try {
      // Add archived label
      const mail = mails[selectedLabelId].find(m => m.id === mailId);
      if (mail) {
        const updatedLabels = [...(mail.labels || []), 'archived'];
        await mailApi.updateLabels(mailId, updatedLabels);
      }
      
      // Move to archive in local state
      setMails(prev => {
        const archivedMail = prev[selectedLabelId].find(m => m.id === mailId);
        if (!archivedMail) return prev;
        
        return {
          ...prev,
          [selectedLabelId]: prev[selectedLabelId].filter(m => m.id !== mailId),
          archive: [...(prev.archive || []), { ...archivedMail, labels: [...(archivedMail.labels || []), 'archived'] }]
        };
      });
      
      if (selectedMailId === mailId) {
        setSelectedMailId('');
      }
      
      toast.success('Mail archived successfully');
      loadLabelsWithCounts();
    } catch (error) {
      console.error('Error archiving mail:', error);
      toast.error('Failed to archive mail');
    }
  };

  const handleResolveMail = async (mailId) => {
    try {
      await mailApi.updateStatus(mailId, 'resolved');
      
      // Remove from current label and move to resolved
      setMails(prev => {
        const mail = prev[selectedLabelId].find(m => m.id === mailId);
        if (!mail) return prev;
        
        return {
          ...prev,
          [selectedLabelId]: prev[selectedLabelId].filter(m => m.id !== mailId),
          resolved: [...(prev.resolved || []), { ...mail, status: 'resolved' }]
        };
      });
      
      if (selectedMailId === mailId) {
        setSelectedMailId('');
      }
      
      toast.success('Mail resolved successfully');
      loadLabelsWithCounts();
    } catch (error) {
      console.error('Error resolving mail:', error);
      toast.error('Failed to resolve mail');
    }
  };

  const handleReplyMail = (mail) => {
    // Set reply mail data and open compose
    setReplyMail(mail);
    openCompose.onTrue();
  };

  const handleCloseCompose = () => {
    openCompose.onFalse();
    setReplyMail(null); // Clear reply data when closing
  };

  const handleSendMail = async (mailData) => {
    try {
      // Send email via SMTP
      await mailApi.sendEmail({
        toEmail: mailData.to_email,
        toName: mailData.to_name,
        subject: mailData.subject,
        message: mailData.message,
        fromName: mailData.from_name
      });
      
      toast.success('Email sent successfully!');
      openCompose.onFalse();
      
      // Reload mails
      loadMail();
      loadLabelsWithCounts();
    } catch (error) {
      console.error('Error sending mail:', error);
      toast.error('Failed to send email: ' + (error.message || 'Unknown error'));
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
        <CustomBreadcrumbs
          heading="Mail & Support"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Mail & Support' },
          ]}
          sx={{
            mb: { xs: 2, md: 3 },
          }}
        />

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab 
              icon={<Iconify icon="solar:letter-bold" />}
              label="New (7 days)"
              value="new"
            />
            <Tab 
              icon={<Iconify icon="solar:archive-bold" />}
              label="Archive"
              value="archive"
            />
            <Tab 
              icon={<Iconify icon="solar:trash-bin-trash-bold" />}
              label="Delete (30+ days)"
              value="delete"
            />
          </Tabs>
        </Box>

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
                onDelete={handleDeleteMail}
                onStar={handleToggleStar}
                onArchive={handleArchiveMail}
                onResolve={handleResolveMail}
                onReply={handleReplyMail}
              />
            ),
          }}
        />
      </DashboardContent>

      {openCompose.value && (
        <MailCompose 
          onCloseCompose={handleCloseCompose} 
          onSendMail={handleSendMail}
          replyMail={replyMail}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmMail}
        onClose={() => setDeleteConfirmMail(null)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Mail?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this mail? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmMail(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
