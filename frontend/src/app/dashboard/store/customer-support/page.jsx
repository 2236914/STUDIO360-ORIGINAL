'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { StoreCustomerSupport } from 'src/sections/store/store-customer-support';

// ----------------------------------------------------------------------

export default function CustomerSupportPage() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Customer Support"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Store', href: paths.dashboard.store.root },
          { name: 'Customer Support' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <StoreCustomerSupport />
    </DashboardContent>
  );
}
