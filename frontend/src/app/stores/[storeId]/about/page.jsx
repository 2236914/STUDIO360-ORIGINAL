'use client';

import { useState, use, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';

import { varFade } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { AnnouncementBanner } from 'src/components/announcement-banner';
import { StoreHeader } from 'src/components/store-header';

// ----------------------------------------------------------------------


// Hero Section Component
function AboutHeroSection() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          {/* Left Column - Content */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              <m.div {...varFade().inUp}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: { xs: '2rem', md: '3rem' },
                    lineHeight: 1.2
                  }}
                >
                  Our journey in artisan craftsmanship
                </Typography>
              </m.div>

              <m.div {...varFade().inUp}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 400,
                    lineHeight: 1.6
                  }}
                >
                  Founded in 2018, Kitsch.Studio emerged from a passion for creating meaningful jewelry. We are more than a shop - we are storytellers working with metal and stone.
                </Typography>
              </m.div>

              {/* Contact Information */}
              <m.div {...varFade().inUp}>
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Iconify icon="eva:email-outline" width={24} sx={{ color: 'text.secondary' }} />
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      Email hello@kitsch.studio
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Iconify icon="eva:clock-outline" width={24} sx={{ color: 'text.secondary' }} />
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      Open Tuesday to Saturday, 10am - 6pm
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Iconify icon="eva:pin-outline" width={24} sx={{ color: 'text.secondary' }} />
                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                      Located in the creative district of Portland, Oregon
                    </Typography>
                  </Stack>
                </Stack>
              </m.div>

              {/* Action Buttons */}
              <m.div {...varFade().inUp}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'text.primary',
                      color: 'text.primary',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        bgcolor: 'transparent'
                      }
                    }}
                  >
                    Contact
                  </Button>
                  <Link 
                    href="#" 
                    sx={{ 
                      color: 'text.primary', 
                      textDecoration: 'none', 
                      fontWeight: 500,
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    Visit →
                  </Link>
                </Stack>
              </m.div>
            </Stack>
          </Grid>

          {/* Right Column - Image */}
          <Grid item xs={12} md={6}>
            <m.div {...varFade().inUp}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: 300, md: 500 },
                  bgcolor: '#E5E5E5',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Iconify 
                  icon="solar:gallery-minimalistic-bold" 
                  sx={{ 
                    fontSize: 64, 
                    color: '#A0A0A0' 
                  }} 
                />
              </Box>
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// Socials & Community Section
function SocialsSection() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={6} alignItems="center" textAlign="center">
          <m.div {...varFade().inUp}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Socials & Community
            </Typography>
          </m.div>

          <m.div {...varFade().inUp}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 400,
                maxWidth: 600,
                lineHeight: 1.6
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.
            </Typography>
          </m.div>

          {/* Partner Logos */}
          <m.div {...varFade().inUp}>
            <Stack direction="row" spacing={4} alignItems="center" justifyContent="center">
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Webflow
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Relume
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Webflow
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Relume
                </Typography>
              </Box>
            </Stack>
          </m.div>

          {/* Action Buttons */}
          <m.div {...varFade().inUp}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'text.primary',
                  color: 'text.primary',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: 'transparent'
                  }
                }}
              >
                Button
              </Button>
              <Link 
                href="#" 
                sx={{ 
                  color: 'text.primary', 
                  textDecoration: 'none', 
                  fontWeight: 500,
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Button →
              </Link>
            </Stack>
          </m.div>
        </Stack>
      </Container>
    </Box>
  );
}

// Footer Component (reused from homepage)
function StoreFooter() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 6, borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={3}>
            <Stack spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Logo
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Handcrafted jewelry and accessories for the modern individual.
              </Typography>
            </Stack>
          </Grid>

          {/* Kitsch Studio */}
          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Kitsch.Studio
              </Typography>
              <Stack spacing={1}>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Shop
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Collections
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Bestsellers
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  New arrivals
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Company
                </Link>
              </Stack>
            </Stack>
          </Grid>

          {/* About us */}
          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                About us
              </Typography>
              <Stack spacing={1}>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Our process
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Contact
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Social Media
                </Link>
              </Stack>
            </Stack>
          </Grid>

          {/* Support */}
          <Grid item xs={12} md={2}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Support
              </Typography>
              <Stack spacing={1}>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Shipping
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Returns
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  FAQ
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Subscribe
                </Link>
              </Stack>
            </Stack>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={3}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Enter your email
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Subscribe
              </Typography>
              <TextField
                placeholder="By subscribing, you agree to our privacy policy"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem'
                  }
                }}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Thank you for subscribing
              </Typography>
              <Typography variant="caption" sx={{ color: 'error.main' }}>
                Something went wrong with your subscription
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            alignItems="center" 
            justifyContent="space-between"
            spacing={2}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Made with STUDIO360 • Cookies settings • Terms of Service • Cookies Settings
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

export default function AboutPage({ params }) {
  const theme = useTheme();
  const { storeId } = use(params);

  // Set page title
  useEffect(() => {
    document.title = `About | Kitsch Studio | STUDIO360`;
  }, [storeId]);

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Header */}
      <StoreHeader />
      
      {/* Hero Section */}
      <AboutHeroSection />
      
      {/* Socials & Community */}
      <SocialsSection />
      
      {/* Footer */}
      <StoreFooter />
    </Box>
  );
}
