'use client';

import { m } from 'framer-motion';
import { use, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { storefrontApi } from 'src/utils/api/storefront';

import { toast } from 'src/components/snackbar';
import { varFade } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { StoreHeader } from 'src/components/store-header';
import { StoreFooter } from 'src/components/store-footer';
import { AnnouncementBanner } from 'src/components/announcement-banner';

import { CheckoutProvider, useCheckoutContext } from 'src/sections/checkout/context';

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
  const checkout = useCheckoutContext();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [theme, setTheme] = useState('All Themes');
  const [status, setStatus] = useState('All Items');
  const [sort, setSort] = useState('Featured');
  const [visibleCount, setVisibleCount] = useState(6);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle add to cart
  const handleAddToCart = (product) => {
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.priceValue,
        image: product.coverUrl,
        quantity: 1,
        sku: product.sku || '',
        category: product.category,
        colors: product.dimensions?.colors || ['Blue'], // Extract colors from dimensions or default
        sizes: product.dimensions?.sizes || ['S'], // Extract sizes from dimensions or default
      };
      
      checkout.onAddToCart(cartItem);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Fetch products from the database
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        // Test backend connection first
        const connectionTest = await storefrontApi.testConnection();
        if (!connectionTest.success) {
          throw new Error(`Backend connection failed: ${connectionTest.error}`);
        }
        
        const response = await storefrontApi.getProducts(storeId);
        
        if (response.success) {
          // Transform database products to match the component's expected format
          const transformedProducts = response.data.map((product) => ({
            id: product.id,
            name: product.name,
            price: `P${parseFloat(product.price).toFixed(2)} PHP`,
            priceValue: parseFloat(product.price),
            category: product.category || 'Uncategorized',
            theme: product.category || 'General',
            isNew: product.status === 'active' && new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Products created within last 30 days
            images: product.images || [],
            coverUrl: product.cover_image_url || product.images?.[0] || '/assets/images/product/product-placeholder.png',
          }));
          
          setProducts(transformedProducts);
        } else {
          console.warn('No products found or error in response');
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (storeId) {
      fetchProducts();
    }
  }, [storeId]);

  const filtered = products.filter((p) => {
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

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state (optional, can still show filters/UI)
  if (error && products.length === 0) {
    return (
      <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="body1" color="error" align="center">
            Error loading products: {error}
          </Typography>
        </Container>
      </Box>
    );
  }

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
                        overflow: 'hidden',
                        mb: 1,
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^[-]+|[-]+$/g, '');
                        router.push(`/stores/${storeId}/${slug}`);
                      }}
                    >
                      <Box
                        component="img"
                        src={product.coverUrl || product.images?.[0] || '/assets/images/product/product-placeholder.png'}
                        alt={product.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      {/* cart button bottom-right */}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the card click
                          handleAddToCart(product);
                        }}
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

// ----------------------------------------------------------------------

export default function ProductsPage({ params }) {
  const theme = useTheme();
  // Handle both Promise and resolved params
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { storeId } = resolvedParams;

  // Set page title
  useEffect(() => {
    document.title = `Our Collection | Kitsch Studio | STUDIO360`;
  }, [storeId]);

  return (
    <CheckoutProvider>
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
        {/* Announcement Banner */}
        <AnnouncementBanner />

        {/* Header */}
        <StoreHeader storeId={storeId} />
        
        {/* Main Title */}
        <MainTitleSection />
        
        {/* Product Grid */}
        <ProductGridSection storeId={storeId} />
        
        {/* Footer */}
        <StoreFooter storeId={storeId} />
      </Box>
    </CheckoutProvider>
  );
}
