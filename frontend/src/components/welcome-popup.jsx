import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { useAuthContext } from 'src/auth/hooks';
import { SplashScreen } from './loading-screen/splash-screen';

// ----------------------------------------------------------------------

export function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthContext();
  const theme = useTheme();

  useEffect(() => {
    // Show loading screen first
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setOpen(true);
    }, 2000); // Show loading for 2 seconds

    return () => clearTimeout(loadingTimer);
  }, []);

  // Handle escape key and click outside
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && open) {
        handleClose();
      }
    };

    const handleClickOutside = (event) => {
      if (open && event.target === event.currentTarget) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  // Show loading screen
  if (isLoading) {
    return <SplashScreen />;
  }

  // Show welcome popup
  if (!open) {
    return null;
  }

  // Get user display name or fallback
  const displayName = user?.displayName || 'User';
  const userRole = user?.role || 'user';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
        backdropFilter: 'blur(8px)',
        p: { xs: 2, sm: 3, md: 4 },
        // Ensure proper mobile handling
        minHeight: '100vh',
        minWidth: '100vw',
      }}
    >
      <Card
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          mx: 'auto',
          maxWidth: { xs: '100%', sm: 500, md: 600 },
          width: '100%',
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows?.z24 || theme.shadows[24],
          position: 'relative',
          overflow: 'visible',
          // Better mobile handling
          maxHeight: { xs: '90vh', sm: '80vh' },
          overflowY: 'auto',
          // Smooth animations
          animation: 'slideIn 0.3s ease-out',
          '@keyframes slideIn': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.9) translateY(20px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
          },
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          {/* Character Illustration - Responsive sizing */}
          <Box
            sx={{
              width: { xs: 100, sm: 150, md: 200 },
              height: { xs: 100, sm: 150, md: 200 },
              mx: 'auto',
              mb: { xs: 2, sm: 3 },
              display: 'block', // Show on all screen sizes
              flexShrink: 0, // Prevent shrinking
            }}
          >
            <Box
              component="img"
              src="/assets/illustrations/characters/character-11.webp"
              alt="Welcome Character"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>

          {/* Text Content - Responsive typography */}
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'text.primary', 
              mb: { xs: 1.5, sm: 2 }, 
              fontWeight: 'bold',
              fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' },
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            Hello, {displayName}
          </Typography>

          {/* User Email - Small text below name */}
          {user?.email && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.disabled', 
                mb: 2,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontStyle: 'italic',
              }}
            >
              {user.email}
            </Typography>
          )}

          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary', 
              mb: { xs: 2.5, sm: 3 },
              lineHeight: 1.6,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 1, sm: 0 },
              wordBreak: 'break-word',
            }}
          >
            Welcome to Studio 360! You're now logged in as a{' '}
            {userRole === 'admin_it' ? 'Platform Administrator' : 'Seller'}.{' '}
            {userRole === 'admin_it' 
              ? 'You have access to platform management tools and system administration features.'
              : 'You can manage your shop, products, and business operations.'
            }
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleClose}
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: { xs: 1.25, sm: 1.5 },
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minWidth: { xs: 120, sm: 140 },
              // Better mobile button
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: 200, sm: 'none' },
            }}
          >
            Go Now
          </Button>
        </Box>
      </Card>
    </Box>
  );
} 