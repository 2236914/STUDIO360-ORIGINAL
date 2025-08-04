import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { useAuthContext } from 'src/auth/hooks';
import { SplashScreen } from './loading-screen/splash-screen';

// ----------------------------------------------------------------------

export function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    // Show loading screen first
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setOpen(true);
    }, 2000); // Show loading for 2 seconds

    return () => clearTimeout(loadingTimer);
  }, []);

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
      }}
    >
      <Card
        sx={{
          p: 4,
          mx: 2,
          maxWidth: 600,
          width: '100%',
          borderRadius: 3,
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows.z24,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          {/* Character Illustration - Center Upper */}
          <Box
            sx={{
              width: 200,
              height: 200,
              mx: 'auto',
              mb: 3,
              display: { xs: 'none', md: 'block' },
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

          {/* Text Content */}
          <Typography variant="h4" sx={{ color: 'text.primary', mb: 2, fontWeight: 'bold' }}>
            Hello, {user?.displayName || 'User'}
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary', 
              mb: 3,
              lineHeight: 1.6,
            }}
          >
            Welcome to Studio 360! You're now logged in as a {user?.role === 'admin_it' ? 'Platform Administrator' : 'Seller'}. 
            {user?.role === 'admin_it' 
              ? ' You have access to platform management tools and system administration features.'
              : ' You can manage your shop, products, and business operations.'
            }
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleClose}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Go Now
          </Button>
        </Box>
      </Card>
    </Box>
  );
} 