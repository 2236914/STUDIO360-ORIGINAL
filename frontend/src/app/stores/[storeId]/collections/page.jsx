'use client';

import { m } from 'framer-motion';
import { use, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { varFade } from 'src/components/animate';
import { StoreHeader } from 'src/components/store-header';
import { AnnouncementBanner } from 'src/components/announcement-banner';

// ----------------------------------------------------------------------


// Main Title Section
function MainTitleSection() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3} alignItems="center" textAlign="center">
          <m.div {...varFade().inUp}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Our collection
            </Typography>
          </m.div>

          <m.div {...varFade().inUp}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 400,
                maxWidth: 500,
                lineHeight: 1.6
              }}
            >
              Handmade jewelry that speaks to the soul
            </Typography>
          </m.div>
        </Stack>
      </Container>
    </Box>
  );
}

// Product Grid Section
function ProductGridSection() {
  const products = [
    {
      id: 1,
      name: 'Minimalist silver ring',
      category: 'Sterling',
      price: '$85'
    },
    {
      id: 2,
      name: 'Vintage brass necklace',
      category: 'Antique',
      price: '$65'
    },
    {
      id: 3,
      name: 'Boho stone earrings',
      category: 'Turquoise',
      price: '$45'
    },
    {
      id: 4,
      name: 'Statement gold bracelet',
      category: 'Geometric',
      price: '$95'
    },
    {
      id: 5,
      name: 'Delicate pearl pendant',
      category: 'Classic',
      price: '$110'
    },
    {
      id: 6,
      name: 'Bohemian leather wrap',
      category: 'Natural',
      price: '$75'
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Stack spacing={6}>
          {/* Products Grid */}
          <Grid container spacing={4}>
            {products.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <m.div
                  {...varFade().inUp}
                  custom={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card 
                    sx={{ 
                      border: 'none', 
                      boxShadow: 'none',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.3s ease-in-out'
                      }
                    }}
                  >
                    <Stack spacing={3}>
                      {/* Product Image */}
                      <Box
                        component="img"
                        src={product.coverUrl || product.images?.[0] || '/assets/images/product/product-placeholder.png'}
                        alt={product.name}
                        sx={{
                          width: '100%',
                          height: 300,
                          objectFit: 'cover',
                          borderRadius: 2,
                          bgcolor: '#E5E5E5'
                        }}
                      />

                      {/* Product Info */}
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {product.category}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {product.price}
                        </Typography>
                        
                        {/* Add to Cart Button */}
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{
                            bgcolor: 'text.primary',
                            color: 'background.paper',
                            py: 1.5,
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: 'text.secondary'
                            }
                          }}
                        >
                          Add to cart
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                </m.div>
              </Grid>
            ))}
          </Grid>

          {/* View All Button */}
          <Stack alignItems="center">
            <m.div {...varFade().inUp}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'text.primary',
                  color: 'text.primary',
                  px: 6,
                  py: 2,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: 'transparent'
                  }
                }}
              >
                View all
              </Button>
            </m.div>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

// Footer Component (reused from other pages)
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
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                Join our newsletter to stay up to date on new collections and artisan stories.
              </Typography>
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
                placeholder="Enter your email"
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem'
                  }
                }}
              />
              <Button
                variant="contained"
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  px: 3,
                  py: 1
                }}
              >
                Sign Up
              </Button>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                By subscribing, you agree to our privacy policy
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'success.lighter',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'success.main'
                }}
              >
                <Typography variant="body2" sx={{ color: 'success.main' }}>
                  Thank you for subscribing
                </Typography>
              </Box>
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
              Made with STUDIO360
            </Typography>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Cookies settings
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Terms of Service
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Cookies Settings
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

export default function CollectionsPage({ params }) {
  const theme = useTheme();
  // Handle both Promise and resolved params
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { storeId } = resolvedParams;

  // Set page title
  useEffect(() => {
    document.title = `Our Collection | Kitsch Studio | STUDIO360`;
  }, [storeId]);

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Header with Search and Filters */}
      <StoreHeader />
      
      {/* Main Title */}
      <MainTitleSection />
      
      {/* Product Grid */}
      <ProductGridSection />
      
      {/* Footer */}
      <StoreFooter />
    </Box>
  );
}
