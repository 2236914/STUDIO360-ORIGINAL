'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { storefrontApi } from 'src/utils/api/storefront';

// ----------------------------------------------------------------------

export function AnnouncementBanner({ storeId }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [announcement, setAnnouncement] = useState(null);

  // Fetch announcement data from API
  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        if (!storeId) {
          // Try to extract storeId from URL
          const pathname = window.location.pathname;
          const match = pathname.match(/\/([^\/]+)/);
          const extractedStoreId = match ? match[1] : 'kitschstudio';
          
          const response = await storefrontApi.getHomepage(extractedStoreId);
          if (response.success && response.data.announcement) {
            setAnnouncement(response.data.announcement);
          }
        } else {
          const response = await storefrontApi.getHomepage(storeId);
          if (response.success && response.data.announcement) {
            setAnnouncement(response.data.announcement);
          }
        }
      } catch (err) {
        console.log('Using default announcement data');
      }
    }

    fetchAnnouncement();
  }, [storeId]);

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't render if not mounted (prevents hydration mismatch)
  if (!isMounted) {
    return null;
  }

  // Don't render if disabled or closed or no announcement data
  if (!announcement || !announcement.enabled || !isVisible) {
    return null;
  }

  // Map icon names to actual iconify icons
  const getIcon = (iconName) => {
    const iconMap = {
      tag: 'eva:pricetags-fill',
      gift: 'eva:gift-fill',
      star: 'eva:star-fill',
      lightning: 'eva:flash-fill',
      heart: 'eva:heart-fill',
      bell: 'eva:bell-fill',
      shield: 'eva:shield-fill',
      truck: 'eva:car-fill',
      percent: 'eva:percent-fill',
      calendar: 'eva:calendar-fill',
      user: 'eva:person-fill',
    };
    return iconMap[iconName] || 'eva:megaphone-fill';
  }

  return (
    <Box
      sx={{
        bgcolor: announcement.background_color || '#E3F2FD',
        py: 1.5,
        px: { xs: 2, md: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="center" 
        spacing={1}
        sx={{ flex: 1 }}
      >
        <Iconify 
          icon={getIcon(announcement.icon)} 
          sx={{ 
            color: announcement.text_color || '#1565C0', 
            fontSize: 18,
            flexShrink: 0
          }} 
        />
        <Typography 
          variant="body2" 
          sx={{ 
            color: announcement.text_color || '#1565C0', 
            fontWeight: 600, 
            textAlign: 'center',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {announcement.text || 'Welcome!'}
        </Typography>
      </Stack>
      
      {/* Close button */}
      <IconButton
        onClick={handleClose}
        size="small"
        sx={{
          color: announcement.text_color || '#1565C0',
          opacity: 0.7,
          '&:hover': {
            opacity: 1,
            bgcolor: 'rgba(0, 0, 0, 0.04)',
          },
          position: 'absolute',
          right: 8,
        }}
      >
        <Iconify icon="eva:close-fill" sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
}
