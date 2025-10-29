'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

// Store Footer Component
export function StoreFooter({ storeId }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);

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
    <Box sx={{ bgcolor: 'background.paper', py: 6, borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Column 1: Logo */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Store Name
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                Quality products for your needs.
              </Typography>
            </Stack>
          </Grid>

          {/* Column 2: Shop */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Shop
              </Typography>
              <Stack spacing={1}>
                <Link 
                  onClick={() => handleLinkClick('/about')}
                  sx={{ 
                    color: 'text.secondary', 
                    textDecoration: 'none', 
                    cursor: 'pointer',
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
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
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
                      width: 'fit-content',
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
                <Typography variant="caption" sx={{ color: 'error.main' }}>
                  Something went wrong, check your email and try again.
                </Typography>
              )}
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
              Made with STUDIO360
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                Terms of Service
              </Link>
              <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                Privacy Policy
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

