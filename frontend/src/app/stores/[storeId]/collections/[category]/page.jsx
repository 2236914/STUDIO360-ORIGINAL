'use client';

import { useState, use, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';

import { varFade } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { AnnouncementBanner } from 'src/components/announcement-banner';
import { StoreHeader } from 'src/components/store-header';

// ----------------------------------------------------------------------

// Main Title Section
function MainTitleSection({ category }) {
  const categoryTitles = {
    necklaces: 'Necklaces Collection',
    rings: 'Rings Collection', 
    earrings: 'Earrings Collection',
    bracelets: 'Bracelets Collection',
    pendants: 'Pendants Collection',
    watches: 'Watches Collection',
    chains: 'Chains Collection'
  };

  const categoryDescriptions = {
    necklaces: 'Elegant necklaces for every occasion',
    rings: 'Beautiful rings to adorn your fingers',
    earrings: 'Stunning earrings to frame your face',
    bracelets: 'Charming bracelets for your wrist',
    pendants: 'Meaningful pendants close to your heart',
    watches: 'Timeless watches for every moment',
    chains: 'Versatile chains for layering and styling'
  };

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
              {categoryTitles[category] || 'Product Collection'}
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
              {categoryDescriptions[category] || 'Discover our curated collection of handcrafted jewelry'}
            </Typography>
          </m.div>
        </Stack>
      </Container>
    </Box>
  );
}

// Product Grid Section
function ProductGridSection({ category }) {
  // Mock products for each category
  const categoryProducts = {
    necklaces: [
      { id: 1, name: 'Delicate silver necklace', price: '$85' },
      { id: 2, name: 'Vintage brass necklace', price: '$65' },
      { id: 3, name: 'Minimalist gold chain', price: '$95' },
      { id: 4, name: 'Statement pearl necklace', price: '$120' },
      { id: 5, name: 'Bohemian layered necklace', price: '$75' },
      { id: 6, name: 'Classic diamond pendant', price: '$150' }
    ],
    rings: [
      { id: 1, name: 'Minimalist silver ring', price: '$55' },
      { id: 2, name: 'Vintage brass ring', price: '$45' },
      { id: 3, name: 'Statement gold ring', price: '$95' },
      { id: 4, name: 'Delicate pearl ring', price: '$75' },
      { id: 5, name: 'Bohemian stone ring', price: '$65' },
      { id: 6, name: 'Classic diamond ring', price: '$200' }
    ],
    earrings: [
      { id: 1, name: 'Minimalist silver studs', price: '$35' },
      { id: 2, name: 'Vintage brass hoops', price: '$45' },
      { id: 3, name: 'Statement gold drops', price: '$85' },
      { id: 4, name: 'Delicate pearl earrings', price: '$65' },
      { id: 5, name: 'Bohemian stone earrings', price: '$55' },
      { id: 6, name: 'Classic diamond studs', price: '$180' }
    ],
    bracelets: [
      { id: 1, name: 'Minimalist silver bracelet', price: '$45' },
      { id: 2, name: 'Vintage brass bracelet', price: '$35' },
      { id: 3, name: 'Statement gold bracelet', price: '$95' },
      { id: 4, name: 'Delicate pearl bracelet', price: '$75' },
      { id: 5, name: 'Bohemian stone bracelet', price: '$55' },
      { id: 6, name: 'Classic diamond bracelet', price: '$160' }
    ],
    pendants: [
      { id: 1, name: 'Minimalist silver pendant', price: '$55' },
      { id: 2, name: 'Vintage brass pendant', price: '$45' },
      { id: 3, name: 'Statement gold pendant', price: '$85' },
      { id: 4, name: 'Delicate pearl pendant', price: '$75' },
      { id: 5, name: 'Bohemian stone pendant', price: '$65' },
      { id: 6, name: 'Classic diamond pendant', price: '$140' }
    ],
    watches: [
      { id: 1, name: 'Minimalist silver watch', price: '$120' },
      { id: 2, name: 'Vintage brass watch', price: '$100' },
      { id: 3, name: 'Statement gold watch', price: '$180' },
      { id: 4, name: 'Delicate pearl watch', price: '$150' },
      { id: 5, name: 'Bohemian stone watch', price: '$130' },
      { id: 6, name: 'Classic diamond watch', price: '$250' }
    ],
    chains: [
      { id: 1, name: 'Minimalist silver chain', price: '$65' },
      { id: 2, name: 'Vintage brass chain', price: '$55' },
      { id: 3, name: 'Statement gold chain', price: '$105' },
      { id: 4, name: 'Delicate pearl chain', price: '$85' },
      { id: 5, name: 'Bohemian stone chain', price: '$75' },
      { id: 6, name: 'Classic diamond chain', price: '$160' }
    ]
  };

  const products = categoryProducts[category] || [];

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
                        sx={{
                          width: '100%',
                          height: 300,
                          bgcolor: '#E5E5E5',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}
                      >
                        <Iconify
                          icon="solar:gallery-minimalistic-bold"
                          sx={{
                            fontSize: 48,
                            color: '#A0A0A0'
                          }}
                        />
                      </Box>

                      {/* Product Info */}
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {product.name}
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
                View all {category}
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
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Shop
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Collections
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Bestsellers
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  New arrivals
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Company
                </Typography>
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
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Our process
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Contact
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Social Media
                </Typography>
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
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Shipping
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Returns
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  FAQ
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Subscribe
                </Typography>
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

export default function CategoryPage({ params }) {
  const theme = useTheme();
  const { storeId, category } = use(params);

  // Set page title
  useEffect(() => {
    document.title = `${category.charAt(0).toUpperCase() + category.slice(1)} | Kitsch Studio | STUDIO360`;
  }, [category]);

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Header */}
      <StoreHeader />
      
      {/* Main Title */}
      <MainTitleSection category={category} />
      
      {/* Product Grid */}
      <ProductGridSection category={category} />
      
      {/* Footer */}
      <StoreFooter />
    </Box>
  );
}
