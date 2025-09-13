'use client';

import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InventoryNewEditForm } from '../inventory-new-edit-form';

// ----------------------------------------------------------------------

// Mock product data for editing - would typically come from API
const PRODUCT_DATA = {
  1: {
    id: '1',
    name: 'Classic Leather Loafers',
    subDescription: 'Featuring the original ripple design inspired by Japanese bullet trains',
    description: 'Featuring the original ripple design inspired by Japanese bullet trains, the Nike Air Max 97 lets you push your style full-speed ahead.',
    images: [
      '/assets/images/product/product_1.jpg',
      '/assets/images/product/product_2.jpg',
      '/assets/images/product/product_3.jpg',
    ],
    code: '38BEE271',
    sku: 'WW754X51YW-5V',
    quantity: 80,
    category: 'Shoes',
    colors: ['Blue', 'Pink'],
    sizes: ['7.5', '8.5', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
    tags: ['Technology', 'Health and Wellness', 'Travel', 'Finance', 'Education'],
    gender: ['Men', 'Women', 'Kids'],
    price: 97.14,
    priceSale: 89.99,
    taxes: 10,
    saleLabel: { enabled: true, content: 'SALE' },
    newLabel: { enabled: true, content: 'NEW' },
  }
};

export function InventoryEditView({ id }) {
  const router = useRouter();
  
  const [currentProduct, setCurrentProduct] = useState(null);

  // Get product data (in real app, this would be from API)
  useEffect(() => {
    const product = PRODUCT_DATA[id] || PRODUCT_DATA['1'];
    setCurrentProduct(product);
    
    // Set page title
    document.title = `Edit ${product.name} | Inventory - Kitsch Studio`;
  }, [id]);

  const handleBack = () => {
    router.push(paths.dashboard.inventory.root);
  };

  if (!currentProduct) {
    return null; // Loading state
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
