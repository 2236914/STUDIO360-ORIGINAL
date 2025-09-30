'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock announcement banner data (in real app, this would come from API/database)
const MOCK_ANNOUNCEMENT = {
  enabled: true,
  text: 'Spend ₱1,500 and get FREE tracked nationwide shipping!',
  icon: 'eva:shopping-cart-fill',
  backgroundColor: '#E3F2FD',
  textColor: '#1565C0',
};

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(MOCK_ANNOUNCEMENT);
  const [isVisible, setIsVisible] = useState(true);

  // In a real app, you would fetch this from your API
  useEffect(() => {
    // Simulate API call to get announcement banner settings
    // This would typically be: fetchAnnouncementBanner(storeId)
    setAnnouncement(MOCK_ANNOUNCEMENT);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't render if disabled or closed
  if (!announcement.enabled || !isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        bgcolor: announcement.backgroundColor,
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
          icon={announcement.icon} 
          sx={{ 
            color: announcement.textColor, 
            fontSize: 18,
            flexShrink: 0
          }} 
        />
        <Typography 
          variant="body2" 
          sx={{ 
            color: announcement.textColor, 
            fontWeight: 600, 
            textAlign: 'center',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {announcement.text}
        </Typography>
      </Stack>
      
      {/* Close button */}
      <IconButton
        onClick={handleClose}
        size="small"
        sx={{
          color: announcement.textColor,
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
