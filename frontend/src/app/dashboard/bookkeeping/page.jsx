'use client';

import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function BookkeepingPage() {
  useEffect(() => {
    document.title = 'Book of Accounts | Kitsch Studio';
  }, []);
  const bookkeepingModules = [
    {
      title: 'General Journal',
      description: 'Record all business transactions in chronological order',
      icon: 'eva:file-text-fill',
      color: 'primary.main',
      path: '/dashboard/bookkeeping/general-journal',
    },
    {
      title: 'General Ledger',
      description: 'View account balances and transaction history',
      icon: 'eva:pie-chart-2-fill',
      color: 'success.main',
      path: '/dashboard/bookkeeping/general-ledger',
    },
    {
      title: 'Cash Receipt Journal',
      description: 'Track all cash inflows and revenue',
      icon: 'eva:trending-up-fill',
      color: 'info.main',
      path: '/dashboard/bookkeeping/cash-receipt',
    },
    {
      title: 'Cash Disbursement Journal',
      description: 'Monitor all cash outflows and expenses',
      icon: 'eva:trending-down-fill',
      color: 'warning.main',
      path: '/dashboard/bookkeeping/cash-disbursement',
    },
  ];

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        Book of Accounts
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Dashboard / Book of Accounts
      </Typography>

      {/* Overview Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Iconify icon="eva:info-fill" width={24} sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              Book of Accounts Overview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage your financial records, track transactions, and generate reports. 
              Use our traditional bookkeeping tools to maintain accurate financial records.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Bookkeeping Modules */}
      <Grid container spacing={3}>
        {bookkeepingModules.map((module) => (
          <Grid item xs={12} sm={6} md={4} key={module.title}>
            <Card
              sx={{
                p: 3,
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.customShadows.z24,
                },
              }}
              onClick={() => window.location.href = module.path}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${module.color}20`,
                    color: module.color,
                  }}
                >
                  <Iconify icon={module.icon} width={24} />
                </Box>
                
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {module.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {module.description}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </DashboardContent>
  );
} 