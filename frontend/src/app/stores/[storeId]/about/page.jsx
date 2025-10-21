'use client';

import { m } from 'framer-motion';
import { use, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { storefrontApi } from 'src/utils/api/storefront';

import { varFade } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { StoreHeader } from 'src/components/store-header';
import { StoreFooter } from 'src/components/store-footer';
import { AnnouncementBanner } from 'src/components/announcement-banner';

// ----------------------------------------------------------------------


// Hero Section Component
function AboutHeroSection({ aboutData }) {
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
                  {aboutData?.shopStory?.title || 'Our Story'}
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
                  {aboutData?.shopStory?.description || 'Welcome to our store. We create unique products with passion and care.'}
                </Typography>
              </m.div>

              {/* Contact Information */}
              <m.div {...varFade().inUp}>
                <Stack spacing={3}>
                  {aboutData?.shopStory?.email && (
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify icon="eva:email-outline" width={24} sx={{ color: 'text.secondary' }} />
                      <Typography variant="body1" sx={{ color: 'text.primary' }}>
                        Email {aboutData.shopStory.email}
                      </Typography>
                    </Stack>
                  )}
                  
                  {aboutData?.shopStory?.shop_hours && (
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify icon="eva:clock-outline" width={24} sx={{ color: 'text.secondary' }} />
                      <Typography variant="body1" sx={{ color: 'text.primary' }}>
                        {aboutData.shopStory.shop_hours}
                      </Typography>
                    </Stack>
                  )}
                  
                  {aboutData?.shopStory?.location && (
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify icon="eva:pin-outline" width={24} sx={{ color: 'text.secondary' }} />
                      <Typography variant="body1" sx={{ color: 'text.primary' }}>
                        {aboutData.shopStory.location}
                      </Typography>
                    </Stack>
                  )}
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
function SocialsSection({ aboutData }) {
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
              {aboutData?.socialMedia?.description || 'Connect with us on social media'}
            </Typography>
          </m.div>

          {/* Social Platform Links */}
          {aboutData?.socialPlatforms && aboutData.socialPlatforms.length > 0 && (
            <m.div {...varFade().inUp}>
              <Stack direction="row" spacing={4} alignItems="center" justifyContent="center" flexWrap="wrap">
                {aboutData.socialPlatforms.map((platform) => (
                  <Box
                    key={platform.id}
                    component="a"
                    href={platform.platform_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      px: 3,
                      py: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {platform.platform_name}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </m.div>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

export default function AboutPage({ params }) {
  const theme = useTheme();
  // Handle both Promise and resolved params
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { storeId } = resolvedParams;
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch about page data
  useEffect(() => {
    async function fetchAboutData() {
      try {
        setLoading(true);
        const response = await storefrontApi.getAboutPage(storeId);
        if (response.success) {
          setAboutData(response.data);
        }
      } catch (err) {
        console.error('Error fetching about data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (storeId) {
      fetchAboutData();
    }
  }, [storeId]);

  // Set page title
  useEffect(() => {
    document.title = `About | ${storeId} | STUDIO360`;
  }, [storeId]);

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
        <AnnouncementBanner />
        <StoreHeader storeId={storeId} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h4" color="error">
            Error loading about page
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {error}
          </Typography>
        </Container>
        <StoreFooter storeId={storeId} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Header */}
      <StoreHeader storeId={storeId} />
      
      {/* Hero Section */}
      <AboutHeroSection aboutData={aboutData} />
      
      {/* Socials & Community */}
      <SocialsSection aboutData={aboutData} />
      
      {/* Footer */}
      <StoreFooter storeId={storeId} />
    </Box>
  );
}
