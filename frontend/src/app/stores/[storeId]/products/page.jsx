'use client';

import { useState, use, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'src/routes/hooks';
import { m } from 'framer-motion';

import { varFade } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { AnnouncementBanner } from 'src/components/announcement-banner';
import { StoreHeader } from 'src/components/store-header';

// ----------------------------------------------------------------------

// Mock products data matching the new design
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Love Yourself First Flower Bouquet Vinyl Sticker',
    price: 'P300.00 PHP',
    priceValue: 300,
    category: 'Stickers',
    theme: 'Cute',
    isNew: true
  },
  {
    id: 2,
    name: 'Keep Moving Forward Vinyl Sticker',
    price: 'P300.00 PHP',
    priceValue: 300,
    category: 'Stickers',
    theme: 'Motivation',
    isNew: false
  },
  {
    id: 3,
    name: 'Life is Tough But So Am I Vinyl Sticker',
    price: 'P300.00 PHP',
    priceValue: 300,
    category: 'Stickers',
    theme: 'Relax',
    isNew: true
  },
  {
    id: 4,
    name: 'School Essentials Self Care Bundle Deal - Vinyl Stickers',
    price: 'P700.00 PHP',
    priceValue: 700,
    originalPrice: 'P800.00 PHP',
    category: 'Bundles',
    theme: 'Cute',
    isNew: false
  },
  {
    id: 5,
    name: 'No Pain No Gain Workout Vinyl Sticker',
    price: 'P300.00 PHP',
    priceValue: 300,
    category: 'Stickers',
    theme: 'Workout',
    isNew: true
  },
  {
    id: 6,
    name: 'Motivational Bunny Collection Vinyl Stickers',
    price: 'P500.00 PHP',
    priceValue: 500,
    category: 'Collections',
    theme: 'Motivation',
    isNew: false
  },
  {
    id: 7,
    name: 'Relaxing Tea Time Vinyl Sticker',
    price: 'P120.00 PHP',
    priceValue: 120,
    category: 'Stickers',
    theme: 'Relax',
    isNew: false
  },
  {
    id: 8,
    name: 'Workout Bunny Vinyl Sticker',
    price: 'P150.00 PHP',
    priceValue: 150,
    category: 'Stickers',
    theme: 'Workout',
    isNew: true
  },
  {
    id: 9,
    name: 'Self‑Care Essentials Pack',
    price: 'P450.00 PHP',
    priceValue: 450,
    category: 'Bundles',
    theme: 'Cute',
    isNew: false
  },
  {
    id: 10,
    name: 'Pastel Dreams Sticker Sheet',
    price: 'P200.00 PHP',
    priceValue: 200,
    category: 'Stickers',
    theme: 'Cute',
    isNew: true
  },
  {
    id: 11,
    name: 'Minimal Bunny Art Print (A5)',
    price: 'P350.00 PHP',
    priceValue: 350,
    category: 'Collections',
    theme: 'Relax',
    isNew: false
  },
  {
    id: 12,
    name: 'Focus & Grind Vinyl Sticker',
    price: 'P130.00 PHP',
    priceValue: 130,
    category: 'Stickers',
    theme: 'Motivation',
    isNew: false
  }
];

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
function ProductGridSection({ storeId }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [theme, setTheme] = useState('All Themes');
  const [status, setStatus] = useState('All Items');
  const [sort, setSort] = useState('Featured');
  const [visibleCount, setVisibleCount] = useState(6);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All Categories' || p.category === category;
    const matchesTheme = theme === 'All Themes' || p.theme === theme;
    const matchesStatus = status === 'All Items' || (status === 'New' ? p.isNew : !p.isNew);
    return matchesSearch && matchesCategory && matchesTheme && matchesStatus;
  }).sort((a, b) => {
    switch (sort) {
      case 'Price: Low to High':
        return (a.priceValue || 0) - (b.priceValue || 0);
      case 'Price: High to Low':
        return (b.priceValue || 0) - (a.priceValue || 0);
      case 'Name A-Z':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // When filters change, reset the visible list to the first page
  useEffect(() => {
    setVisibleCount(6);
  }, [search, category, theme, status, sort]);

  const handleViewMore = () => {
    setVisibleCount((c) => c + 6);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Stack spacing={6}>
          {/* Filters Row */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              sx={{ maxWidth: 380 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ borderRadius: 3 }}>
                {['All Categories', 'Stickers', 'Bundles', 'Collections'].map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Theme</InputLabel>
              <Select label="Theme" value={theme} onChange={(e) => setTheme(e.target.value)} sx={{ borderRadius: 3 }}>
                {['All Themes', 'Cute', 'Relax', 'Motivation', 'Workout'].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ borderRadius: 3 }}>
                {['All Items', 'New', 'Regular'].map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sort by</InputLabel>
              <Select label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ borderRadius: 3 }}>
                {['Featured', 'Price: Low to High', 'Price: High to Low', 'Name A-Z'].map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          {/* Products Grid */}
          <Grid container spacing={4}>
            {filtered.slice(0, visibleCount).map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <m.div
                  {...varFade().inUp}
                  custom={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card 
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 3,
                      p: 1.5,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.3s ease-in-out',
                        boxShadow: (theme) => theme.shadows[3]
                      }
                    }}
                  >
                    {/* NEW Tag */}
                    {product.isNew && (
                      <Chip
                        label="NEW"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          zIndex: 2,
                          bgcolor: 'success.main',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    )}

                    {/* Product Image */}
                    <Box
                      sx={{
                        width: '100%',
                        height: 280,
                        bgcolor: '#E5E5E5',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        mb: 1,
                        position: 'relative'
                      }}
                      onClick={() => {
                        const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^[-]+|[-]+$/g, '');
                        router.push(`/stores/${storeId}/${slug}`);
                      }}
                    >
                      <Iconify
                        icon="solar:gallery-minimalistic-bold"
                        sx={{
                          fontSize: 48,
                          color: '#A0A0A0'
                        }}
                      />
                      {/* cart button bottom-right */}
                      <IconButton
                        sx={{ position: 'absolute', bottom: 12, right: 12, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                        aria-label="Add to cart"
                      >
                        <Iconify icon="eva:shopping-cart-fill" />
                      </IconButton>
                    </Box>

                    {/* Product Info */}
                    <Stack spacing={1} sx={{ px: 1.5, py: 2 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500, 
                          color: 'text.primary',
                          fontSize: '0.875rem',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                      onClick={() => {
                        const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^[-]+|[-]+$/g, '');
                        router.push(`/stores/${storeId}/${slug}`);
                      }}
                      >
                        {product.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {product.category} · {product.theme}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {product.price}
                        </Typography>
                        {product.originalPrice && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.secondary', 
                              textDecoration: 'line-through',
                              fontSize: '0.75rem'
                            }}
                          >
                            {product.originalPrice}
                          </Typography>
                        )}
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
              {filtered.length > visibleCount && (
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
                onClick={handleViewMore}
              >
                View more
              </Button>
              )}
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

export default function ProductsPage({ params }) {
  const theme = useTheme();
  const { storeId } = use(params);

  // Set page title
  useEffect(() => {
    document.title = `Our Collection | Kitsch Studio | STUDIO360`;
  }, [storeId]);

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Header */}
      <StoreHeader />
      
      {/* Main Title */}
      <MainTitleSection />
      
      {/* Product Grid */}
      <ProductGridSection storeId={storeId} />
      
      {/* Footer */}
      <StoreFooter />
    </Box>
  );
}
