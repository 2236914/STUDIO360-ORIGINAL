'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { HydrationBoundary } from 'src/components/hydration-boundary';
import { storefrontApi } from 'src/utils/api/storefront';

import { useCheckoutContext } from 'src/sections/checkout/context';

// ----------------------------------------------------------------------

// Component that handles window-dependent storeId extraction
function StoreIdExtractor({ propStoreId, onStoreIdChange }) {
  // If no storeId prop provided, extract from current URL or subdomain
  if (!propStoreId && typeof window !== 'undefined') {
    const {pathname} = window.location;
    const {hostname} = window.location;
    
    // Check traditional /stores/[storeId] route first
    const storeIdMatch = pathname.match(/\/stores\/([^\/]+)/);
    if (storeIdMatch) {
      onStoreIdChange(storeIdMatch[1]);
      return null;
    } 
    // Check actual subdomain from hostname (production)
    else if (hostname !== 'localhost' && hostname.includes('.')) {
      const subdomain = hostname.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'dashboard' && subdomain !== 'admin') {
        onStoreIdChange(subdomain);
        return null;
      }
    }
  }
  return null;
}

// Store Header Component with Search Icon, Cart Icon, and Products Link
export function StoreHeader({ storeId: propStoreId }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [storeId, setStoreId] = useState(propStoreId || 'kitschstudio');
  const [shopInfo, setShopInfo] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get cart count from checkout context
  let cartCount = 0;
  
  try {
    const checkout = useCheckoutContext();
    cartCount = checkout.totalItems || 0;
  } catch (error) {
    // Checkout context not available, use default
    console.log('Checkout context not available in header');
  }

  // Update storeId when prop changes
  useEffect(() => {
    if (propStoreId) {
      setStoreId(propStoreId);
    }
  }, [propStoreId]);

  // Load shop info (logo + name) for dynamic header branding
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!storeId) return;
        const resp = await storefrontApi.getShopInfo(storeId);
        const data = resp?.data || resp;
        if (active) setShopInfo(data || null);
      } catch (_) {
        if (active) setShopInfo(null);
      }
    })();
    return () => { active = false; };
  }, [storeId]);

  const handleProductsClick = () => {
    router.push(`/${storeId}/products`);
    setMobileMenuOpen(false);
  };

  const handleAboutClick = () => {
    router.push(`/${storeId}/about`);
    setMobileMenuOpen(false);
  };

  const handleSearchClick = () => {
    // In a real app, this would open a search modal or navigate to search page
    console.log('Search clicked');
  };

  const handleCartClick = () => {
    router.push(`/${storeId}/checkout`);
  };

  const handleFAQClick = () => {
    router.push(`/${storeId}/faq`);
    setMobileMenuOpen(false);
  };

  return (
    <HydrationBoundary>
      {/* Extract storeId from URL/subdomain on client-side only */}
      <StoreIdExtractor propStoreId={propStoreId} onStoreIdChange={setStoreId} />
      
      <Box sx={{ 
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        bgcolor: 'background.paper', 
        py: { xs: 1.5, md: 2 }, 
        borderBottom: '1px solid', 
        borderColor: 'divider' 
      }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={{ xs: 2, md: 4 }}>
            {/* Logo / Brand */}
            <Stack 
              direction="row" 
              spacing={{ xs: 1, md: 1.5 }} 
              alignItems="center" 
              sx={{ cursor: 'pointer', flexShrink: 0 }} 
              onClick={() => router.push(`/${storeId}`)}
            >
              {shopInfo?.profile_photo_url ? (
                <Avatar 
                  src={shopInfo.profile_photo_url} 
                  alt={shopInfo.shop_name || 'Store'} 
                  sx={{ width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }} 
                />
              ) : (
                <Avatar sx={{ width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}>
                  {(shopInfo?.shop_name || storeId || 'S').charAt(0).toUpperCase()}
                </Avatar>
              )}
              <Typography 
                variant={isMobile ? 'subtitle1' : 'h6'}
                sx={{ 
                  fontWeight: 700, 
                  color: 'text.primary', 
                  display: { xs: 'none', sm: 'block' },
                  '&:hover': { color: 'primary.main' } 
                }}
              >
                {shopInfo?.shop_name || 'Store'}
              </Typography>
            </Stack>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Stack direction="row" spacing={4} alignItems="center">
                {/* About Link */}
                <Button
                  onClick={handleAboutClick}
                  sx={{
                    color: 'text.primary',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    px: 1,
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: 'transparent'
                    }
                  }}
                >
                  About
                </Button>

                {/* Collection Link */}
                <Button
                  onClick={handleProductsClick}
                  sx={{
                    color: 'text.primary',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    px: 1,
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: 'transparent'
                    }
                  }}
                >
                  Collection
                </Button>
              </Stack>
            )}

            {/* Right Side Icons */}
            <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center">
              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: 'transparent'
                    }
                  }}
                >
                  <Iconify icon="eva:menu-fill" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>
              )}

              {/* Search Icon */}
              <IconButton
                onClick={handleSearchClick}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'transparent'
                  }
                }}
              >
                <Iconify icon="eva:search-fill" sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </IconButton>

              {/* Cart Icon with Badge */}
              <IconButton
                onClick={handleCartClick}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'transparent'
                  }
                }}
              >
                <Badge 
                  badgeContent={cartCount > 0 ? cartCount : null} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      minWidth: { xs: 16, md: 18 },
                      height: { xs: 16, md: 18 },
                    }
                  }}
                >
                  <Iconify 
                    icon="eva:shopping-cart-fill" 
                    sx={{ fontSize: { xs: 20, sm: 24 } }} 
                  />
                </Badge>
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: { width: { xs: '80%', sm: 280 } }
        }}
      >
        <Box sx={{ pt: 2 }}>
          <ListItem>
            <ListItemText 
              primary={
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {shopInfo?.shop_name || 'Store'}
                </Typography>
              }
            />
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </ListItem>
          <Divider />
          <ListItemButton onClick={handleProductsClick}>
            <ListItemText primary="Collection" />
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </ListItemButton>
          <ListItemButton onClick={handleAboutClick}>
            <ListItemText primary="About" />
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </ListItemButton>
          <ListItemButton onClick={handleFAQClick}>
            <ListItemText primary="FAQ" />
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </ListItemButton>
        </Box>
      </Drawer>
    </HydrationBoundary>
  );
}