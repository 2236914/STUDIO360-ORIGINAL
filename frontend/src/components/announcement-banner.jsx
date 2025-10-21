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
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

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

  // Don't render if disabled or closed
  if (!MOCK_ANNOUNCEMENT.enabled || !isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        bgcolor: MOCK_ANNOUNCEMENT.backgroundColor,
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
          icon={MOCK_ANNOUNCEMENT.icon} 
          sx={{ 
            color: MOCK_ANNOUNCEMENT.textColor, 
            fontSize: 18,
            flexShrink: 0
          }} 
        />
        <Typography 
          variant="body2" 
          sx={{ 
            color: MOCK_ANNOUNCEMENT.textColor, 
            fontWeight: 600, 
            textAlign: 'center',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {MOCK_ANNOUNCEMENT.text}
        </Typography>
      </Stack>
      
      {/* Close button */}
      <IconButton
        onClick={handleClose}
        size="small"
        sx={{
          color: MOCK_ANNOUNCEMENT.textColor,
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
