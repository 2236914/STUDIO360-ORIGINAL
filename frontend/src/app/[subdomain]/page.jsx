'use client';

import { m } from 'framer-motion';
import { use, useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Backdrop from '@mui/material/Backdrop';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { styled , useTheme, keyframes } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { varFade } from 'src/components/animate';
import { Iconify } from 'src/components/iconify';
import { StoreHeader } from 'src/components/store-header';
import { ChatWidget } from 'src/components/chat-widget/chat-widget';
import { HydrationBoundary } from 'src/components/hydration-boundary';
import { AnnouncementBanner } from 'src/components/announcement-banner';
import { StoreFooter as ReusableStoreFooter } from 'src/components/store-footer';
import WelcomePopup from 'src/components/welcome-popup';

import { storefrontApi } from 'src/utils/api/storefront';
import { isStoreSubdomain } from 'src/utils/subdomain';

// ----------------------------------------------------------------------

// Create smooth infinite scroll animation for featured products
const smoothInfiniteScroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const InfiniteScrollContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '200%', // Double width to create seamless loop
  animation: `${smoothInfiniteScroll} 15s linear infinite`, // Much faster animation
  // Removed hover pause - animation continues even on hover
}));

const ScrollItem = styled(Box)(({ theme }) => ({
  width: '15%', // Even tighter spacing
  flexShrink: 0,
  padding: theme.spacing(0, 0.05), // Almost no spacing between items
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Product Quick View Modal Component
function ProductQuickViewModal({ open, onClose, product }) {
  if (!product) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', md: '80%' },
          maxWidth: 800,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          outline: 'none',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>

          <Grid container>
            {/* Left Panel - Product Image */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: { xs: 300, md: 400 },
                  width: '100%',
                  borderRadius: '8px 0 0 8px',
                  bgcolor: '#E5E5E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {(product.cover_image_url || product.coverUrl || product.images?.[0] || product.image_url || product.cover_url) ? (
                  <Box
                    component="img"
                    src={product.cover_image_url || product.coverUrl || product.images?.[0] || product.image_url || product.cover_url}
                    alt={product.name}
                    sx={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Fallback placeholder for quick view */}
                <Box
                  sx={{
                    display: (product.cover_image_url || product.coverUrl || product.images?.[0] || product.image_url || product.cover_url) ? 'none' : 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    bgcolor: 'background.neutral',
                    color: 'text.secondary'
                  }}
                >
                  <Iconify 
                    icon="eva:image-fill" 
                    sx={{ fontSize: 64, mb: 2 }} 
                  />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      textAlign: 'center',
                      px: 2
                    }}
                  >
                    {product.name}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Right Panel - Product Details */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 4 }}>
                <Stack spacing={3}>
                  {/* Product Title */}
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {product.name}
                  </Typography>

                  {/* Product Description */}
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Product description goes here. This is a placeholder for the detailed product description that would explain the features, materials, and craftsmanship of this beautiful piece.
                  </Typography>

                  {/* Price */}
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {product.price}
                  </Typography>

                  {/* Add to Cart Button */}
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Iconify icon="eva:shopping-cart-fill" />}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      py: 2,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    Add to Cart
                  </Button>

                  {/* Action Icons */}
                  <Stack direction="row" spacing={2}>
                    <IconButton sx={{ color: 'text.secondary' }}>
                      <Iconify icon="eva:share-fill" />
                    </IconButton>
                    <IconButton sx={{ color: 'text.secondary' }}>
                      <Iconify icon="eva:heart-fill" />
                    </IconButton>
                    <IconButton sx={{ color: 'text.secondary' }}>
                      <Iconify icon="eva:email-fill" />
                    </IconButton>
                  </Stack>

                  {/* View Full Details Link */}
                  <Box sx={{ textAlign: 'right' }}>
                    <Link
                      href="#"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      View full details
                    </Link>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
}

// Hero Section Component
function HeroSection({ storeId }) {
  const router = useRouter();
  const [heroData, setHeroData] = useState({
    title: 'Welcome to our store!',
    backgroundImage: null
  });
  const [loading, setLoading] = useState(true);

  // Fetch hero section data
  useEffect(() => {
    async function fetchHeroData() {
      try {
        setLoading(true);
        // Fetch homepage data from public API
        const response = await storefrontApi.getHomepage(storeId);
        
        if (response.success && response.data.heroSection) {
          const hero = response.data.heroSection;
          setHeroData({
            title: hero.title || 'Welcome to our store!',
            backgroundImage: hero.background_image_url || null
          });
        }
      } catch (err) {
        console.log('Hero section: using default data', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHeroData();
  }, [storeId]);

  const handleShopNow = () => {
    // Will navigate to products page for the current store
    router.push(`/${storeId}/products`);
  };

  return (
    <Box sx={{ position: 'relative', bgcolor: 'background.paper' }}>
      {/* Hero Image */}
      <Box
        sx={{
          // inset from viewport edges to match screenshot spacing
          mx: { xs: 2, md: 4 },
          width: { xs: 'calc(100% - 32px)', md: 'calc(100% - 64px)' },
          height: { xs: 340, sm: 380, md: 520 },
          bgcolor: '#F8F9FA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          // Round all four corners
          borderRadius: 5,
          boxSizing: 'border-box',
          mt: 2,
          // subtle drop shadow to match the elevated card look
          boxShadow: '0 6px 24px rgba(16,24,40,0.06)'
        }}
      >
        {/* Background Image or Pattern */}
        {heroData.backgroundImage ? (
          <Box
            component="img"
            src={heroData.backgroundImage}
            alt="Hero"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.9
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, #FFE5E5 0%, #E5F3FF 100%)',
              opacity: 0.3
            }}
          />
        )}

        {/* Hero Content */}
        {/* keep content limited to container but nudge within the rounded hero */}
        <Container maxWidth="lg" disableGutters sx={{ height: '100%', px: { xs: 2, md: 3 } }}>
          <Box sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: { xs: 'center', md: 'flex-end' }, pb: { xs: 4, md: 6 } }}>
            {/* Responsive layout: stack on xs, horizontal on md+ */}
            <Box sx={{ flex: 1, pr: { xs: 0, md: 3 }, pl: { xs: 0, md: 0 } }}>
              <Stack sx={{ height: '100%', justifyContent: { xs: 'center', md: 'flex-end' }, py: { xs: 3, md: 0 }, pt: { xs: 4, sm: 5, md: 0 } }}>
                <m.div {...varFade().inUp}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.5rem' },
                      maxWidth: { xs: '100%', sm: 520, md: 500 },
                      lineHeight: 1.2,
                      textAlign: 'left'
                    }}
                  >
                    {heroData.title}
                  </Typography>
                </m.div>

                {/* Mobile: full-width pill button under text */}
                <Box sx={{ display: { xs: 'block', md: 'none' }, mt: { xs: 3, sm: 4 } }}>
                  <m.div {...varFade().inUp}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleShopNow}
                      endIcon={<Iconify icon="eva:arrow-right-fill" />}
                      sx={{
                        bgcolor: 'white',
                        color: 'text.primary',
                        width: '100%',
                          py: { xs: 2.5, sm: 2.8 },
                        borderRadius: 10,
                        fontSize: '1rem',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 6px 18px rgba(16,24,40,0.06)',
                          mb: { xs: 4, sm: 5 }
                      }}
                    >
                      Shop Now
                    </Button>
                  </m.div>
                </Box>
              </Stack>
            </Box>

            {/* Desktop: buttons aligned right */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
              <m.div {...varFade().inUp}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleShopNow}
                  endIcon={<Iconify icon="eva:arrow-right-fill" />}
                  sx={{
                    bgcolor: 'white',
                    color: 'text.primary',
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'grey.50',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  Shop Now
                </Button>
              </m.div>

              {/* Chat button removed as requested */}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

// Featured Products Section
function FeaturedProductsSection({ storeId }) {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const scrollRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef({ startX: 0, startLeft: 0 });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from database
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await storefrontApi.getProducts(storeId);
        
        if (response.success) {
          setProducts(response.data || []);
        } else {
          setError('Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
          setError('Backend server is not running. Please start the backend server.');
        } else {
          setError('Failed to load products');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [storeId]);

  // Duplicate the products multiple times for seamless infinite scroll
  const duplicatedProducts = [...products, ...products, ...products];

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  // Enhanced auto-scroll with smooth continuous animation
  useEffect(() => {
    if (!autoScroll || !products.length) return;
    const el = scrollRef.current;
    if (!el) return;
    
    const scrollSpeed = 1.5; // pixels per frame
    let rafId;
    let isActive = true;
    const singleSetWidth = el.scrollWidth / 3; // Since we tripled the products
    
    const scrollFrame = () => {
      if (!isActive || !autoScroll || dragging) {
        return;
      }
      
      // Pause on hover
      if (el.matches(':hover')) {
        rafId = requestAnimationFrame(scrollFrame);
        return;
      }
      
      el.scrollLeft += scrollSpeed;
      
      // Reset to create seamless loop
      if (el.scrollLeft >= singleSetWidth) {
        el.scrollLeft = 0;
      }
      
      rafId = requestAnimationFrame(scrollFrame);
    };
    
    rafId = requestAnimationFrame(scrollFrame);
    
    return () => {
      isActive = false;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [autoScroll, products.length]);

  const onPointerDown = (clientX) => {
    const el = scrollRef.current; 
    if (!el) return;
    setDragging(true);
    dragState.current.startX = clientX;
    dragState.current.startLeft = el.scrollLeft;
  };
  
  const onPointerMove = (clientX) => {
    if (!dragging) return; 
    const el = scrollRef.current; 
    if (!el) return;
    const dx = clientX - dragState.current.startX;
    el.scrollLeft = dragState.current.startLeft - dx;
  };
  
  const endDrag = () => {
    setDragging(false);
  };

  return (
    <m.div {...varFade().inUp}>
      <Box sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Stack spacing={6}>
            {/* Section Header */}
            <Stack spacing={2} alignItems="center" textAlign="center">
              <m.div {...varFade().inUp}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}
                >
                  Featured Products
                </Typography>
              </m.div>
            </Stack>

          {/* Horizontal Scroll Products */}
          <Box sx={{ position: 'relative', width: '100%' }}>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  Loading products...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'error.main', mb: 2 }}>
                  {error}
                </Typography>
              </Box>
            ) : products.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  No featured products available
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Products will be displayed here when added to the store.
                </Typography>
              </Box>
            ) : (
              <Box
              ref={scrollRef}
              role="region"
              aria-label="Featured products scroller"
              onMouseDown={(e) => onPointerDown(e.clientX)}
              onMouseMove={(e) => onPointerMove(e.clientX)}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={(e) => onPointerDown(e.touches[0]?.clientX || 0)}
              onTouchMove={(e) => onPointerMove(e.touches[0]?.clientX || 0)}
              onTouchEnd={endDrag}
              onWheel={(e) => {
                // Let wheel scroll work naturally
              }}
              sx={{
                overflowX: 'auto',
                overflowY: 'hidden',
                whiteSpace: 'nowrap',
                display: 'flex',
                gap: 3,
                height: '500px',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                // hide scrollbar but keep scrolling enabled
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' }
              }}
            >
              {duplicatedProducts.map((product, index) => (
                <m.div
                  key={`${product.id}-${index}`}
                  {...varFade().inUp}
                  style={{ flex: '0 0 auto', width: 320 }}
                >
                    <Card
                      sx={{
                        border: 'none',
                        boxShadow: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 2,
                        cursor: 'pointer',
                        width: '100%',
                        height: 420,
                        '&:hover': { 
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                        },
                        '& .prod-eye': { opacity: 0, transform: 'translateY(-6px)' },
                        '& .prod-cart': { opacity: 0, transform: 'translateY(6px)' },
                        '&:hover .prod-eye': { opacity: 1, transform: 'translateY(0)' },
                        '&:hover .prod-cart': { opacity: 1, transform: 'translateY(0)' },
                        transition: 'all 0.3s ease-in-out',
                      }}
                      onClick={() => handleQuickView(product)}
                    >
                      {/* NEW Tag */}
                      {product.is_new && (
                        <Chip
                          label="NEW"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            zIndex: 3,
                            bgcolor: 'success.main',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      )}

                      {/* Product Image Container */}
                      <Box
                        sx={{
                          width: '100%',
                          aspectRatio: '1', // Square image placeholder
                          bgcolor: '#E5E5E5',
                          borderRadius: 0,
                          overflow: 'hidden',
                          mb: 1, // More margin for better spacing
                          position: 'relative',
                        }}
                      >
                        {/* Product Image */}
                        {(product.cover_image_url || product.images?.[0] || product.image_url || product.cover_url) ? (
                          <Box
                            component="img"
                            src={product.cover_image_url || product.images?.[0] || product.image_url || product.cover_url}
                            alt={product.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        {/* Fallback placeholder for products */}
                        <Box
                          sx={{
                            display: (product.cover_image_url || product.images?.[0] || product.image_url || product.cover_url) ? 'none' : 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            bgcolor: 'background.neutral',
                            color: 'text.secondary'
                          }}
                        >
                          <Iconify 
                            icon="eva:image-fill" 
                            sx={{ fontSize: 32, mb: 1 }} 
                          />
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontWeight: 600,
                              textAlign: 'center',
                              px: 2
                            }}
                          >
                            {product.name}
                          </Typography>
                        </Box>

                        {/* Eye (top-right) */}
                        <IconButton
                          className="prod-eye"
                          onClick={(e) => { e.stopPropagation(); handleQuickView(product); }}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'white',
                            boxShadow: '0 6px 12px rgba(0,0,0,0.16)',
                            opacity: 0,
                            transform: 'translateY(-6px)',
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: 'primary.main', color: 'white' },
                          }}
                        >
                          <Iconify icon="eva:eye-fill" width={18} />
                          </IconButton>
                        {/* Cart (bottom-right) */}
                          <IconButton
                          className="prod-cart"
                          onClick={(e) => { e.stopPropagation(); /* add to cart */ }}
                            sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                              bgcolor: 'white',
                            boxShadow: '0 6px 12px rgba(0,0,0,0.16)',
                            opacity: 0,
                            transform: 'translateY(6px)',
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: 'primary.main', color: 'white' },
                          }}
                        >
                          <Iconify icon="eva:shopping-cart-fill" width={18} />
                          </IconButton>
                      </Box>

                      {/* Product Info */}
                      <Stack spacing={1} sx={{ p: 2 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: 'text.primary',
                            fontSize: '0.9rem',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {product.name}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1rem' }}>
                          ₱{parseFloat(product.price || 0).toFixed(2)}
                        </Typography>
                      </Stack>
                    </Card>
                </m.div>
              ))}
              
              {/* Optional: Add gradient overlays for better visual effect */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to right, rgba(255,255,255,0.8) 0%, transparent 10%, transparent 90%, rgba(255,255,255,0.8) 100%)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
            </Box>
            )}
          </Box>
        </Stack>
      </Container>

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        product={quickViewProduct}
      />
    </Box>
    </m.div>
  );
}

// Promotional Section
function PromotionalSection({ storeId }) {
  const [inView, setInView] = useState(false);
  const [splitFeature, setSplitFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  // Fetch split feature data from database
  useEffect(() => {
    async function fetchSplitFeature() {
      try {
        setLoading(true);
        const response = await storefrontApi.getSplitFeature(storeId);
        
        if (response.success && response.data) {
          setSplitFeature(response.data);
        }
      } catch (err) {
        console.error('Error fetching split feature:', err);
      } finally {
        setLoading(false);
      }
    }

    if (storeId) {
      fetchSplitFeature();
    }
  }, [storeId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  // Only hide section if loading is complete AND no data exists
  if (!loading && (!splitFeature || (!splitFeature.title && !splitFeature.image_url && !splitFeature.description))) {
    return null;
  }

  // Show loading skeleton while fetching data
  if (loading) {
    return (
      <Box ref={ref}>
        <Box sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Box sx={{ width: '100%', height: '200px', bgcolor: 'background.neutral', borderRadius: 2 }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ width: '100%', aspectRatio: '1', bgcolor: 'background.neutral', borderRadius: 2 }} />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box ref={ref}>
      <m.div 
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            {/* Left Side - Text Content */}
            <Grid item xs={12} md={6}>
              <m.div {...varFade().inUp}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                    lineHeight: 1.2,
                    mb: 3
                  }}
                >
                  {splitFeature?.title || ''}
                </Typography>
                {splitFeature?.description && (
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      lineHeight: 1.8
                    }}
                  >
                    {splitFeature.description}
                  </Typography>
                )}
              </m.div>
            </Grid>

          {/* Right Side - Image */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '1',
                bgcolor: '#E5E5E5',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {splitFeature?.image_url ? (
                <Box
                  component="img"
                  src={splitFeature.image_url}
                  alt={splitFeature.title || 'Feature'}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Iconify
                  icon="solar:gallery-minimalistic-bold"
                  sx={{
                    fontSize: 80,
                    color: '#A0A0A0'
                  }}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
    </m.div>
    </Box>
  );
}


// Discount Offer Section
function DiscountOfferSection({ storeId }) {
  const [email, setEmail] = useState('');
  const [couponRevealed, setCouponRevealed] = useState(false);
  const [validation, setValidation] = useState(null); // { is_valid, reason }
  const [inView, setInView] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  // Fetch coupon data from database
  useEffect(() => {
    async function fetchCoupon() {
      try {
        setLoading(true);
        let payload = null;
        const direct = await storefrontApi.getCoupon(storeId);
        if (direct?.success && direct.data) {
          payload = direct.data;
        } else {
          // Fallback: read from homepage aggregate in case direct coupon is not set up yet
          try {
            const home = await storefrontApi.getHomepage(storeId);
            if (home?.success && home.data?.coupon) {
              payload = home.data.coupon;
            }
          } catch (_) {}
        }
        if (payload) setCouponData(payload);
      } catch (err) {
        console.error('Error fetching coupon:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCoupon();
  }, [storeId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const handleRevealCoupon = async () => {
    if (!email.trim()) return;
    setCouponRevealed(true);
    try {
      const code = (couponData?.button_text || '').trim();
      if (code) {
        const resp = await storefrontApi.validateVoucher(storeId, code, 0);
        const payload = resp?.data || resp;
        setValidation(payload);
        if (payload?.is_valid) {
          try { sessionStorage.setItem('storefront_voucher_code', code); } catch (_) {}
        }
      }
    } catch (_) {
      setValidation({ is_valid: false, reason: 'network_error' });
    }
  };

  const handleCopyCoupon = () => {
    const couponCode = couponData?.button_text || 'WELCOMEBUN';
    navigator.clipboard.writeText(couponCode);
    // You could add a toast notification here
  };

  // Don't render if disabled or no data
  if (!loading && (!couponData || !couponData.enabled)) {
    return null;
  }

  return (
    <Box ref={ref}>
      <m.div 
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Box sx={{ bgcolor: '#E3F2FD', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <m.div {...varFade().inUp}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                {couponData?.headline || 'Get 10% off your 1st order!'}
              </Typography>
            </m.div>

          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400
            }}
          >
            {couponData?.subtext || 'Reveal coupon code by entering your email.'}
          </Typography>

          {!couponRevealed ? (
            <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
              <TextField
                placeholder="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 2
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleRevealCoupon}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  px: 4,
                  py: 2,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  minWidth: 160,
                  height: '56px',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                Reveal coupon
              </Button>
            </Stack>
          ) : (
            <Stack spacing={3} alignItems="center">
              {/* Coupon Code Display */}
              <Box
                sx={{
                  bgcolor: '#F5F5F5',
                  border: '2px dashed #333',
                  borderRadius: 2,
                  px: 4,
                  py: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  minWidth: 300
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    letterSpacing: 2
                  }}
                >
                  {couponData?.button_text || 'WELCOMEBUN'}
                </Typography>
                <IconButton
                  onClick={handleCopyCoupon}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                >
                  <Iconify icon="eva:copy-fill" width={20} />
                </IconButton>
              </Box>
              {validation && (
                <Typography
                  variant="body2"
                  sx={{ color: validation.is_valid ? 'success.main' : 'error.main' }}
                >
                  {validation.is_valid ? 'Voucher is valid and will be applied at checkout.' : 'Voucher is not valid.'}
                </Typography>
              )}
              
              {/* Instruction Text */}
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.9rem'
                }}
              >
                Use this code for 10% off your cart at checkout
              </Typography>
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
    </m.div>
    </Box>
  );
}

// Shop by Category Section
function ShopByCategorySection({ storeId }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from database
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const response = await storefrontApi.getCategories(storeId);
        
        if (response.success) {
          setCategories(response.data || []);
        } else {
          setError('Failed to load categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
          setError('Backend server is not running. Please start the backend server.');
        } else {
          setError('Failed to load categories');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [storeId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const handleNext = () => {
    if (isScrolling) return;
    setIsScrolling(true);
    setHasUserInteracted(true);
    setCurrentIndex((prev) => {
      // Calculate max index based on visible items (typically show 4 items)
      const maxIndex = Math.max(0, categories.length - 4); 
      return prev < maxIndex ? prev + 1 : prev;
    });
    setTimeout(() => setIsScrolling(false), 500);
  };

  const handlePrev = () => {
    if (isScrolling) return;
    setIsScrolling(true);
    setHasUserInteracted(true);
    setCurrentIndex((prev) => prev > 0 ? prev - 1 : prev);
    setTimeout(() => setIsScrolling(false), 500);
  };

  return (
    <Box ref={ref}>
      <m.div
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Box sx={{ 
          bgcolor: 'background.paper',
          py: { xs: 6, md: 8 },
          position: 'relative'
        }}>
        <Container maxWidth="lg">
          <Stack spacing={4}>
            {/* Section Header with Navigation */}
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <m.div {...varFade().inUp}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}
                >
                  Shop by Category
                </Typography>
              </m.div>

            {/* Navigation Arrows */}
            <Stack direction="row" spacing={2}>
              <IconButton
                onClick={handlePrev}
                disabled={currentIndex === 0}
                sx={{
                  width: 48,
                  height: 48,
                  border: '2px solid',
                  borderColor: currentIndex === 0 ? 'rgba(139, 69, 19, 0.1)' : 'rgba(139, 69, 19, 0.2)',
                  borderRadius: '50%',
                  bgcolor: 'transparent',
                  transition: 'all 0.3s ease',
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  '&:hover': {
                    borderColor: currentIndex === 0 ? 'rgba(139, 69, 19, 0.1)' : 'primary.main',
                    bgcolor: currentIndex === 0 ? 'transparent' : 'primary.main',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  }
                }}
              >
                <Iconify 
                  icon="mdi:chevron-left" 
                  sx={{ 
                    color: currentIndex === 0 ? 'rgba(139, 69, 19, 0.2)' : 'rgba(139, 69, 19, 0.4)', 
                    fontSize: 20,
                    transition: 'color 0.3s ease',
                    '.MuiIconButton-root:hover &': {
                      color: currentIndex === 0 ? 'rgba(139, 69, 19, 0.2)' : 'white'
                    }
                  }} 
                />
              </IconButton>
              <IconButton
                onClick={handleNext}
                disabled={currentIndex >= Math.max(1, categories.length - 4)}
                sx={{
                  width: 48,
                  height: 48,
                  border: '2px solid',
                  borderColor: currentIndex >= Math.max(1, categories.length - 4) ? 'rgba(139, 69, 19, 0.1)' : 'rgba(139, 69, 19, 0.2)',
                  borderRadius: '50%',
                  bgcolor: 'transparent',
                  transition: 'all 0.3s ease',
                  cursor: currentIndex >= Math.max(1, categories.length - 4) ? 'not-allowed' : 'pointer',
                  '&:hover': {
                    borderColor: currentIndex >= Math.max(1, categories.length - 4) ? 'rgba(139, 69, 19, 0.1)' : 'primary.main',
                    bgcolor: currentIndex >= Math.max(1, categories.length - 4) ? 'transparent' : 'primary.main',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  }
                }}
              >
                <Iconify 
                  icon="mdi:chevron-right" 
                  sx={{ 
                    color: currentIndex >= Math.max(1, categories.length - 4) ? 'rgba(139, 69, 19, 0.2)' : 'rgba(139, 69, 19, 0.4)', 
                    fontSize: 20,
                    transition: 'color 0.3s ease',
                    '.MuiIconButton-root:hover &': {
                      color: currentIndex >= Math.max(1, categories.length - 4) ? 'rgba(139, 69, 19, 0.2)' : 'white'
                    }
                  }} 
                />
              </IconButton>
            </Stack>
          </Stack>

          {/* Categories Carousel */}
          <Box sx={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  Loading categories...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'error.main', mb: 2 }}>
                  {error}
                </Typography>
              </Box>
            ) : categories.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  No categories available
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Categories will be displayed here when added to the store.
                </Typography>
              </Box>
            ) : (
              <Box
              sx={{
                display: 'flex',
                transition: 'transform 0.5s ease-in-out',
                transform: `translateX(-${currentIndex * 280}px)`,
                width: 'fit-content',
                gap: 3
              }}
            >
              {categories.map((category, index) => (
                <Box
                  key={`category-${category.id || category.name}-${index}`}
                  {...varFade().inUp}
                  custom={{ duration: 0.6, delay: index * 0.1 }}
                  sx={{
                    flexShrink: 0,
                    width: 280
                  }}
                >
                  <Card
                    onClick={() => {
                      // Navigate to products page filtered by category
                      router.push(`/${storeId}/products?category=${encodeURIComponent(category.name)}`);
                    }}
                    sx={{
                      width: '100%',
                      borderRadius: 2,
                      border: '1px solid #E0E0E0',
                      boxShadow: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        border: '1px solid #D0D0D0',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    <Stack spacing={2}>
                      {/* Category Image */}
                      <Box
                        sx={{
                          width: '100%',
                          height: 200,
                          borderRadius: '8px 8px 0 0',
                          bgcolor: '#F5F5F5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        {category.image_url ? (
                          <Box
                            component="img"
                            src={category.image_url}
                            alt={category.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        {/* Fallback placeholder */}
                        <Box
                          sx={{
                            display: category.image_url ? 'none' : 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            bgcolor: 'primary.lighter',
                            color: 'primary.main'
                          }}
                        >
                          <Iconify 
                            icon="eva:grid-fill" 
                            sx={{ fontSize: 48, mb: 1 }} 
                          />
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontWeight: 600,
                              textAlign: 'center',
                              px: 2
                            }}
                          >
                            {category.name}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Category Name with Arrow */}
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        justifyContent="space-between"
                        sx={{ p: 2, pt: 1 }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 600, 
                            color: 'text.primary',
                            fontSize: '1rem',
                            transition: 'text-decoration 0.3s ease',
                            '.MuiCard-root:hover &': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {category.name}
                        </Typography>
                        <Iconify 
                          icon="mdi:chevron-right" 
                          sx={{ 
                            fontSize: 16, 
                            color: 'primary.main',
                            opacity: 0.8
                          }} 
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Box>
              ))}
              </Box>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
    </m.div>
    </Box>
  );
}

// Upcoming Events Section (replaces Meet the Artist)
function UpcomingEventsSection({ storeId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events from database
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const response = await storefrontApi.getEvents(storeId);
        
        if (response.success) {
          // Map database fields to component format
          const mappedEvents = (response.data || []).map(event => ({
            name: event.title || '',
            date: event.event_date || '',
            time: event.event_time || '',
            location: event.location || '',
            description: event.description || '',
            link: event.link || '',
            id: event.id,
            // Legacy format support
            cta: 'View Details',
            seller: event.seller || '',
            booth: event.booth || '',
            focus: event.focus || '',
            // Convert seller info to sellers array format for compatibility
            sellers: event.seller ? [{
              name: event.seller,
              booth: event.booth || '',
              productFocus: event.focus || ''
            }] : []
          }));
          setEvents(mappedEvents);
        } else {
          setError('Failed to load events');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
          setError('Backend server is not running. Please start the backend server.');
        } else {
          setError('Failed to load events');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [storeId]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAllOpen, setShowAllOpen] = useState(false);
  const router = useRouter();
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <Box ref={ref}>
      <m.div 
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Box sx={{ bgcolor: 'grey.100', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Stack spacing={4}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
              <m.div {...varFade().inUp}>
                <Typography
                  variant="h3"
                    sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: { xs: '2rem', md: '2.5rem' },
                  }}
                >
                  Upcoming Events & Markets
                </Typography>
              </m.div>
            <Button
              variant="contained"
              color="primary"
              endIcon={<Iconify icon="eva:arrow-right-fill" />}
              sx={{
                mt: { xs: 2, md: 0 },
                px: 3,
                py: 1.25,
                borderRadius: 999,
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: 0.5,
                boxShadow: (theme) => theme.shadows[2],
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[4],
                  transform: 'translateY(-1px)'
                }
              }}
              onClick={() => setShowAllOpen(true)}
            >
              See all events
            </Button>
          </Stack>

          <Grid container spacing={3}>
            {loading ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                    Loading events...
                  </Typography>
                </Box>
              </Grid>
            ) : error ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" sx={{ color: 'error.main', mb: 2 }}>
                    {error}
                  </Typography>
                </Box>
              </Grid>
            ) : events.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                    No upcoming events
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Events will be displayed here when scheduled.
                  </Typography>
                </Box>
              </Grid>
            ) : (
              events.map((e, i) => (
              <Grid item xs={12} md={4} key={`${e.name}-${i}`}>
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: (theme) => theme.shadows[1],
                    transition: 'all 0.25s ease',
                    '&:hover': { boxShadow: (theme) => theme.shadows[4], transform: 'translateY(-2px)' },
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip label={e.date} size="small" color="primary" variant="soft" />
                      <Chip label={e.location} size="small" variant="outlined" />
            </Stack>

                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {e.name}
                    </Typography>

                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {e.description}
                    </Typography>

                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1 }}>
                      <Button variant="text" color="primary" endIcon={<Iconify icon="eva:arrow-right-fill" />}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                        onClick={() => setSelectedEvent(e)}
                      >
                        {e.cta}
                      </Button>
                      <Stack direction="row" spacing={1}>
                        <IconButton title="Share">
                          <Iconify icon="eva:share-fill" />
                        </IconButton>
                        <IconButton title="Save">
                          <Iconify icon="eva:heart-fill" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
              ))
            )}
          </Grid>
        </Stack>
      </Container>

      {/* Event Details Modal */}
      <Modal
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
      >
        <Box
                sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '92%', md: 720 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            outline: 'none',
          }}
        >
          {selectedEvent && (
            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedEvent.name}
              </Typography>
                  <IconButton onClick={() => setSelectedEvent(null)}>
                    <Iconify icon="eva:close-fill" />
                  </IconButton>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={selectedEvent.date} size="small" color="primary" variant="soft" />
                  <Chip label={selectedEvent.location} size="small" variant="outlined" />
                </Stack>

                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {selectedEvent.description}
                </Typography>

                <Divider />

                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Seller Table Info
                </Typography>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Seller</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Booth</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Focus</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedEvent.sellers || []).map((s, idx) => (
                      <TableRow key={`${s.name}-${idx}`}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.booth}</TableCell>
                        <TableCell>{s.productFocus}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ pt: 1 }}>
                  <Button onClick={() => setSelectedEvent(null)}>Close</Button>
                  <Button variant="contained" color="primary" endIcon={<Iconify icon="eva:calendar-fill" />}>Add to calendar</Button>
                </Stack>
              </Stack>
            </Box>
          )}
        </Box>
      </Modal>

      {/* All Events Modal */}
      <Modal
        open={showAllOpen}
        onClose={() => setShowAllOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
      >
        <Box
                sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '94%', md: 980 },
            maxHeight: { xs: '88vh' },
            overflowY: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            outline: 'none',
          }}
        >
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                All Upcoming Events
              </Typography>
              <IconButton onClick={() => setShowAllOpen(false)}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Stack>

            <Grid container spacing={3}>
              {events.map((e, i) => (
                <Grid item xs={12} md={6} key={`all-${e.name}-${i}`}>
                  <Card
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: (theme) => theme.shadows[1],
                      transition: 'all 0.25s ease',
                      '&:hover': { boxShadow: (theme) => theme.shadows[4], transform: 'translateY(-2px)' },
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip label={e.date} size="small" color="primary" variant="soft" />
                        <Chip label={e.location} size="small" variant="outlined" />
                      </Stack>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {e.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {e.description}
                      </Typography>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Button variant="text" color="primary" endIcon={<Iconify icon="eva:arrow-right-fill" />} sx={{ textTransform: 'none', fontWeight: 600 }} onClick={() => setSelectedEvent(e)}>
                          View details
              </Button>
                        <IconButton title="Add to Calendar">
                          <Iconify icon="eva:calendar-fill" />
                        </IconButton>
            </Stack>
                    </Stack>
                  </Card>
          </Grid>
              ))}
        </Grid>
          </Box>
        </Box>
      </Modal>
    </Box>
    </m.div>
    </Box>
  );
}

// Retailer Partnerships Section
function RetailerPartnershipsSection({ storeId }) {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch platforms from database
  useEffect(() => {
    async function fetchPlatforms() {
      try {
        setLoading(true);
        const response = await storefrontApi.getPartners(storeId);
        
        if (response.success) {
          const raw = Array.isArray(response.data) ? response.data : [];
          // Normalize field names and remove duplicates/inactive
          const toAbsoluteUrl = (value) => {
            const input = String(value || '').trim();
            if (!input) return '';
            // If already absolute, return as-is
            if (/^https?:\/\//i.test(input)) return input;
            // Prepend https by default when protocol is missing
            return `https://${input.replace(/^\/*/, '')}`;
          };

          const normalized = raw
            .filter((p) => p && p.is_active !== false)
            .map((p) => ({
              ...p,
              url: toAbsoluteUrl(p.platform_url || p.url || ''),
              name: p.platform_name || p.name || '',
              icon: p.icon_name || p.icon || '',
            }))
            .filter((p) => Boolean(p.url || p.name));

          const dedupedMap = new Map();
          normalized.forEach((p) => {
            const key = (p.url || p.name || '').toLowerCase();
            if (!dedupedMap.has(key)) dedupedMap.set(key, p);
          });
          setPlatforms(Array.from(dedupedMap.values()));
        } else {
          setError('Failed to load platforms');
        }
      } catch (err) {
        console.error('Error fetching platforms:', err);
        if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
          setError('Backend server is not running. Please start the backend server.');
        } else {
          setError('Failed to load platforms');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPlatforms();
  }, [storeId]);

  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <Box ref={ref}>
      <m.div
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Box sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Stack spacing={6} alignItems="center" textAlign="center">
            <m.div {...varFade().inUp}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                You can also find our shop at these platforms!
              </Typography>
            </m.div>

          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400
            }}
          >
            Follow and shop from our official channels
          </Typography>

          {/* Platform Logos */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                Loading partner platforms...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: 'error.main', mb: 2 }}>
                {error}
              </Typography>
            </Box>
          ) : platforms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                No partner platforms available
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Partner platforms will be displayed here when added.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4} justifyContent="center">
              {platforms.map((platform) => {
                const content = (
                  <Box
                    sx={{
                      height: 100,
                      bgcolor: 'background.neutral',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      gap: 1.5,
                      px: 2,
                      cursor: platform.url ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      '&:hover': platform.url ? {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme) => theme.shadows[4],
                        borderColor: 'primary.main',
                      } : {},
                    }}
                  >
                    {platform.logo_url ? (
                      <Box component="img" src={platform.logo_url} sx={{ width: 32, height: 32, objectFit: 'contain' }} />
                    ) : (
                      platform.icon ? (
                        <Iconify icon={platform.icon} width={32} sx={{ color: 'primary.main' }} />
                      ) : null
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {platform.name}
                    </Typography>
                  </Box>
                );

                return (
                  <Grid item xs={6} sm={4} md={2.4} key={platform.id || platform.url || platform.name}>
                    {platform.url ? (
                      <Link
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="none"
                        sx={{ display: 'block' }}
                      >
                        {content}
                      </Link>
                    ) : content}
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Stack>
      </Container>
    </Box>
    </m.div>
    </Box>
  );
}

// Footer Component
function StoreFooter({ storeId }) {
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
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  About Us
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                  Shipping & Returns
                </Link>
                <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
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

// Scroll to Top and Chatbot FABs
function FloatingActionButtons() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleChatbotClick = () => {
    // In a real app, this would open a chatbot widget
    console.log('Chatbot clicked');
  };

  return (
    <>
      {/* Scroll to Top Button */}
      {showBackToTop && (
        <Fab
          size="medium"
          onClick={handleScrollToTop}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            bgcolor: 'primary.main',
            color: 'white',
            zIndex: 1000,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <Iconify icon="eva:arrow-up-fill" />
        </Fab>
      )}

      {/* Chatbot Button */}
      <Fab
        size="medium"
        onClick={handleChatbotClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: 'primary.main',
          color: 'white',
          zIndex: 1000,
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        <Iconify icon="eva:message-circle-fill" />
      </Fab>
    </>
  );
}

// ----------------------------------------------------------------------

export default function SubdomainPage({ params }) {
  const theme = useTheme();
  // Handle both Promise and resolved params
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { subdomain } = resolvedParams;

  // Set page title
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = `${subdomain} | STUDIO360`;
    }
  }, [subdomain]);

  // Use client-side only check to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  const [isValidStore, setIsValidStore] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsValidStore(isStoreSubdomain());
  }, []);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Check if this is a store subdomain
  if (isValidStore) {
    return (
      // prevent horizontal overflow which caused extra right-side space
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', overflowX: 'hidden' }}>
        {/* Announcement Banner */}
        <AnnouncementBanner storeId={subdomain} />

        {/* Header */}
        <StoreHeader storeId={subdomain} />

        {/* Welcome Popup (once per session) */}
        <WelcomePopup storeId={subdomain} />

        {/* Hero Section */}
        <HeroSection storeId={subdomain} />

        {/* Best Sellers */}
        <FeaturedProductsSection storeId={subdomain} />

        {/* Promotional Section */}
        <PromotionalSection storeId={subdomain} />

        {/* Discount Offer */}
        <DiscountOfferSection storeId={subdomain} />

        {/* Shop by Category */}
        <ShopByCategorySection storeId={subdomain} />

        {/* Upcoming Events */}
        <UpcomingEventsSection storeId={subdomain} />

        {/* Retailer Partnerships */}
        <RetailerPartnershipsSection storeId={subdomain} />

        {/* Footer */}
        <ReusableStoreFooter storeId={subdomain} />

        {/* Floating Action Buttons */}
        <HydrationBoundary>
          <FloatingActionButtons />
        </HydrationBoundary>

        {/* Chat Widget */}
        <ChatWidget storeName={subdomain} />
      </Box>
    );
  }

  // For non-store subdomains, show a 404 or redirect
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1>404</h1>
      <p>Subdomain not found</p>
    </div>
  );
}
