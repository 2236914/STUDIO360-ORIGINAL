'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Menu from '@mui/material/Menu';
import Pagination from '@mui/material/Pagination';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Fab from '@mui/material/Fab';

import { Iconify } from 'src/components/iconify';
import { fCurrencyPHPSymbol } from 'src/utils/format-number';

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
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(() => {
    // Get product data first to set the initial size
    const productData = additionalProducts[id] || PRODUCT_DATA[id] || PRODUCT_DATA['1'];
    return productData.sizes[0] || '9';
  });
  const [quantity, setQuantity] = useState(1);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [reviewsPage, setReviewsPage] = useState(1);

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

  const handleTabChange = useCallback((event, newValue) => {
    setSelectedTab(newValue);
  }, []);

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
          <Box
            component="img"
            src="https://via.placeholder.com/600x600/8B5CF6/FFFFFF?text=Ballet+Shoes"
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

        <Grid container spacing={0.5}>
          {product.images.map((image, index) => (
            <Grid item xs={2.4} key={index}>
              <Box
                component="img"
                src="https://via.placeholder.com/600x600/8B5CF6/FFFFFF?text=Ballet+Shoes"
                alt={`${product.name} ${index + 1}`}
                sx={{
                  width: '100%',
                  aspectRatio: '1/1',
                  objectFit: 'cover',
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: index === 0 ? '2px solid' : '1px solid',
                  borderColor: index === 0 ? 'primary.main' : 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    opacity: 0.8
                  }
                }}
              />
            </Grid>
          ))}
        </Grid>
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
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              {product.name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Rating value={product.rating} readOnly size="small" />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                ({product.reviewCount.toLocaleString()} reviews)
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ color: 'text.primary', mb: 0.5 }}>
              {fCurrencyPHPSymbol(product.price)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {product.description}
            </Typography>
          </Box>

          <Divider />

          <Grid spacing={1}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">Color</Typography>
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
                      '&:hover': {
                        borderColor: 'primary.main'
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
          </Grid>

          <Grid spacing={1}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1">Size</Typography>
                <Typography variant="body2" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                  Size chart
                </Typography>
              </Stack>
              <FormControl fullWidth>
                <Select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  displayEmpty
                >
                  {product.sizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          <Grid spacing={1}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">Quantity</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Iconify icon="eva:minus-fill" />
                </IconButton>
                <Typography sx={{ minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.availableQuantity}
                >
                  <Iconify icon="eva:plus-fill" />
                </IconButton>
                <Typography variant="body2" sx={{ color: 'text.secondary', ml: 2 }}>
                  Available {product.availableQuantity}
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={1}
            sx={{ 
              width: '100%',
              '& .MuiButton-root': {
                minHeight: 44,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: 2
              }
            }}
          >
            <Button 
              variant="outlined" 
              size="large" 
              sx={{ 
                flex: { xs: 1, sm: 1 },
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
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
              sx={{ 
                flex: { xs: 1, sm: 1 },
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark'
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
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'success.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main', width: 32 }} />
          </Box>
          <Typography variant="h6">100% original</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Guaranteed authentic products with quality assurance.
          </Typography>
        </Stack>

        <Stack flex={1} alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'info.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify icon="eva:clock-fill" sx={{ color: 'info.main', width: 32 }} />
          </Box>
          <Typography variant="h6">10 days replacement</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Easy returns and exchanges within 10 days of purchase.
          </Typography>
        </Stack>

        <Stack flex={1} alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'warning.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify icon="eva:shield-fill" sx={{ color: 'warning.main', width: 32 }} />
          </Box>
          <Typography variant="h6">Year warranty</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Full manufacturer warranty coverage for one full year.
          </Typography>
        </Stack>
      </Stack>
    </Grid>
  );

  const renderTabs = (
    <Grid item xs={12}>
      <Card sx={{ mt: { xs: 1.5, md: 2 } }}>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ px: 3 }}>
          <Tab 
            icon={<Iconify icon="eva:file-text-fill" width={20} />}
            iconPosition="start"
            label="Description" 
          />
          <Tab 
            icon={<Iconify icon="eva:star-fill" width={20} />}
            iconPosition="start"
            label={`Reviews (${product.reviewCount.toLocaleString()})`} 
          />
          <Tab 
            icon={<Iconify icon="eva:truck-fill" width={20} />}
            iconPosition="start"
            label="Shipping & Returns" 
          />
        </Tabs>
        
        <Divider />
        
        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          {selectedTab === 0 && (
            <Stack spacing={3}>
              {/* Specifications */}
              <Stack spacing={1.5}>
                <Typography variant="h6">Specifications</Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Category
                    </Typography>
                    <Typography variant="body2">{product.specifications.category}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Manufacturer
                    </Typography>
                    <Typography variant="body2">{product.specifications.manufacturer}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Serial number
                    </Typography>
                    <Typography variant="body2">{product.specifications.serialNumber}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Ships from
                    </Typography>
                    <Typography variant="body2">{product.specifications.shipsFrom}</Typography>
                  </Grid>
                </Grid>
              </Stack>

              {/* Product Details */}
              <Stack spacing={2}>
                <Typography variant="h6">Product details</Typography>
                <Stack spacing={1}>
                  {product.productDetails.map((detail, index) => (
                    <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box component="span" sx={{ mr: 1 }}>•</Box>
                      {detail}
                    </Typography>
                  ))}
                </Stack>
              </Stack>

              {/* Benefits */}
              <Stack spacing={2}>
                <Typography variant="h6">Benefits</Typography>
                <Stack spacing={1}>
                  {product.benefits.map((benefit, index) => (
                    <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box component="span" sx={{ mr: 1 }}>•</Box>
                      {benefit}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          )}

          {selectedTab === 1 && (
            <Stack spacing={2}>
              <Typography variant="h6">Customer Reviews</Typography>
              <Stack spacing={2}>
                {PRODUCT_REVIEWS.slice((reviewsPage - 1) * 3, reviewsPage * 3).map((review) => (
                  <Box key={review.id} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Stack direction="row" spacing={1.5} sx={{ mb: 1 }}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {review.isAnonymous ? 'A' : review.customerName.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle2">
                            {review.isAnonymous ? 'Anonymous' : review.customerName}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" />
                        </Stack>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {review.date}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {review.comment}
                    </Typography>
                    {review.images.length > 0 && (
                      <Stack direction="row" spacing={1}>
                        {review.images.map((image, index) => (
                          <Box
                            key={index}
                            component="img"
                            src={image}
                            alt={`Review ${index + 1}`}
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 1,
                              objectFit: 'cover',
                              cursor: 'pointer'
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                ))}
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={Math.ceil(PRODUCT_REVIEWS.length / 3)}
                  page={reviewsPage}
                  onChange={(event, value) => setReviewsPage(value)}
                  color="primary"
                />
              </Box>
            </Stack>
          )}

          {selectedTab === 2 && (
            <Stack spacing={3}>
              <Typography variant="h6">Shipping & Returns</Typography>
              
              {/* Shipping Options */}
              <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  🚚 Shipping Options
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'success.lighter', borderRadius: 2, bgcolor: 'success.lighter', textAlign: 'center' }}>
                      <Iconify icon="eva:gift-fill" width={32} sx={{ color: 'success.main', mb: 1 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Free Delivery</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        Orders ₱2,000+ get free standard delivery
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'info.lighter', borderRadius: 2, bgcolor: 'info.lighter', textAlign: 'center' }}>
                      <Iconify icon="eva:truck-fill" width={32} sx={{ color: 'info.main', mb: 1 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Standard Delivery</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        4-5 Business Days
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'warning.lighter', borderRadius: 2, bgcolor: 'warning.lighter', textAlign: 'center' }}>
                      <Iconify icon="eva:flash-fill" width={32} sx={{ color: 'warning.main', mb: 1 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Express Delivery</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        2-4 Business Days
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>

              {/* Returns & Exchanges */}
              <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  🔄 Returns & Exchanges
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Iconify icon="eva:clock-fill" width={20} sx={{ color: 'info.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Return Period</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        10 days from delivery date for returns and exchanges
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Iconify icon="eva:shield-fill" width={20} sx={{ color: 'success.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Condition</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Items must be in original condition with tags attached
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>

              {/* Processing Information */}
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: 1, borderColor: 'grey.200' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Iconify icon="eva:info-fill" width={20} sx={{ color: 'info.main' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Processing Information</Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Orders are processed and delivered Monday-Friday (excluding public holidays). 
                  Same-day processing for orders placed before 2:00 PM.
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </Card>
    </Grid>
  );

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ position: 'relative', pb: 2 }}>
      {/* Announcement Banner */}
      <Box sx={{ bgcolor: 'primary.lighter', py: 2, px: { xs: 1, md: 2 }, textAlign: 'center' }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <Iconify icon="eva:shopping-cart-fill" width={20} sx={{ color: 'primary.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Spend ₱1,500 and get FREE tracked nationwide shipping!
          </Typography>
        </Stack>
      </Box>

      {/* Top Controls */}
      <Box sx={{ position: 'absolute', top: { xs: 60, md: 80 }, left: { xs: 20, md: 32 }, zIndex: 10 }}>
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
            border: 'none',
            minHeight: 40,
            px: 2,
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            transition: 'color 0.2s',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
              color: 'primary.main',
              border: 'none',
              boxShadow: 'none',
            }
          }}
        >
          Back
        </Button>
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ position: 'absolute', top: { xs: 60, md: 80 }, right: { xs: 20, md: 32 }, zIndex: 10 }}>
        <IconButton
          aria-label="search"
          onClick={() => (window.location.href = '/search')}
          sx={{
            color: 'text.primary',
            border: 'none',
            transition: 'color 0.2s',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
              color: 'primary.main',
              border: 'none',
              boxShadow: 'none',
            }
          }}
        >
          <Iconify 
            icon="solar:magnifer-linear" 
            width={20}
            sx={{
              color: 'text.primary',
              transition: 'color 0.2s',
              '.MuiIconButton-root:hover &': {
                color: 'primary.main'
              }
            }}
          />
        </IconButton>
        <IconButton
          aria-label="share"
          onClick={handleShareMenuOpen}
          sx={{
            color: 'text.primary',
            border: 'none',
            transition: 'color 0.2s',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
              color: 'primary.main',
              border: 'none',
              boxShadow: 'none',
            }
          }}
        >
          <Iconify 
            icon="eva:share-fill" 
            width={20}
            sx={{
              color: 'text.primary',
              transition: 'color 0.2s',
              '.MuiIconButton-root:hover &': {
                color: 'primary.main'
              }
            }}
          />
        </IconButton>
        <IconButton
          aria-label="cart"
          onClick={() => (window.location.href = '/checkout')}
          sx={{
            color: 'text.primary',
            border: 'none',
            transition: 'color 0.2s',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
              color: 'primary.main',
              border: 'none',
              boxShadow: 'none',
            }
          }}
        >
          <Iconify 
            icon="solar:cart-3-bold" 
            width={20}
            sx={{
              color: 'text.primary',
              transition: 'color 0.2s',
              '.MuiIconButton-root:hover &': {
                color: 'primary.main'
              }
            }}
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
          pt: { xs: 6, sm: 8, md: 12 }
        }}
      >
        {renderProductImages}
        {renderProductInfo}
        {renderWarrantyBenefits}
        {renderTabs}
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
