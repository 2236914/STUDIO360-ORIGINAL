'use client';

import { useState, useEffect, use } from 'react';

import Box from '@mui/material/Box';
import { isStoreSubdomain } from 'src/utils/subdomain';
import { storefrontApi } from 'src/utils/api/storefront';
import { StoreHeader } from 'src/components/store-header';
import { StoreFooter } from 'src/components/store-footer';
import { StoreProductDetailsView } from 'src/sections/storefront/view/store-product-details-view';

// ----------------------------------------------------------------------

export default function SubdomainProductPage({ params }) {
  const { subdomain, productName } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!isStoreSubdomain()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await storefrontApi.getProductBySlug(subdomain, productName);
        const productData = response?.data || response;
        
        if (!productData) {
          setError('Product not found');
          return;
        }

        // Transform API data to match StoreProductDetailsView format
        const transformedProduct = {
          id: productData.id,
          name: productData.name,
          description: productData.description || productData.short_description || '',
          price: productData.price || 0,
          originalPrice: productData.compare_at_price || 0,
          rating: productData.rating || 4.5,
          reviewCount: productData.review_count || 0,
          images: productData.images || [productData.cover_image_url || '/assets/images/product/product-placeholder.png'],
          colors: productData.dimensions?.colors || ['#000000'],
          sizes: productData.dimensions?.sizes || [],
          availableQuantity: productData.stock_quantity || 0,
          category: productData.category || 'Uncategorized',
          manufacturer: productData.manufacturer || subdomain,
          serialNumber: productData.sku || '',
          shipsFrom: productData.ships_from || 'Philippines',
          productDetails: productData.product_details || [],
          benefits: productData.benefits || [],
        };

        setProduct(transformedProduct);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [subdomain, productName]);

  // Check if this is a store subdomain
  if (!isStoreSubdomain()) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <h1>404</h1>
        <p>Product page not found</p>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh'
      }}>
        <p>Loading product...</p>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
        <StoreHeader storeId={subdomain} />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          px: 2
        }}>
          <h1>404</h1>
          <p>{error || 'Product not found'}</p>
        </Box>
        <StoreFooter storeId={subdomain} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      <StoreHeader storeId={subdomain} />
      <StoreProductDetailsView 
        id={product.id} 
        additionalProducts={{ [product.id]: product }}
      />
      <StoreFooter storeId={subdomain} />
    </Box>
  );
}
