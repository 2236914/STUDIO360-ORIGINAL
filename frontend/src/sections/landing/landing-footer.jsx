'use client';

import NProgress from 'nprogress';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const FOOTER_LINKS = [
  { label: 'Home', href: '#hero-section' },
  { label: 'About', href: '#about-section' },
  { label: 'Stores', href: '#stores-section' },
  { label: 'Features', href: '#features-section' },
  { label: 'Contact', href: '#contact-section' },
];

// ----------------------------------------------------------------------

export function LandingFooter() {
  const theme = useTheme();
  const router = useRouter();

  const handleNavClick = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(href);
    }
  };

  const handleLoginClick = () => {
    NProgress.start();
    router.push(paths.auth.jwt.signIn);
  };

  return (
    <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'common.white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        {/* Main Footer Content */}
        <Box sx={{ py: 8 }}>
          <Stack spacing={6}>
            {/* Top Section */}
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={4}
              alignItems={{ xs: 'center', md: 'flex-start' }}
              textAlign={{ xs: 'center', md: 'left' }}
            >
              {/* Brand */}
              <Stack spacing={2} sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
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
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    STUDIO360
                  </Typography>
                </Stack>
                
                <Typography
                  variant="body2"
                  sx={{
                    color: 'grey.400',
                    maxWidth: 300,
                    lineHeight: 1.6,
                  }}
                >
                  AI-powered business management for creative entrepreneurs. 
                  Simplify your shop, track sales, and stay compliant.
                </Typography>
              </Stack>

              {/* Navigation Links */}
              <Stack direction="row" spacing={4} flexWrap="wrap" justifyContent={{ xs: 'center', md: 'flex-end' }}>
                {FOOTER_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    component="button"
                    variant="body2"
                    onClick={() => handleNavClick(link.href)}
                    sx={{
                      color: 'grey.300',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'primary.main',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleLoginClick}
                  startIcon={<Iconify icon="solar:login-3-bold" />}
                  sx={{
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    color: 'primary.main',
                    fontWeight: 600,
                    px: 2,
                    py: 0.75,
                    borderRadius: 1.5,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  Login
                </Button>
              </Stack>
            </Stack>

            {/* CTA Section */}
            <Box
              sx={{
                p: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                textAlign: 'center',
              }}
            >
              <Stack spacing={3} alignItems="center">
                <Stack spacing={1.5} alignItems="center">
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    Ready to transform your business?
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'grey.300',
                      maxWidth: 500,
                    }}
                  >
                    Join thousands of entrepreneurs who've already discovered the power of STUDIO360
                  </Typography>
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems="center"
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Iconify icon="solar:rocket-bold" />}
                    sx={{
                      bgcolor: 'primary.main',
                      px: 4,
                      py: 1.5,
                      borderRadius: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: theme.shadows[8],
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        boxShadow: theme.shadows[12],
                      },
                    }}
                  >
                    Start Free Trial
                  </Button>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:star-bold" color="warning.main" width={16} />
                    <Typography variant="caption" color="grey.400">
                      4.9/5 from 500+ reviews
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.grey[500], 0.2) }} />

        {/* Bottom Section */}
        <Box sx={{ py: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            textAlign={{ xs: 'center', sm: 'left' }}
          >
            {/* Copyright */}
            <Typography
              variant="body2"
              sx={{
                color: 'grey.500',
                fontSize: '0.875rem',
              }}
            >
              © 2024 STUDIO360. All rights reserved.
            </Typography>

            {/* Legal Links */}
            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              divider={<Box sx={{ width: 1, height: 12, bgcolor: 'grey.700' }} />}
            >
              <Link
                component="button"
                variant="caption"
                sx={{
                  color: 'grey.500',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: 'grey.300',
                  },
                }}
              >
                Terms of Service
              </Link>
              
              <Link
                component="button"
                variant="caption"
                sx={{
                  color: 'grey.500',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: 'grey.300',
                  },
                }}
              >
                Privacy Policy
              </Link>
              
              <Link
                component="button"
                variant="caption"
                sx={{
                  color: 'grey.500',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: 'grey.300',
                  },
                }}
              >
                Cookie Policy
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
