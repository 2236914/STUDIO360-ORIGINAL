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
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'src/routes/hooks';
import { m } from 'framer-motion';

import { varFade } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { AnnouncementBanner } from 'src/components/announcement-banner';
import { StoreHeader } from 'src/components/store-header';
import { ChatWidget } from 'src/components/chat-widget/chat-widget';
import { toast } from 'src/components/snackbar';
import { useCheckoutContext } from 'src/sections/checkout/context';
import { CheckoutProvider } from 'src/sections/checkout/context';

// ----------------------------------------------------------------------

// Mock product data - in real app this would come from API
const MOCK_PRODUCT = {
  id: 1,
  name: 'Love Yourself First Flower Bouquet Vinyl Sticker',
  price: 'P300.00 PHP',
  priceValue: 300,
  originalPrice: null,
  category: 'Stickers',
  theme: 'Cute',
  isNew: true,
  description: 'Beautiful vinyl sticker featuring a delicate flower bouquet with the empowering message "Love Yourself First". Perfect for laptops, water bottles, notebooks, and more. Made with high-quality vinyl that\'s weather-resistant and long-lasting.',
  features: [
    'High-quality vinyl material',
    'Weather-resistant',
    'Easy to apply and remove',
    'Perfect for smooth surfaces',
    'Handcrafted with care'
  ],
  dimensions: '3" x 2.5"',
  material: 'Premium Vinyl',
  images: [
    { id: 1, src: '/placeholder.svg', alt: 'Product view 1' },
    { id: 2, src: '/placeholder.svg', alt: 'Product view 2' },
    { id: 3, src: '/placeholder.svg', alt: 'Product view 3' }
  ]
};

// Product Image Gallery Component
function ProductImageGallery({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <Stack spacing={2}>
      {/* Main Image */}
      <Box
        sx={{
          width: '100%',
          height: { xs: 300, md: 400 },
          bgcolor: '#E5E5E5',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Iconify
          icon="solar:gallery-minimalistic-bold"
          sx={{
            fontSize: 64,
            color: '#A0A0A0'
          }}
        />
      </Box>

      {/* Thumbnail Images */}
      <Stack direction="row" spacing={1} justifyContent="center">
        {product.images.map((image, index) => (
          <Box
            key={image.id}
            sx={{
              width: 60,
              height: 60,
              bgcolor: '#E5E5E5',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: selectedImage === index ? '2px solid' : '1px solid',
              borderColor: selectedImage === index ? 'primary.main' : 'divider',
              '&:hover': {
                borderColor: 'primary.main'
              }
            }}
            onClick={() => setSelectedImage(index)}
          >
            <Iconify
              icon="solar:gallery-minimalistic-bold"
              sx={{
                fontSize: 20,
                color: '#A0A0A0'
              }}
            />
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}

// Product Info Component
function ProductInfo({ product, storeId, productName }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const shareOpen = Boolean(shareAnchorEl);

  // Get checkout context for cart functionality
  let checkout = null;
  try {
    checkout = useCheckoutContext();
  } catch (error) {
    // Checkout context not available, will use fallback
    console.log('Checkout context not available');
  }

  const handleAddToCart = () => {
    if (checkout) {
      // Use checkout context to add to cart
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.priceValue,
        quantity: quantity,
        colors: [product.theme], // Using theme as color for now
        coverUrl: '/placeholder.svg',
        available: 100 // Mock availability
      };
      
      checkout.onAddToCart(cartItem);
      toast.success(`${product.name} added to cart!`);
    } else {
      // Fallback: just show success message
      console.log('Added to cart:', { product: product.id, quantity });
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleBuyNow = () => {
    // Add to cart first, then navigate to checkout
    handleAddToCart();
    
    // Navigate to checkout page
    setTimeout(() => {
      router.push(`/stores/${storeId}/checkout`);
    }, 500); // Small delay to show the toast message
  };

  const handleShareClick = (event) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleShare = (platform) => {
    const productUrl = `${window.location.origin}/stores/${storeId}/${productName}`;
    const shareText = `Check out this amazing product: ${product.name}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
        navigator.clipboard.writeText(`${shareText}\n${productUrl}`);
        alert('Product link copied to clipboard! You can paste it in your Instagram story or post.');
        handleShareClose();
        return;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${productUrl}`)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(productUrl);
        alert('Product link copied to clipboard!');
        handleShareClose();
        return;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    handleShareClose();
  };

  return (
    <Stack spacing={3}>
      {/* Product Title and Tags */}
      <Stack spacing={2}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack spacing={2} sx={{ flex: 1 }}>
            {product.isNew && (
              <Chip
                label="NEW"
                size="small"
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  alignSelf: 'flex-start'
                }}
              />
            )}
            
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.2
              }}
            >
              {product.name}
            </Typography>
          </Stack>
          
          {/* Share Button */}
          <IconButton
            onClick={handleShareClick}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'primary.main'
              }
            }}
            aria-label="Share product"
          >
            <Iconify icon="eva:share-fill" />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {product.category}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            •
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {product.theme}
          </Typography>
        </Stack>
      </Stack>

      {/* Price */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {product.price}
        </Typography>
        {product.originalPrice && (
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary', 
              textDecoration: 'line-through'
            }}
          >
            {product.originalPrice}
          </Typography>
        )}
      </Stack>

      {/* Description */}
      <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
        {product.description}
      </Typography>

      {/* Features */}
      <Stack spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Features:
        </Typography>
        {product.features.map((feature, index) => (
          <Stack key={index} direction="row" alignItems="center" spacing={1}>
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main', fontSize: 16 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {feature}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {/* Product Details */}
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Product Details:
        </Typography>
        <Stack direction="row" spacing={4}>
          <Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Dimensions:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {product.dimensions}
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Material:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {product.material}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Divider />

      {/* Quantity and Actions */}
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
            Quantity:
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton 
              size="small"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              sx={{ 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 1,
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.lighter'
                }
              }}
            >
              <Iconify icon="eva:minus-fill" />
            </IconButton>
            <Typography variant="body1" sx={{ minWidth: 40, textAlign: 'center' }}>
              {quantity}
            </Typography>
            <IconButton 
              size="small"
              onClick={() => setQuantity(quantity + 1)}
              sx={{ 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 1,
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.lighter'
                }
              }}
            >
              <Iconify icon="eva:plus-fill" />
            </IconButton>
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="outlined"
            size="large"
            color="primary"
            startIcon={<Iconify icon="eva:shopping-cart-fill" />}
            onClick={handleAddToCart}
            sx={{
              flex: 1,
              py: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Add to Cart
          </Button>
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={handleBuyNow}
            sx={{
              flex: 1,
              py: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: (theme) => theme.customShadows?.primary || theme.shadows[4],
              '&:hover': {
                boxShadow: 'none'
              }
            }}
          >
            Buy Now
          </Button>
        </Stack>
      </Stack>


      {/* Share Menu */}
      <Menu
        anchorEl={shareAnchorEl}
        open={shareOpen}
        onClose={handleShareClose}
        PaperProps={{
          sx: {
            minWidth: 200,
            borderRadius: 2,
            boxShadow: (theme) => theme.shadows[8]
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleShare('facebook')}>
          <ListItemIcon>
            <Iconify icon="eva:facebook-fill" sx={{ color: '#1877F2' }} />
          </ListItemIcon>
          <ListItemText primary="Facebook" />
        </MenuItem>
        
        <MenuItem onClick={() => handleShare('instagram')}>
          <ListItemIcon>
            <Iconify icon="eva:instagram-fill" sx={{ color: '#E4405F' }} />
          </ListItemIcon>
          <ListItemText primary="Instagram" />
        </MenuItem>
        
        <MenuItem onClick={() => handleShare('twitter')}>
          <ListItemIcon>
            <Iconify icon="eva:twitter-fill" sx={{ color: '#1DA1F2' }} />
          </ListItemIcon>
          <ListItemText primary="Twitter" />
        </MenuItem>
        
        <MenuItem onClick={() => handleShare('whatsapp')}>
          <ListItemIcon>
            <Iconify icon="eva:message-circle-fill" sx={{ color: '#25D366' }} />
          </ListItemIcon>
          <ListItemText primary="WhatsApp" />
        </MenuItem>
        
        <MenuItem onClick={() => handleShare('copy')}>
          <ListItemIcon>
            <Iconify icon="eva:copy-fill" />
          </ListItemIcon>
          <ListItemText primary="Copy Link" />
        </MenuItem>
      </Menu>
    </Stack>
  );
}

// Related Products Component
function RelatedProducts({ storeId }) {
  const router = useRouter();
  
  const relatedProducts = [
    {
      id: 2,
      name: 'Keep Moving Forward Vinyl Sticker',
      price: 'P300.00 PHP',
      category: 'Stickers',
      theme: 'Motivation'
    },
    {
      id: 3,
      name: 'Life is Tough But So Am I Vinyl Sticker',
      price: 'P300.00 PHP',
      category: 'Stickers',
      theme: 'Relax'
    },
    {
      id: 4,
      name: 'School Essentials Self Care Bundle Deal',
      price: 'P700.00 PHP',
      originalPrice: 'P800.00 PHP',
      category: 'Bundles',
      theme: 'Cute'
    }
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', textAlign: 'center' }}>
            You might also like
          </Typography>
          
          <Grid container spacing={3}>
            {relatedProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <m.div {...varFade().inUp}>
                  <Card 
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none',
                      borderRadius: 3,
                      p: 1.5,
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.3s ease-in-out',
                        boxShadow: (theme) => theme.shadows[3]
                      }
                    }}
                    onClick={() => {
                      const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^[-]+|[-]+$/g, '');
                      router.push(`/stores/${storeId}/${slug}`);
                    }}
                  >
                    {/* Product Image */}
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
                        bgcolor: '#E5E5E5',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        mb: 1.5,
                        position: 'relative'
                      }}
                    >
                      <Iconify
                        icon="solar:gallery-minimalistic-bold"
                        sx={{
                          fontSize: 32,
                          color: '#A0A0A0'
                        }}
                      />
                    </Box>

                    {/* Product Info */}
                    <Stack spacing={1} sx={{ px: 1.5, py: 1 }}>
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
                          overflow: 'hidden'
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
        </Stack>
      </Container>
    </Box>
  );
}

// Footer Component
function StoreFooter() {
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

  return (
    <Box sx={{ bgcolor: 'background.paper', py: 6, borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Column 1: Logo */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Logo
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                Handcrafted jewelry and accessories for the modern individual.
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
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  About Us
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Shipping & Returns
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  FAQ
                </Typography>
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
                Terms of Service
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Privacy Policy
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

// Inner component that uses checkout context
function ProductDetailContent({ params }) {
  const theme = useTheme();
  const router = useRouter();
  const { storeId, productName } = use(params);

  // Set page title
  useEffect(() => {
    document.title = `${MOCK_PRODUCT.name} | Kitsch Studio | STUDIO360`;
  }, [storeId, productName]);

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Header */}
      <StoreHeader />
      
      {/* Back to Products */}
      <Box sx={{ bgcolor: 'background.paper', py: 2 }}>
        <Container maxWidth="lg">
          <Button
            variant="text"
            color="inherit"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => router.push(`/stores/${storeId}/products`)}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              px: 0,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            Back to Products
          </Button>
        </Container>
      </Box>
      
      {/* Main Product Section */}
      <Box sx={{ py: { xs: 1, md: 2 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Product Images */}
            <Grid item xs={12} md={6}>
              <m.div {...varFade().inLeft}>
                <ProductImageGallery product={MOCK_PRODUCT} />
              </m.div>
            </Grid>

            {/* Product Info */}
            <Grid item xs={12} md={6}>
              <m.div {...varFade().inRight}>
                <ProductInfo product={MOCK_PRODUCT} storeId={storeId} productName={productName} />
              </m.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Related Products */}
      <RelatedProducts storeId={storeId} />
      
      {/* Footer */}
      <StoreFooter />

      {/* Chat Widget */}
      <ChatWidget storeName="Kitsch Studio" />
    </Box>
  );
}

// Main component wrapped with CheckoutProvider
export default function ProductDetailPage({ params }) {
  return (
    <CheckoutProvider>
      <ProductDetailContent params={params} />
    </CheckoutProvider>
  );
}
