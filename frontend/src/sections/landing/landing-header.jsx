'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { CustomDrawer } from 'src/components/custom-drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme, useColorScheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import NProgress from 'nprogress';

// ----------------------------------------------------------------------

const NAV_ITEMS = [
  { label: 'Home', href: '#hero-section' },
  { label: 'About', href: '#about-section' },
  { label: 'Stores', href: '#stores-section' },
  { label: 'Features', href: '#features-section' },
  { label: 'Contact', href: '#contact-section' },
];

// ----------------------------------------------------------------------

export function LandingHeader() {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();
  const router = useRouter();
  
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(href);
    }
    setMobileOpen(false);
  };

  const handleGetStarted = () => {
    console.log('Get Started clicked, routing to:', paths.auth.jwt.signIn);
    NProgress.start();
    
    try {
      router.push(paths.auth.jwt.signIn);
    } catch (error) {
      console.error('Router error:', error);
      // Fallback to direct navigation
      window.location.href = paths.auth.jwt.signIn;
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleToggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Stack spacing={2} sx={{ px: 2, pb: 2 }}>
        {/* Mobile Logo */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} color="white">
              S
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
            }}
          >
            STUDIO360
          </Typography>
        </Stack>
      </Stack>

      <List>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => handleNavClick(item.href)}>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: 'text.primary',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Mobile CTA */}
        <ListItem sx={{ pt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleGetStarted}
            sx={{
              bgcolor: 'primary.main',
              py: 1.5,
              borderRadius: 1.5,
              fontWeight: 600,
            }}
          >
            Get Started
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: { xs: 8, md: 12 },
          left: 0,
          right: 0,
          zIndex: 1100,
          px: { xs: 2, md: 3 },
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              position: 'relative',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
              bgcolor: 'transparent',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              borderRadius: 9999, // Pill shape
              border: theme.palette.mode === 'dark' 
                ? '1px solid rgba(255,255,255,0.1)' 
                : '1px solid rgba(255,255,255,0.25)',
              boxShadow: theme.palette.mode === 'dark'
                ? `0 10px 30px ${alpha(theme.palette.common.black, 0.3)}, inset 0 1px 0 rgba(255,255,255,0.1)`
                : `0 10px 30px ${alpha(theme.palette.common.black, 0.08)}, inset 0 1px 0 rgba(255,255,255,0.2)`,
              transition: 'all 0.3s ease',
              // Make header height as compact as possible
              minHeight: { xs: 56, md: 64 },
              mt: 0,
              mb: 0,
              '&:hover': {
                boxShadow: theme.palette.mode === 'dark'
                  ? `0 14px 48px ${alpha(theme.palette.common.black, 0.4)}, inset 0 1px 0 rgba(255,255,255,0.15)`
                  : `0 14px 48px ${alpha(theme.palette.common.black, 0.12)}, inset 0 1px 0 rgba(255,255,255,0.25)`,
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 2, py: 1 }}
            >
            {/* Logo */}
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={1.5}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleNavClick('#hero-section')}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" fontWeight={700} color="white">
                  S
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                STUDIO360
              </Typography>
            </Stack>

            {/* Desktop Navigation */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={4}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.label}
                  variant="text"
                  onClick={() => handleNavClick(item.href)}
                  sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    px: 2,
                    py: 1,
                    borderRadius: 1.5,
                    minWidth: 'auto',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            {/* Desktop Actions: Theme toggle + CTA */}
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <IconButton
                aria-label="Toggle color mode"
                onClick={handleToggleMode}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.06 : 0.25),
                  color: 'text.primary',
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.06)',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.1 : 0.35),
                  },
                }}
              >
                <Iconify icon={mode === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold'} width={18} />
              </IconButton>

              <Button
                variant="contained"
                size="medium"
                onClick={handleGetStarted}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: 1.25,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    boxShadow: 'none',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Get Started
              </Button>
            </Stack>

            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                color: 'text.primary',
              }}
            >
              <Iconify icon="solar:hamburger-menu-bold" width={24} />
            </IconButton>
                      </Stack>
          </Box>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <CustomDrawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        width={250}
        sx={{
          display: { xs: 'block', md: 'none' },
        }}
      >
        {drawer}
      </CustomDrawer>

      {/* No spacer needed for floating header */}
    </>
  );
}
