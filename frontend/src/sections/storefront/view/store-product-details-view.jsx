'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
// import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
// import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
// import Pagination from '@mui/material/Pagination';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { fCurrencyPHPSymbol } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Mock reviews data for product details
const PRODUCT_REVIEWS = [
  {
    id: 1,
    customerName: 'Sarah M.',
    isAnonymous: false,
    rating: 5,
    date: '2 days ago',
    comment: 'Amazing quality! These ballet flats are so comfortable and stylish. Perfect for everyday wear.',
    product: 'Chic Ballet Flats',
    images: ['https://images.unsplash.com/photo-1515562141207-7cf88c8735c5?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop']
  },
  {
    id: 2,
    customerName: 'Anonymous',
    isAnonymous: true,
    rating: 4,
    date: '1 week ago',
    comment: 'Good shoes, comfortable fit. The color matches the description perfectly.',
    product: 'Chic Ballet Flats',
    images: []
  },
  {
    id: 3,
    customerName: 'Maria L.',
    isAnonymous: false,
    rating: 5,
    date: '2 weeks ago',
    comment: 'Love these flats! They go with everything and are so comfortable for walking.',
    product: 'Chic Ballet Flats',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop']
  },
  {
    id: 4,
    customerName: 'Anonymous',
    isAnonymous: true,
    rating: 4,
    date: '3 weeks ago',
    comment: 'Nice quality, fast shipping. Would recommend to others.',
    product: 'Chic Ballet Flats',
    images: []
  },
  {
    id: 5,
    customerName: 'Jennifer K.',
    isAnonymous: false,
    rating: 5,
    date: '1 month ago',
    comment: 'Perfect fit and great quality. These are my new favorite shoes!',
    product: 'Chic Ballet Flats',
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=300&fit=crop']
  }
];

// Mock product data
const PRODUCT_DATA = {
  '1': {
    id: '1',
    name: 'Classic Leather Loafers',
    category: 'Shoes',
    manufacturer: 'Kitsch Studio',
    serialNumber: 'KS2024001',
    shipsFrom: 'Philippines',
    price: 45.99,
    originalPrice: 65.00,
    rating: 4.5,
    reviewCount: 892,
    status: 'SALE',
    stock: 'IN STOCK',
    description: 'Classic leather loafers perfect for any occasion. Made with premium materials for lasting comfort and style.',
    images: [
      '/assets/images/product/product_1.jpg',
      '/assets/images/product/product_2.jpg',
      '/assets/images/product/product_3.jpg',
      '/assets/images/product/product_4.jpg',
      '/assets/images/product/product_5.jpg',
    ],
    colors: ['#000000', '#8B4513', '#4169E1'],
    sizes: ['7', '8', '9', '10'],
    quantity: 1,
    availableQuantity: 32,
    specifications: {
      category: 'Shoes',
      manufacturer: 'Kitsch Studio',
      serialNumber: 'KS2024001',
      shipsFrom: 'Philippines',
    },
    productDetails: [
      'Premium leather upper for durability and comfort',
      'Cushioned insole for all-day wear',
      'Flexible sole for natural movement',
      'Available in multiple colors and sizes',
      'Perfect for casual and formal occasions',
      'Handcrafted with attention to detail'
    ],
    benefits: [
      'Lightweight design for maximum comfort during long wear.',
      'Breathable materials keep your feet cool and dry.',
      'Versatile style that pairs with any outfit.',
      'Durable construction ensures long-lasting wear.'
    ],
    deliveryReturns: {
      freeDelivery: 'Your order of ₱1,500 or more gets free standard delivery.',
      standardDelivery: 'Standard delivered 4-5 Business Days',
      expressDelivery: 'Express delivered 2-4 Business Days',
      note: 'Orders are processed and delivered Monday-Friday (excluding public holidays)'
    }
  },
  '2': {
    id: '2',
    name: 'Chic Ballet Flats',
    category: 'Shoes',
    manufacturer: 'Kitsch Studio',
    serialNumber: 'KS2024001',
    shipsFrom: 'Philippines',
    price: 25.18,
    originalPrice: 35.00,
    rating: 4.8,
    reviewCount: 1247,
    status: 'SALE',
    stock: 'IN STOCK',
    description: 'Elegant and comfortable ballet flats perfect for any occasion. Made with premium materials for lasting comfort and style.',
    images: [
      '/assets/images/product/product_1.jpg',
      '/assets/images/product/product_2.jpg',
      '/assets/images/product/product_3.jpg',
      '/assets/images/product/product_4.jpg',
      '/assets/images/product/product_5.jpg',
    ],
    colors: ['#000000', '#FFFFFF', '#FF6B6B'],
    sizes: ['6', '7', '8', '9'],
    quantity: 1,
    availableQuantity: 45,
    specifications: {
      category: 'Shoes',
      manufacturer: 'Kitsch Studio',
      serialNumber: 'KS2024001',
      shipsFrom: 'Philippines',
    },
    productDetails: [
      'Premium leather upper for durability and comfort',
      'Cushioned insole for all-day wear',
      'Flexible sole for natural movement',
      'Available in multiple colors and sizes',
      'Perfect for casual and formal occasions',
      'Handcrafted with attention to detail'
    ],
    benefits: [
      'Lightweight design for maximum comfort during long wear.',
      'Breathable materials keep your feet cool and dry.',
      'Versatile style that pairs with any outfit.',
      'Durable construction ensures long-lasting wear.'
    ],
    deliveryReturns: {
      freeDelivery: 'Your order of ₱1,500 or more gets free standard delivery.',
      standardDelivery: 'Standard delivered 4-5 Business Days',
      expressDelivery: 'Express delivered 2-4 Business Days',
      note: 'Orders are processed and delivered Monday-Friday (excluding public holidays)'
    }
  }
};

// ----------------------------------------------------------------------

export function StoreProductDetailsView({ id, additionalProducts = {} }) {
  const [mounted, setMounted] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // tabs removed for simplified mock layout
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(() => {
    // Get product data first to set the initial size
    const productData = additionalProducts[id] || PRODUCT_DATA[id] || PRODUCT_DATA['1'];
    return productData.sizes[0] || '9';
  });
  const [quantity, setQuantity] = useState(1);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  // const [reviewsPage, setReviewsPage] = useState(1);

  // Get product data (in real app, this would be from API)
  const product = additionalProducts[id] || PRODUCT_DATA[id] || PRODUCT_DATA['1'];

  // Set page title
  useEffect(() => {
    document.title = `${product.name} | Kitsch Studio`;
  }, [product.name]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300); // Show after scrolling 300px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // tabs removed

  const handleQuantityChange = useCallback((delta) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, product.availableQuantity)));
  }, [product.availableQuantity]);

  const handleShareMenuOpen = useCallback((event) => {
    setShareMenuAnchor(event.currentTarget);
  }, []);

  const handleShareMenuClose = useCallback(() => {
    setShareMenuAnchor(null);
  }, []);

  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleShareFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShareMenuAnchor(null);
  }, []);

  const handleShareInstagram = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      window.alert('Link copied. Paste into Instagram to share.');
    } catch (e) {
      window.prompt('Copy this link to share on Instagram:', window.location.href);
    }
    setShareMenuAnchor(null);
  }, []);

  const handleShareNative = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        window.alert('Link copied to clipboard');
      }
    } catch (e) {
      // user cancelled or not supported
    }
    setShareMenuAnchor(null);
  }, []);

  const renderProductImages = (
    <Grid item xs={12} lg={6}>
      <Card sx={{ p: { xs: 1.5, md: 2 }, boxShadow: 'none', border: 'none', mt: { xs: 1.5, md: 2 } }}>
        <Box sx={{ position: 'relative', mb: 1.5 }}>
          {/* Share icon button in the top-right of main image */}
          <IconButton
            aria-label="share"
            onClick={handleShareMenuOpen}
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: 'primary.lighter' } }}
          >
            <Iconify icon="solar:share-bold" sx={{ color: 'primary.main' }} />
          </IconButton>
          <Box
            component="img"
            src={product.images?.[0] || '/assets/images/product/product-placeholder.png'}
            alt={`${product.name} main image`}
            sx={{
              width: '100%',
              aspectRatio: '1/1',
              maxHeight: { xs: 300, sm: 400, md: 500 },
              objectFit: 'cover',
              borderRadius: 2,
              bgcolor: 'grey.100'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            1/{product.images.length}
          </Box>
        </Box>

        <Box 
          sx={{ 
            display: 'flex', 
            gap: 0.5, 
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}
        >
          {product.images.slice(0, 5).map((image, index) => (
            <Box
              key={index}
              sx={{
                flex: { xs: '0 0 calc(20% - 4px)', sm: '0 0 calc(20% - 4px)' },
                minWidth: { xs: '60px', sm: '80px' },
                maxWidth: { xs: '80px', sm: '100px' },
              }}
            >
              <Box
                component="img"
                src={image || '/assets/images/product/product-placeholder.png'}
                alt={`${product.name} ${index + 1}`}
                sx={{
                  width: '100%',
                  aspectRatio: '1/1',
                  objectFit: 'cover',
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: index === 0 ? '2px solid' : '1px solid',
                  borderColor: index === 0 ? 'primary.main' : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    opacity: 0.8,
                    transform: 'scale(1.05)'
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      </Card>
    </Grid>
  );

  const renderProductInfo = (
    <Grid item xs={12} lg={6}>
      <Card sx={{ p: { xs: 1.5, md: 2 }, boxShadow: 'none', border: 'none', mt: { xs: 1.5, md: 2 } }}>
        <Stack spacing={1.5}>
          <Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                bgcolor: 'success.lighter',
                color: 'success.dark',
                px: 2,
                py: 0.5,
                borderRadius: '20px',
                mb: 2,
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'success.dark',
                  mr: 1
                }}
              />
              In stock, ready to ship
            </Box>
            <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
              {product.name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
              <Rating value={product.rating} readOnly size="small" />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                ({product.reviewCount.toLocaleString()} reviews)
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ color: 'text.primary', mb: 0.5, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
              {fCurrencyPHPSymbol(product.price)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {product.description}
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Color</Typography>
            <Stack direction="row" spacing={1}>
              {product.colors.map((color, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: color,
                    border: '2px solid',
                    borderColor: selectedColor === index ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'scale(1.1)'
                    }
                  }}
                  onClick={() => setSelectedColor(index)}
                >
                  {selectedColor === index && (
                    <Iconify icon="eva:checkmark-fill" width={20} sx={{ color: 'white' }} />
                  )}
                </Box>
              ))}
            </Stack>
          </Stack>

          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Size</Typography>
              <Typography variant="body2" sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                Size chart
              </Typography>
            </Stack>
            <FormControl fullWidth>
              <Select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                displayEmpty
                sx={{
                  '& .MuiSelect-select': {
                    py: 1.5
                  }
                }}
              >
                {product.sizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Quantity</Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  sx={{
                    '&:disabled': {
                      opacity: 0.3
                    }
                  }}
                >
                  <Iconify icon="eva:minus-fill" />
                </IconButton>
                <Typography sx={{ minWidth: 40, textAlign: 'center', fontWeight: 600 }}>
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.availableQuantity}
                  sx={{
                    '&:disabled': {
                      opacity: 0.3
                    }
                  }}
                >
                  <Iconify icon="eva:plus-fill" />
                </IconButton>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Available {product.availableQuantity}
              </Typography>
            </Stack>
          </Stack>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={1.5}
            sx={{ 
              width: '100%',
              pt: 1,
              '& .MuiButton-root': {
                minHeight: 48,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 2,
                  transform: 'translateY(-1px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            <Button 
              variant="outlined" 
              size="large" 
              fullWidth
              startIcon={<Iconify icon="eva:shopping-cart-fill" width={20} />}
              sx={{ 
                borderWidth: 2,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: 'primary.dark',
                  backgroundColor: 'primary.lighter'
                }
              }}
            >
              Add to Cart
            </Button>
            <Button 
              variant="contained" 
              size="large" 
              fullWidth
              startIcon={<Iconify icon="eva:flash-fill" width={20} />}
              sx={{ 
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: 4
                }
              }}
            >
              Buy Now
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Grid>
  );

  const renderWarrantyBenefits = (
    <Grid item xs={12}>
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={{ xs: 2, md: 3 }} 
        sx={{ textAlign: 'center', py: { xs: 2, md: 3 }, mt: { xs: 1.5, md: 2 } }}
      >
        <Stack flex={1} alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              borderRadius: '50%',
              bgcolor: 'success.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main', width: { xs: 24, md: 32 } }} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>100% original</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' }, px: { xs: 1, md: 0 } }}>
            Guaranteed authentic products with quality assurance.
          </Typography>
        </Stack>

        <Stack flex={1} alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              borderRadius: '50%',
              bgcolor: 'info.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify icon="eva:clock-fill" sx={{ color: 'info.main', width: { xs: 24, md: 32 } }} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>10 days replacement</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' }, px: { xs: 1, md: 0 } }}>
            Easy returns and exchanges within 10 days of purchase.
          </Typography>
        </Stack>

        <Stack flex={1} alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              borderRadius: '50%',
              bgcolor: 'warning.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify icon="eva:shield-fill" sx={{ color: 'warning.main', width: { xs: 24, md: 32 } }} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>Year warranty</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' }, px: { xs: 1, md: 0 } }}>
            Full manufacturer warranty coverage for one full year.
          </Typography>
        </Stack>
      </Stack>
    </Grid>
  );

  const renderDescription = (
    <Grid item xs={12}>
      <Card sx={{ mt: { xs: 1.5, md: 2 }, p: { xs: 2, md: 2.5 } }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Description</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {product.description}
                    </Typography>
      </Card>
    </Grid>
  );

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ position: 'relative', pb: 2 }}>
      {/* Top Controls */}
      <Box sx={{ 
        position: 'absolute', 
        top: { xs: 12, sm: 16, md: 24 }, 
        left: { xs: 12, sm: 16, md: 32 }, 
        zIndex: 10 
      }}>
        <Button
          variant="outlined"
          onClick={() => window.history.back()}
          startIcon={
            <Iconify
              icon="eva:arrow-back-fill"
              width={20}
              sx={{
                color: 'text.primary',
                transition: 'color 0.2s',
                '.MuiButton-root:hover &': {
                  color: 'primary.main'
                }
              }}
            />
          }
          sx={{
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            minHeight: { xs: 36, md: 40 },
            px: { xs: 1.5, md: 2 },
            fontSize: { xs: '0.875rem', md: '1rem' },
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            transition: 'all 0.2s',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            boxShadow: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: 'primary.main',
              borderColor: 'primary.main',
              boxShadow: 2,
            }
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Back</Box>
        </Button>
      </Box>

      <Stack 
        direction="row" 
        spacing={{ xs: 0.5, sm: 1, md: 1.5 }} 
        sx={{ 
          position: 'absolute', 
          top: { xs: 12, sm: 16, md: 24 }, 
          right: { xs: 12, sm: 16, md: 32 }, 
          zIndex: 10 
        }}
      >
        <IconButton
          aria-label="search"
          onClick={() => (window.location.href = '/search')}
          sx={{
            color: 'text.primary',
            width: { xs: 36, md: 40 },
            height: { xs: 36, md: 40 },
            transition: 'all 0.2s',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            boxShadow: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: 'primary.main',
              boxShadow: 2,
            }
          }}
        >
          <Iconify 
            icon="solar:magnifer-linear" 
            width={20}
          />
        </IconButton>
        <IconButton
          aria-label="share"
          onClick={handleShareMenuOpen}
          sx={{
            color: 'text.primary',
            width: { xs: 36, md: 40 },
            height: { xs: 36, md: 40 },
            transition: 'all 0.2s',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            boxShadow: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: 'primary.main',
              boxShadow: 2,
            }
          }}
        >
          <Iconify 
            icon="eva:share-fill" 
            width={20}
          />
        </IconButton>
        <IconButton
          aria-label="cart"
          onClick={() => (window.location.href = '/checkout')}
          sx={{
            color: 'text.primary',
            width: { xs: 36, md: 40 },
            height: { xs: 36, md: 40 },
            transition: 'all 0.2s',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            boxShadow: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: 'primary.main',
              boxShadow: 2,
            }
          }}
        >
          <Iconify 
            icon="solar:cart-3-bold" 
            width={20}
          />
        </IconButton>
      </Stack>

      {/* Share menu */}
      <Menu
        anchorEl={shareMenuAnchor}
        open={Boolean(shareMenuAnchor)}
        onClose={handleShareMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleShareFacebook}>
          <ListItemIcon>
            <Iconify icon="eva:facebook-fill" width={20} />
          </ListItemIcon>
          <ListItemText>Facebook</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareInstagram}>
          <ListItemIcon>
            <Iconify icon="logos:instagram-icon" width={20} />
          </ListItemIcon>
          <ListItemText>Instagram</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareNative}>
          <ListItemIcon>
            <Iconify icon="eva:share-fill" width={20} />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
      </Menu>

      <Grid 
        container 
        spacing={{ xs: 1.5, md: 2 }}
        sx={{ 
          maxWidth: '1200px', 
          mx: 'auto',
          px: { xs: 1.5, sm: 2, md: 3 },
          pt: { xs: 10, sm: 12, md: 14 }
        }}
      >
        {renderProductImages}
        {renderProductInfo}
        {renderWarrantyBenefits}
        {renderDescription}
      </Grid>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <IconButton
          aria-label="back to top"
          onClick={handleBackToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 20, md: 30 },
            right: { xs: 20, md: 30 },
            zIndex: 1000,
            width: 48,
            height: 48,
            backgroundColor: 'transparent',
            color: 'primary.main',
            opacity: 0.8,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white',
              opacity: 1,
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          <Iconify icon="eva:arrow-upward-fill" width={20} />
        </IconButton>
      )}
    </Box>
  );
}
