'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import { Iconify } from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';
import { useCheckoutContext } from 'src/sections/checkout/context';

// ----------------------------------------------------------------------

// Store Header Component with Search Icon, Cart Icon, and Products Link
export function StoreHeader() {
  const router = useRouter();
  
  // Get cart count from checkout context
  let cartCount = 0;
  let storeId = 'kitschstudio'; // Default store ID
  
  try {
    const checkout = useCheckoutContext();
    cartCount = checkout.totalItems || 0;
  } catch (error) {
    // Checkout context not available, use default
    console.log('Checkout context not available in header');
  }

  // Extract storeId from current URL or subdomain
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const hostname = window.location.hostname;
    
    // Check traditional /stores/[storeId] route first
    const storeIdMatch = pathname.match(/\/stores\/([^\/]+)/);
    if (storeIdMatch) {
      storeId = storeIdMatch[1];
    } 
    // Check subdomain route /[subdomain]
    else if (pathname.startsWith('/') && pathname !== '/') {
      const pathSegments = pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        storeId = pathSegments[0];
      }
    }
    // Check actual subdomain from hostname
    else if (hostname.includes('.')) {
      const subdomain = hostname.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'dashboard' && subdomain !== 'admin') {
        storeId = subdomain;
      }
    }
  }

  const handleProductsClick = () => {
    // Navigate to product catalog page using subdomain-aware routing
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const hostname = window.location.hostname;
      
      // Check if we're on a subdomain or subdomain route
      if (hostname.includes('.') || pathname.startsWith('/') && pathname !== '/') {
        // On subdomain or subdomain route, navigate to products page
        router.push('/products');
      } else {
        // On traditional URL, navigate to stores path
        router.push(`/stores/${storeId}/products`);
      }
    }
  };

  const handleSearchClick = () => {
    // In a real app, this would open a search modal or navigate to search page
    console.log('Search clicked');
  };

  const handleCartClick = () => {
    // Navigate to checkout page using subdomain-aware routing
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const hostname = window.location.hostname;
      
      // Check if we're on a subdomain or subdomain route
      if (hostname.includes('.') || pathname.startsWith('/') && pathname !== '/') {
        // On subdomain or subdomain route, navigate to checkout page
        router.push('/checkout');
      } else {
        // On traditional URL, navigate to stores path
        router.push(`/stores/${storeId}/checkout`);
      }
    }
  };

  const handleFAQClick = () => {
    // Navigate to FAQ page using subdomain-aware routing
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const hostname = window.location.hostname;
      
      // Check if we're on a subdomain or subdomain route
      if (hostname.includes('.') || pathname.startsWith('/') && pathname !== '/') {
        // On subdomain or subdomain route, navigate to FAQ page
        router.push('/faq');
      } else {
        // On traditional URL, navigate to stores path
        router.push(`/stores/${storeId}/faq`);
      }
    }
  };

  return (
    <Box sx={{ 
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      bgcolor: 'background.paper', 
      py: 2, 
      borderBottom: '1px solid', 
      borderColor: 'divider' 
    }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={4}>
          {/* Logo */}
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Logo
          </Typography>

          {/* Navigation */}
          <Stack direction="row" spacing={4} alignItems="center">
            {/* About Link */}
            <Link 
              href="/stores/kitschstudio/about" 
              sx={{ 
                color: 'text.primary', 
                textDecoration: 'none', 
                fontWeight: 500,
                fontSize: '1rem',
                '&:hover': { color: 'primary.main' } 
              }}
            >
              About
            </Link>

            {/* Products Link */}
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
              Products
            </Button>

            {/* FAQ Link */}
            <Button
              onClick={handleFAQClick}
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
              FAQ
            </Button>

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
              <Iconify icon="eva:search-fill" sx={{ fontSize: 24 }} />
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
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    minWidth: 18,
                    height: 18,
                  }
                }}
              >
                <Iconify 
                  icon="eva:shopping-cart-fill" 
                  sx={{ fontSize: 24 }} 
                />
              </Badge>
            </IconButton>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}