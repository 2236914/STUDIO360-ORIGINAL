'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Empty stats data - will be populated from database
const SIMPLE_STATS = [
  { title: 'Total', count: 0, amount: '₱0.00', color: '#00B8D9' },
  { title: 'Paid', count: 0, amount: '₱0.00', color: '#22C55E' },
  { title: 'Pending', count: 0, amount: '₱0.00', color: '#FFAB00' },
  { title: 'Overdue', count: 0, amount: '₱0.00', color: '#FF5630' },
  { title: 'Draft', count: 0, amount: '₱0.00', color: '#919EAB' },
];

// ----------------------------------------------------------------------

export function InvoiceListViewSimple() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Invoice', href: paths.dashboard.invoice.root },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths?.dashboard?.invoice?.new || '/dashboard/invoice/new'}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{
              bgcolor: 'grey.900',
              color: 'common.white',
              '&:hover': {
                bgcolor: 'grey.800',
              },
              px: 3,
              py: 1.5,
              borderRadius: 1.5,
              fontWeight: 600,
            }}
          >
            New invoice
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Simple Analytics Cards */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={3} divider={<Box sx={{ width: 1, bgcolor: 'divider' }} />}>
          {SIMPLE_STATS.map((stat) => (
            <Box key={stat.title} sx={{ flex: 1, textAlign: 'center' }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                  }}
                >
                  <Iconify icon="solar:bill-list-bold-duotone" width={28} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.count} invoices
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
                    {stat.amount}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Card>

      {/* Simple Content */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Invoice Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is a simplified invoice list view to test for circular dependency issues.
          The full invoice table will be restored once the stack overflow is resolved.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </Box>
      </Card>
    </DashboardContent>
  );
}
