'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { inventoryApi } from 'src/services/inventoryService';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InventoryNewEditForm } from '../inventory-new-edit-form';

// ----------------------------------------------------------------------

export function InventoryEditView({ id }) {
  const router = useRouter();
  
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load product data from database
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const product = await inventoryApi.getProductById(id);
        
        if (!product) {
          toast.error('Product not found');
          router.push(paths.dashboard.inventory.root);
          return;
        }

        // Transform database data to match form format
        const transformedProduct = {
          id: product.id,
          name: product.name,
          subDescription: product.short_description || '',
          description: product.description || '',
          images: product.images || [],
          code: product.barcode || '',
          sku: product.sku || '',
          price: product.price || 0,
          quantity: product.stock_quantity || 0,
          priceSale: product.compare_at_price || 0,
          category: product.category || '',
          // Extract from dimensions JSONB field
          tags: product.dimensions?.tags || [],
          gender: product.dimensions?.gender || [],
          theme: product.dimensions?.theme || '',
          colors: product.dimensions?.colors || [],
          sizes: product.dimensions?.sizes || [],
          newLabel: product.dimensions?.newLabel || { enabled: false, content: '' },
          saleLabel: product.dimensions?.saleLabel || { enabled: false, content: '' },
          variations: [],
          variationCombinations: [],
          wholesalePricing: [],
        };

        setCurrentProduct(transformedProduct);
        
        // Set page title
        document.title = `Edit ${product.name} | Inventory - STUDIO360`;
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Failed to load product');
        router.push(paths.dashboard.inventory.root);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id, router]);

  const handleBack = () => {
    router.push(paths.dashboard.inventory.root);
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (!currentProduct) {
    return null;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Product', href: paths.dashboard.inventory.root },
          { name: currentProduct.name },
        ]}
        action={
          <Button
            variant="text"
            color="inherit"
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            sx={{ 
              color: 'text.primary',
              '&:hover': { bgcolor: 'transparent' }
            }}
          >
            Back
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InventoryNewEditForm currentProduct={currentProduct} />
    </DashboardContent>
  );
}
