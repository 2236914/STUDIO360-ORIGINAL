'use client';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InventoryNewEditForm } from '../inventory-new-edit-form';

// ----------------------------------------------------------------------

export function InventoryCreateView() {
  const router = useRouter();

  const handleBack = () => {
    router.push(paths.dashboard.inventory.root);
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new product"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Inventory', href: paths.dashboard.inventory.root },
          { name: 'New product' },
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

      <InventoryNewEditForm />
    </DashboardContent>
  );
}