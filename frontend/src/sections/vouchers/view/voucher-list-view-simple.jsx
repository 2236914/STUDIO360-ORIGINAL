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

// Empty voucher data - will be populated from database
const VOUCHER_DATA = [];

// ----------------------------------------------------------------------

export function VoucherListViewSimple() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Vouchers"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vouchers', href: paths.dashboard.vouchers.root },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.vouchers.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Voucher
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Stats Cards */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h6">Voucher Statistics</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'fontWeightBold', color: 'primary.main' }}>
              {VOUCHER_DATA.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Vouchers
            </Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'fontWeightBold', color: 'success.main' }}>
              {VOUCHER_DATA.filter(v => v.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Vouchers
            </Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'fontWeightBold', color: 'info.main' }}>
              {VOUCHER_DATA.reduce((sum, v) => sum + v.usedCount, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Usage
            </Typography>
          </Card>
        </Box>
      </Stack>

      {/* Voucher List */}
      <Card>
        <Stack spacing={2} sx={{ p: 3 }}>
          <Typography variant="h6">Voucher List</Typography>
          
          {VOUCHER_DATA.map((voucher) => (
            <Card key={voucher.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'fontWeightBold' }}>
                    {voucher.code} - {voucher.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {voucher.description}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ 
                      bgcolor: voucher.type === 'percentage' ? 'primary.lighter' : 
                              voucher.type === 'fixed_amount' ? 'secondary.lighter' : 'info.lighter',
                      px: 1, py: 0.5, borderRadius: 0.5,
                      textTransform: 'capitalize'
                    }}>
                      {voucher.type.replace('_', ' ')}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      bgcolor: voucher.status === 'active' ? 'success.lighter' : 'default.lighter',
                      px: 1, py: 0.5, borderRadius: 0.5,
                      textTransform: 'capitalize'
                    }}>
                      {voucher.status}
                    </Typography>
                  </Stack>
                </Box>
                
                <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                  <Typography variant="body2" color="text.secondary">
                    Usage: {voucher.usedCount}
                    {voucher.usageLimit && `/${voucher.usageLimit}`}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
                    {voucher.type === 'percentage' ? `${voucher.value}% off` :
                     voucher.type === 'fixed_amount' ? `$${voucher.value} off` :
                     'Free Shipping'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined">
                    View
                  </Button>
                  <Button size="small" variant="outlined">
                    Edit
                  </Button>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Card>
    </DashboardContent>
  );
}
