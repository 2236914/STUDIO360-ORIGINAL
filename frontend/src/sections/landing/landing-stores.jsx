'use client';

import { m } from 'framer-motion';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade } from 'src/components/animate/variants/fade';
import { storefrontApi } from 'src/utils/api/storefront';

// ----------------------------------------------------------------------

const STORES = [
  {
    id: 'monari paper',
    name: 'Monari Paper',
    slug: 'monaripaper',
    hasLink: false,
    color: '#FF6B6B',
  },
  {
    id: 'kitschstudio',
    name: 'Kitsch Studio',
    slug: 'kitschstudio',
    hasLink: true,
    linkUrl: 'https://kitschstudio.page',
    color: '#4ECDC4',
  },
  {
    id: 'flowerlace',
    name: 'Flower Lace',
    slug: 'flowerlace',
    hasLink: false,
    color: '#45B7D1',
  },
];

// ----------------------------------------------------------------------

export function LandingStores() {
  const theme = useTheme();
  const [storeData, setStoreData] = useState({});

  // Fetch store profile images
  useEffect(() => {
    const fetchStoreImages = async () => {
      const storeImages = {};
      for (const store of STORES) {
        try {
          const response = await storefrontApi.getShopInfo(store.slug);
          const shopInfo = response?.data || response;
          if (shopInfo?.profile_photo_url) {
            storeImages[store.id] = shopInfo.profile_photo_url;
          }
        } catch (error) {
          console.error(`Error fetching image for ${store.slug}:`, error);
          // Continue with letter avatar if fetch fails
        }
      }
      setStoreData(storeImages);
    };

    fetchStoreImages();
  }, []);

  const handleVisitStore = (store) => {
    if (store.hasLink && store.linkUrl) {
      window.open(store.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewAllStores = () => {
    window.location.href = '/stores';
  };

  return (
    <Box
      id="stores-section"
             sx={{
         py: { xs: 8, md: 12 },
         bgcolor: 'background.paper',
       }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        <Stack spacing={8}>
          {/* Header */}
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 1.2,
              }}
            >
              Social Proof
            </Typography>
            
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 700,
                lineHeight: 1.3,
                color: 'text.primary',
                maxWidth: 600,
              }}
            >
              Shops Using STUDIO360
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: 800,
              }}
            >
              Join hundreds of successful businesses already using STUDIO360 to streamline their operations
              and boost their growth. From artisan crafters to tech startups, we power diverse businesses.
            </Typography>
          </Stack>

          {/* Store Grid */}
          <Grid container spacing={4} justifyContent="center" maxWidth="lg" sx={{ mx: 'auto' }}>
            {STORES.map((store, index) => {
              const profileImage = storeData[store.id];
              const displayName = store.name;
              const firstLetter = displayName.charAt(0).toUpperCase();

              return (
                <Grid item xs={12} sm={6} md={4} key={store.id}>
                  <Card
                    component={m.div}
                    variants={varFade({ distance: 60, durationIn: 0.5 }).inUp}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 2.5,
                      bgcolor: 'background.paper',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease',
                      cursor: store.hasLink ? 'pointer' : 'default',
                      '&:hover': {
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                        transform: 'translateY(-8px)',
                      },
                    }}
                    onClick={() => store.hasLink && handleVisitStore(store)}
                  >
                    <Stack spacing={3} sx={{ height: '100%' }}>
                      {/* Header */}
                      <Stack direction="row" spacing={2} alignItems="center">
                        {/* Logo */}
                        <Avatar
                          src={profileImage}
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: profileImage ? 'transparent' : alpha(store.color, 0.15),
                            border: `2px solid ${alpha(store.color, 0.25)}`,
                          }}
                        >
                          {!profileImage && (
                            <Typography
                              variant="h5"
                              sx={{
                                color: store.color,
                                fontWeight: 700,
                              }}
                            >
                              {firstLetter}
                            </Typography>
                          )}
                        </Avatar>

                        {/* Store Info */}
                        <Stack spacing={0.5} sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: 'text.primary',
                              fontSize: '1.1rem',
                            }}
                          >
                            {displayName}
                          </Typography>
                        </Stack>

                        {/* Status Indicator */}
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#4caf50',
                          }}
                        />
                      </Stack>

                      {/* Visit Button */}
                      <Box sx={{ mt: 'auto' }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          disabled={!store.hasLink}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (store.hasLink) {
                              handleVisitStore(store);
                            }
                          }}
                          sx={{
                            borderColor: alpha(theme.palette.grey[400], 0.4),
                            color: 'text.primary',
                            fontWeight: 500,
                            borderRadius: 1.5,
                            py: 1,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                              borderColor: 'primary.main',
                              color: 'primary.main',
                            },
                            '&:disabled': {
                              borderColor: alpha(theme.palette.grey[400], 0.2),
                              color: 'text.disabled',
                              cursor: 'not-allowed',
                            },
                          }}
                        >
                          Visit Store
                        </Button>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

                       {/* Bottom CTA */}
           <Box
             sx={{
               textAlign: 'center',
               pt: 4,
             }}
           >
                           <Stack spacing={3} alignItems="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Iconify icon="solar:rocket-bold" />}
                  sx={{
                    bgcolor: 'primary.main',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: theme.shadows[8],
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      boxShadow: theme.shadows[12],
                    },
                  }}
                >
                  Start Your Store Today
                </Button>
                
                                 <Button
                   variant="text"
                   size="medium"
                   onClick={handleViewAllStores}
                   sx={{
                     color: 'primary.main',
                     fontWeight: 500,
                     fontSize: '0.9rem',
                     '&:hover': {
                       bgcolor: alpha(theme.palette.primary.main, 0.08),
                       transform: 'translateX(4px)',
                     },
                   }}
                 >
                   See More Store
                 </Button>
              </Stack>
           </Box>
        </Stack>
      </Container>
    </Box>
  );
}
