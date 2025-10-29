'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';
import announcementsApi from 'src/services/announcements';

// ----------------------------------------------------------------------

const TYPE_ICONS = {
  info: 'eva:info-fill',
  warning: 'eva:alert-triangle-fill',
  maintenance: 'eva:settings-fill',
  security: 'eva:shield-fill',
};

const TYPE_SEVERITY = {
  info: 'info',
  warning: 'warning',
  maintenance: 'warning',
  security: 'error',
};

export function SystemAnnouncementBanner({ storeId }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  // Get user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem('user-role');
    setUserRole(role);
  }, []);

  // Fetch announcement data from API
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const data = await announcementsApi.listSystemAnnouncements();
        setAnnouncements(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching system announcements:', err);
      }
    }

    // Only fetch if user is a seller
    if (userRole === 'seller') {
      fetchAnnouncements();
      
      // Refresh announcements every 30 seconds
      const interval = setInterval(fetchAnnouncements, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);


  // Don't render if not mounted (prevents hydration mismatch)
  if (!isMounted) {
    return null;
  }

  // Only show announcements to sellers, not to admins, users, or admin_it
  if (userRole !== 'seller') {
    return null;
  }

  // Filter out dismissed announcements
  const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
  const visibleAnnouncements = announcements.filter(
    (ann) => ann.is_active && !dismissed.includes(ann.id)
  );

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  // Get the first visible announcement to show in the modal
  const currentAnnouncement = visibleAnnouncements[0];
  
  // Check if this announcement was already dismissed today
  const dismissedKey = `announcement_${currentAnnouncement.id}_dismissed`;
  const wasDismissed = localStorage.getItem(dismissedKey);

  if (wasDismissed) {
    return null;
  }

  const handleDismiss = () => {
    if (doNotShowAgain) {
      // Permanently dismiss this announcement by adding to dismissed list
      const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
      if (!dismissed.includes(currentAnnouncement.id)) {
        dismissed.push(currentAnnouncement.id);
        localStorage.setItem('dismissed_announcements', JSON.stringify(dismissed));
      }
    } else {
      // Mark as dismissed for today only
      localStorage.setItem(dismissedKey, new Date().toDateString());
    }
    setIsVisible(false);
  };

  return (
    <Dialog 
      open={isVisible} 
      onClose={handleDismiss}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Iconify 
            icon={TYPE_ICONS[currentAnnouncement.type] || 'eva:megaphone-fill'} 
            width={24} 
            height={24}
          />
          <Typography variant="h6">
            {currentAnnouncement.title}
          </Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Alert 
          severity={TYPE_SEVERITY[currentAnnouncement.type] || 'info'}
          sx={{ mb: 2 }}
        >
          <Typography variant="body1">
            {currentAnnouncement.message}
          </Typography>
          {visibleAnnouncements.length > 1 && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
              There are {visibleAnnouncements.length - 1} more announcement(s) available.
            </Typography>
          )}
        </Alert>
        
        <FormControlLabel
          control={
            <Checkbox 
              checked={doNotShowAgain}
              onChange={(e) => setDoNotShowAgain(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2">
              Do not show this announcement again
            </Typography>
          }
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleDismiss} variant="contained" fullWidth>
          {doNotShowAgain ? 'Dismiss Permanently' : 'Got it'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

