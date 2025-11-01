'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

import { useRouter } from 'src/routes/hooks';
import { storefrontApi } from 'src/utils/api/storefront';

// ----------------------------------------------------------------------

// Store Footer Component
export function StoreFooter({ storeId }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [shopInfo, setShopInfo] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!storeId) return;
        const resp = await storefrontApi.getShopInfo(storeId);
        const data = resp?.data || resp;
        if (active) setShopInfo(data || null);
      } catch (_) {
        if (active) setShopInfo(null);
      }
    })();
    return () => { active = false; };
  }, [storeId]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEmailError(true);
      return;
    }
    // Handle email subscription
    console.log('Email subscribed:', email);
    setEmail('');
    setEmailError(false);
  };

  const handleLinkClick = (path) => {
    router.push(`/${storeId}${path}`);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 4, md: 6 }, borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Column 1: Logo */}
          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                {shopInfo?.profile_photo_url ? (
                  <Avatar 
                    src={shopInfo.profile_photo_url} 
                    alt={shopInfo.shop_name || 'Store'} 
                    sx={{ width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 } }} 
                  />
                ) : (
                  <Avatar sx={{ width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 } }}>
                    {(shopInfo?.shop_name || 'S').charAt(0).toUpperCase()}
                  </Avatar>
                )}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }}
                >
                  {shopInfo?.shop_name || 'Store Name'}
                </Typography>
              </Stack>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary', 
                  lineHeight: 1.6,
                  fontSize: { xs: '0.875rem', md: '0.9375rem' }
                }}
              >
                {shopInfo?.shop_category ? `Category: ${shopInfo.shop_category}` : 'Quality products for your needs.'}
              </Typography>
            </Stack>
          </Grid>

          {/* Column 2: Shop */}
          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={2}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.primary',
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                Shop
              </Typography>
              <Stack spacing={1}>
                <Link 
                  onClick={() => handleLinkClick('/about')}
                  sx={{ 
                    color: 'text.secondary', 
                    textDecoration: 'none', 
                    cursor: 'pointer',
                    fontSize: { xs: '0.875rem', md: '0.9375rem' },
                    '&:hover': { color: 'primary.main' } 
                  }}
                >
                  About Us
                </Link>
                <Link 
                  onClick={() => handleLinkClick('/shipping')}
                  sx={{ 
                    color: 'text.secondary', 
                    textDecoration: 'none', 
                    cursor: 'pointer',
                    fontSize: { xs: '0.875rem', md: '0.9375rem' },
                    '&:hover': { color: 'primary.main' } 
                  }}
                >
                  Shipping & Returns
                </Link>
                <Link 
                  onClick={() => handleLinkClick('/faq')}
                  sx={{ 
                    color: 'text.secondary', 
                    textDecoration: 'none', 
                    cursor: 'pointer',
                    fontSize: { xs: '0.875rem', md: '0.9375rem' },
                    '&:hover': { color: 'primary.main' } 
                  }}
                >
                  FAQ
                </Link>
              </Stack>
            </Stack>
          </Grid>

          {/* Column 3: Newsletter */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary', 
                  lineHeight: 1.6,
                  fontSize: { xs: '0.875rem', md: '0.9375rem' }
                }}
              >
                Join our newsletter and receive news and information on upcoming events, our brand and partnerships
              </Typography>
              <form onSubmit={handleEmailSubmit}>
                <Stack spacing={2}>
                  <TextField
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(false);
                    }}
                    size="small"
                    error={emailError}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                        '& fieldset': {
                          borderColor: emailError ? 'error.main' : 'divider',
                        },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="medium"
                    sx={{
                      bgcolor: 'grey.600',
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 500,
                      width: { xs: '100%', sm: 'fit-content' },
                      px: 3,
                      '&:hover': {
                        bgcolor: 'grey.700',
                      },
                    }}
                  >
                    Subscribe
                  </Button>
                </Stack>
              </form>
              {emailError && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'error.main',
                    fontSize: { xs: '0.75rem', md: '0.8125rem' }
                  }}
                >
                  Something went wrong, check your email and try again.
                </Typography>
              )}
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Box sx={{ mt: { xs: 4, md: 6 }, pt: { xs: 3, md: 4 }, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', md: '0.875rem' }
              }}
            >
              Made with STUDIO360
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 2 }}
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              <Link 
                href="#" 
                sx={{ 
                  color: 'text.secondary', 
                  textDecoration: 'none',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  '&:hover': { color: 'primary.main' } 
                }}
              >
                Terms of Service
              </Link>
              <Link 
                href="#" 
                sx={{ 
                  color: 'text.secondary', 
                  textDecoration: 'none',
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  '&:hover': { color: 'primary.main' } 
                }}
              >
                Privacy Policy
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

