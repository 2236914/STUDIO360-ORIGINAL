'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import FormControl from '@mui/material/FormControl';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fCurrencyPHPSymbol } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { inventoryApi } from 'src/services/inventoryService';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

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
    images: []
  }
];

// ----------------------------------------------------------------------

export function InventoryDetailsView({ id, additionalProducts = {}, minimal = false }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [publishStatus, setPublishStatus] = useState('Published');
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const [reviewsPage, setReviewsPage] = useState(1);

  // Load product data from database
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productData = await inventoryApi.getProductById(id);
        
        if (!productData) {
          toast.error('Product not found');
          return;
        }

        // Transform database data to match component format
        const transformedProduct = {
          id: productData.id,
          name: productData.name,
          description: productData.description || '',
          subDescription: productData.short_description || '',
          images: productData.images || [],
          coverUrl: productData.cover_image_url || '/assets/images/product/product-placeholder.png',
          price: productData.price || 0,
          priceSale: productData.compare_at_price || 0,
          quantity: productData.stock_quantity || 0,
          sku: productData.sku || '',
          barcode: productData.barcode || '',
          category: productData.category || 'Uncategorized',
          status: productData.status,
          inventoryType: productData.stock_status,
          // Extract from dimensions JSONB field
          colors: productData.dimensions?.colors || [],
          sizes: productData.dimensions?.sizes || [],
          tags: productData.dimensions?.tags || [],
          gender: productData.dimensions?.gender || [],
          theme: productData.dimensions?.theme || '',
          newLabel: productData.dimensions?.newLabel || { enabled: false, content: '' },
          saleLabel: productData.dimensions?.saleLabel || { enabled: false, content: '' },
        };

        setProduct(transformedProduct);
        
        // Set initial size if available
        if (transformedProduct.sizes && transformedProduct.sizes.length > 0) {
          setSelectedSize(transformedProduct.sizes[0]);
        }
        
        // Set page title
        document.title = `${transformedProduct.name} | Inventory - STUDIO360`;
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Event handlers
  const handleBack = useCallback(() => {
    router.push(paths.dashboard.inventory.root);
  }, [router]);

  const handleTabChange = useCallback((event, newValue) => {
    setSelectedTab(newValue);
  }, []);

  const handleQuantityChange = useCallback((delta) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, product?.availableQuantity || 1)));
  }, [product?.availableQuantity]);

  const handleStatusMenuOpen = useCallback((event) => {
    setStatusMenuAnchor(event.currentTarget);
  }, []);

  const handleStatusMenuClose = useCallback(() => {
    setStatusMenuAnchor(null);
  }, []);

  const handleStatusChange = useCallback((status) => {
    setPublishStatus(status);
    setStatusMenuAnchor(null);
  }, []);

  const handleShareMenuOpen = useCallback((event) => {
    setShareMenuAnchor(event.currentTarget);
  }, []);

  const handleShareMenuClose = useCallback(() => {
    setShareMenuAnchor(null);
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

  // Show loading state
  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <Typography variant="body1">Loading product...</Typography>
        </Box>
      </DashboardContent>
    );
  }

  // Show empty state if no product data
  if (!product) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Product Details"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Inventory', href: paths.dashboard.inventory.root },
            { name: 'Details' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Product not found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => router.push(paths.dashboard.inventory.root)}
          >
            Back to Inventory
          </Button>
        </Box>
      </DashboardContent>
    );
  }

  const renderProductImages = (
    <Grid item xs={12} md={6}>
      <Card sx={{ p: 3, boxShadow: 'none', border: 'none', mt: 4 }}>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Box
            component="img"
            src={product.coverUrl || product.images?.[0] || '/assets/images/product/product-placeholder.png'}
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
              borderRadius: 2,
              typography: 'caption'
            }}
          >
            {1}/{product.images.length || 1}
          </Box>
        </Box>
        
        <Stack direction="row" spacing={1}>
          {(product.images || []).slice(0, 5).map((image, index) => (
            <Box
              key={index}
              component="img"
              src={image || '/assets/images/product/product-placeholder.png'}
              alt={`${product.name} thumbnail ${index + 1}`}
              sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: 1,
                border: index === 0 ? '2px solid' : 'none',
                borderColor: index === 0 ? 'primary.main' : 'transparent',
                bgcolor: 'grey.100',
                objectFit: 'cover',
                aspectRatio: '1/1'
              }}
            />
          ))}
        </Stack>
      </Card>
    </Grid>
  );

  const renderProductInfo = (
    <Grid item xs={12} md={6}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack>
            {minimal ? (
              <Box
                sx={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  bgcolor: 'success.lighter',
                  color: 'success.darker',
                  fontWeight: 700,
                  fontSize: 12,
                  mb: 1
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.darker', boxShadow: (theme) => `0 0 0 4px ${theme.palette.success.lighter}` }} />
                In stock, ready to ship
              </Box>
            ) : (
              <>
                <Chip label={product.status} color="success" size="small" sx={{ alignSelf: 'flex-start', mb: 1 }} />
                <Chip label={product.stock} color="info" size="small" sx={{ alignSelf: 'flex-start' }} />
              </>
            )}
          </Stack>
          
          {/* Status Dropdown - hidden in minimal mode */}
          {!minimal && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={publishStatus === 'Published' ? "eva:cloud-upload-fill" : "eva:file-text-fill"} />}
              endIcon={<Iconify icon="eva:chevron-down-fill" />}
              onClick={handleStatusMenuOpen}
              sx={{ 
                bgcolor: 'grey.800',
                color: 'white',
                minWidth: 120,
                '&:hover': { bgcolor: 'grey.700' }
              }}
            >
              {publishStatus}
            </Button>
            <Menu
              anchorEl={statusMenuAnchor}
              open={Boolean(statusMenuAnchor)}
              onClose={handleStatusMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: { mt: 1, minWidth: 140 }
              }}
            >
              <MenuItem onClick={() => handleStatusChange('Published')}>
                <ListItemIcon>
                  <Iconify icon="eva:cloud-upload-fill" width={20} />
                </ListItemIcon>
                <ListItemText primary="Published" />
              </MenuItem>
              <MenuItem onClick={() => handleStatusChange('Draft')}>
                <ListItemIcon>
                  <Iconify icon="eva:file-text-fill" width={20} />
                </ListItemIcon>
                <ListItemText primary="Draft" />
              </MenuItem>
            </Menu>
            <IconButton>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
          )}
        </Stack>

        {/* Product Name & Rating */}
        <Stack spacing={1}>
          <Typography variant="h4">{product.name}</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Rating value={product.rating} readOnly size="small" />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ({product.reviewCount?.toLocaleString() || '0'} reviews)
            </Typography>
          </Stack>
        </Stack>

        {/* Price */}
        <Typography variant="h5" sx={{ color: 'text.primary' }}>
          {fCurrencyPHPSymbol(product.price, '₱', 2, '.', ',')}
        </Typography>

        {/* Description */}
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {product.description}
        </Typography>

        <Divider />

        {/* Color Selection */}
        <Stack spacing={2}>
          <Typography variant="subtitle1">Color</Typography>
          <Stack direction="row" spacing={1}>
            {(product.colors || []).map((color, index) => (
              <Box
                key={index}
                onClick={() => setSelectedColor(index)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: color,
                  cursor: 'pointer',
                  border: selectedColor === index ? 3 : 1,
                  borderColor: selectedColor === index ? 'primary.main' : 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {selectedColor === index && (
                  <Iconify icon="eva:checkmark-fill" sx={{ color: 'common.white', width: 16 }} />
                )}
              </Box>
            ))}
          </Stack>
        </Stack>

        {/* Size Selection */}
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1">Size</Typography>
            <Typography variant="body2" sx={{ color: 'primary.main', cursor: 'pointer' }}>
              Size chart
            </Typography>
          </Stack>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {(product.sizes || []).map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Quantity */}
        <Stack spacing={2}>
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

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Iconify icon="eva:shopping-cart-outline" />}
            sx={{ flex: 1 }}
          >
            Add to cart
          </Button>
          <Button variant="contained" size="large" sx={{ flex: 1 }}>
            Buy now
          </Button>
        </Stack>


        {/* Removed View Full Details button in store minimal view */}
      </Stack>
    </Grid>
  );

  const renderWarrantyBenefits = (
    <Grid item xs={12}>
      <Stack direction="row" spacing={4} sx={{ textAlign: 'center', py: 4 }}>
        <Stack flex={1} alignItems="center" spacing={1}>
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
            Chocolate bar candy canes ice cream toffee cookie halvah.
          </Typography>
        </Stack>

        <Stack flex={1} alignItems="center" spacing={1}>
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
            Marshmallow biscuit donut dragée fruitcake wafer.
          </Typography>
        </Stack>

        <Stack flex={1} alignItems="center" spacing={1}>
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
            Cotton candy gingerbread cake I love sugar sweet.
          </Typography>
        </Stack>
      </Stack>
    </Grid>
  );

  const renderTabs = (
    <Grid item xs={12}>
      <Card>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ px: 3 }}>
          <Tab label="Description" />
          <Tab label={`Reviews (${product.reviewCount?.toLocaleString() || '0'})`} />
        </Tabs>
        
        <Divider />
        
        <Box sx={{ p: 3 }}>
          {selectedTab === 0 && (
            <Stack spacing={4}>
              {/* Specifications */}
              <Stack spacing={2}>
                <Typography variant="h6">Specifications</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Category
                    </Typography>
                    <Typography variant="body2">{product.specifications?.category || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Manufacturer
                    </Typography>
                    <Typography variant="body2">{product.specifications?.manufacturer || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Serial number
                    </Typography>
                    <Typography variant="body2">{product.specifications?.serialNumber || 'N/A'}</Typography>
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

              {/* Delivery and Returns */}
              <Stack spacing={2}>
                <Typography variant="h6">Delivery and returns</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {product.deliveryReturns.note}
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 'bold' }}>Standard delivered 4-5 Business Days</Box>
                  </Typography>
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 'bold' }}>Express delivered 2-4 Business Days</Box>
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {product.deliveryReturns.note}
                </Typography>
              </Stack>
            </Stack>
          )}
          
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 3, color: 'text.primary' }}>
                Recent Reviews
              </Typography>

              <Stack spacing={3}>
                {PRODUCT_REVIEWS.slice((reviewsPage - 1) * 3, reviewsPage * 3).map((review, index) => (
                  <Card
                    key={review.id}
                    sx={{ p: 3, boxShadow: 'none', border: 'none' }}
                  >
                    <Stack spacing={3}>
                      {/* Review Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack spacing={1}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {review.isAnonymous ? review.customerName : review.customerName}
                          </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {review.product}
                          </Typography>
                        </Stack>
                        <Stack alignItems="flex-end" spacing={1}>
                          <Rating value={review.rating} readOnly size="small" />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {review.date}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Review Comment */}
                      <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                        &ldquo;{review.comment}&rdquo;
                      </Typography>

                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            Photos from this review:
            </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {review.images.map((image, imgIndex) => (
                              <Box
                                key={imgIndex}
                                sx={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                    transition: 'transform 0.2s ease'
                                  }
                                }}
                              >
                                <img
                                  src={image}
                                  alt={`Review ${imgIndex + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>

              {/* Pagination */}
              {PRODUCT_REVIEWS.length > 3 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={Math.ceil(PRODUCT_REVIEWS.length / 3)}
                    page={reviewsPage}
                    onChange={(event, value) => setReviewsPage(value)}
                    color="primary"
                    sx={{
                      '& .MuiPagination-ul': { justifyContent: 'center' },
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Card>
    </Grid>
  );

  if (!mounted) {
    return null;
  }

  return (
    minimal ? (
      <Box sx={{ position: 'relative', pb: 2 }}>
        {/* Top Controls */}
        <Box sx={{ position: 'absolute', top: 20, left: 30, zIndex: 10 }}>
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
                // Icon color handled in startIcon
              }
            }}
          >
            Back
          </Button>
        </Box>

        <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 20, right: 40, zIndex: 10 }}>
          <IconButton
            aria-label="search"
            onClick={() => { window.location.href = '/search'; }}
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
            onClick={() => { window.location.href = '/checkout'; }}
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
          PaperProps={{ sx: { mt: 1, minWidth: 220 } }}
        >
          <MenuItem onClick={handleShareNative}>
            <ListItemIcon>
              <Iconify icon="eva:share-fill" width={20} />
            </ListItemIcon>
            <ListItemText primary="Share" secondary="System share or copy link" />
          </MenuItem>
          <MenuItem onClick={handleShareFacebook}>
            <ListItemIcon>
              <Iconify icon="eva:facebook-fill" width={20} />
            </ListItemIcon>
            <ListItemText primary="Facebook" />
          </MenuItem>
          <MenuItem onClick={handleShareInstagram}>
            <ListItemIcon>
              <Iconify icon="mdi:instagram" width={20} />
            </ListItemIcon>
            <ListItemText primary="Instagram" secondary="Copy link to share" />
          </MenuItem>
        </Menu>

        {/* Announcement Banner */}
        <Box
          sx={{
            bgcolor: 'primary.lighter',
            color: 'primary.darker',
            py: 1.25,
            px: { xs: 2, md: 3 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Iconify icon="solar:box-bold" width={18} />
          <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center' }}>
            Spend ₱1,500 and get FREE tracked nationwide shipping!
          </Typography>
        </Box>

        {/* Page Content */}
        <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
          <Grid container spacing={3}>
            {renderProductImages}
            {renderProductInfo}
            {renderWarrantyBenefits}
            {renderTabs}
          </Grid>
        </Box>
      </Box>
    ) : (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Product Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Inventory', href: paths.dashboard.inventory.root },
          { name: product.name },
        ]}
        action={
          <Button
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <Grid container spacing={3}>
        {renderProductImages}
        {renderProductInfo}
        {renderWarrantyBenefits}
        {renderTabs}
      </Grid>
    </DashboardContent>
    )
  );
}
