'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { HydrationBoundary } from 'src/components/hydration-boundary';

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
  const [storeId, setStoreId] = useState(propStoreId || 'kitschstudio');
  
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

  const handleProductsClick = () => {
    router.push(`/${storeId}/products`);
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
        py: 2, 
        borderBottom: '1px solid', 
        borderColor: 'divider' 
      }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={4}>
            {/* Logo */}
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: 'text.primary',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' }
              }}
              onClick={() => router.push(`/${storeId}`)}
            >
              Logo
            </Typography>

          {/* Navigation */}
          <Stack direction="row" spacing={4} alignItems="center">
            {/* About Link */}
            <Button
              onClick={() => router.push(`/${storeId}/about`)}
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

            {/* Collection Link (renamed from Products) */}
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
    </HydrationBoundary>
  );
}