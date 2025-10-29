'use client';

import { useState, useEffect, use } from 'react';

import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Avatar,
  Typography,
  Container,
  IconButton,
} from '@mui/material';

import { useRouter } from 'next/navigation';

import { isStoreSubdomain } from 'src/utils/subdomain';
import { storefrontApi } from 'src/utils/api/storefront';

import { StoreHeader } from 'src/components/store-header';
import { StoreFooter } from 'src/components/store-footer';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function SubdomainAboutPage({ params }) {
  const { subdomain } = use(params);
  const router = useRouter();
  
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isValidStore, setIsValidStore] = useState(false);

  // All hooks must be called in the same order every time
  useEffect(() => {
    setIsClient(true);
    setIsValidStore(isStoreSubdomain());
  }, []);

  useEffect(() => {
    if (isClient && isValidStore) {
      loadAboutData();
    }
  }, [subdomain, isClient, isValidStore]);

  const loadAboutData = async () => {
    try {
      setLoading(true);
      const response = await storefrontApi.getAboutPage(subdomain);
      if (response.success) {
        setAboutData(response.data);
      } else {
        setError('Failed to load about page');
      }
    } catch (error) {
      console.error('Error loading about page:', error);
      setError('Failed to load about page');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push(`/${subdomain}`);
  };

  // Conditional rendering instead of early returns
  if (!isClient) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isValidStore) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h1>404</h1>
        <p>About page not found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StoreHeader storeId={subdomain} />
      
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Back Button */}
        <Button
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={handleBackToHome}
          sx={{ mb: 4 }}
        >
          Back to Home
        </Button>

        {/* About Page Content */}
        <Grid container spacing={4}>
          {/* Shop Story Section */}
          <Grid item xs={12}>
            <Card sx={{ p: 4, mb: 4 }}>
              <Stack spacing={3}>
                {/* Shop Image */}
                {aboutData?.shopStory?.image && (
                  <Box
                    component="img"
                    src={aboutData.shopStory.image}
                    alt="About Us"
                    sx={{
                      width: '100%',
                      height: 300,
                      objectFit: 'cover',
                      borderRadius: 2,
                    }}
                  />
                )}
                
                {/* Shop Title */}
                <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center' }}>
                  {aboutData?.shopStory?.title || `About ${subdomain}`}
                </Typography>
                
                {/* Shop Description */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    textAlign: 'center', 
                    color: 'text.secondary',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {aboutData?.shopStory?.description || 'Welcome to our store! We are passionate about providing high-quality products and exceptional customer service.'}
                </Typography>
                
                {/* Store Details */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  {aboutData?.shopStory?.email && (
                    <Grid item xs={12} md={4}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Iconify icon="eva:email-fill" />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Email
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {aboutData.shopStory.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  )}
                  
                  {aboutData?.shopStory?.shop_hours && (
                    <Grid item xs={12} md={4}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          <Iconify icon="eva:clock-fill" />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Shop Hours
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {aboutData.shopStory.shop_hours}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  )}
                  
                  {aboutData?.shopStory?.location && (
                    <Grid item xs={12} md={4}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <Iconify icon="eva:pin-fill" />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Location
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {aboutData.shopStory.location}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Stack>
            </Card>
          </Grid>

          {/* Social Media Section */}
          {aboutData?.socialMedia?.description && (
            <Grid item xs={12}>
              <Card sx={{ p: 4 }}>
                <Stack spacing={3}>
                  <Typography variant="h4" sx={{ fontWeight: 600, textAlign: 'center' }}>
                    Connect With Us
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      textAlign: 'center', 
                      color: 'text.secondary',
                      lineHeight: 1.8
                    }}
                  >
                    {aboutData.socialMedia.description}
                  </Typography>
                  
                  {/* Social Media Links */}
                  {aboutData?.socialPlatforms && aboutData.socialPlatforms.length > 0 && (
                    <Stack 
                      direction="row" 
                      spacing={2} 
                      justifyContent="center"
                      sx={{ flexWrap: 'wrap', gap: 2 }}
                    >
                      {aboutData.socialPlatforms.map((platform) => (
                        <IconButton
                          key={platform.id}
                          component="a"
                          href={platform.platform_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: `${platform.color || '#1976d2'}20`,
                            color: platform.color || '#1976d2',
                            '&:hover': {
                              bgcolor: `${platform.color || '#1976d2'}40`,
                              transform: 'scale(1.05)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <Iconify icon={platform.icon_name || 'eva:link-2-fill'} width={24} />
                        </IconButton>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>

      <StoreFooter storeId={subdomain} />
    </Box>
  );
}
