'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function VoucherStatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Here you would make an API call to fetch voucher statistics
        // For now, we'll simulate with empty data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const sampleStats = {
          totalVouchers: 0,
          activeVouchers: 0,
          usedVouchers: 0,
          expiredVouchers: 0,
          totalUsage: 0,
          typeStats: [
            { type: 'percentage', count: 0 },
            { type: 'fixed_amount', count: 0 },
            { type: 'free_shipping', count: 0 },
            { type: 'buy_x_get_y', count: 0 },
          ]
        };
        
        setStats(sampleStats);
      } catch (error) {
        console.error('Error fetching voucher stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Failed to load statistics
        </Typography>
      </Card>
    );
  }

  const statCards = [
    {
      title: 'Total Vouchers',
      value: stats.totalVouchers,
      icon: 'solar:tag-bold',
      color: 'primary',
    },
    {
      title: 'Active',
      value: stats.activeVouchers,
      icon: 'solar:check-circle-bold',
      color: 'success',
    },
    {
      title: 'Used',
      value: stats.usedVouchers,
      icon: 'solar:checkmark-circle-bold',
      color: 'info',
    },
    {
      title: 'Expired',
      value: stats.expiredVouchers,
      icon: 'solar:close-circle-bold',
      color: 'error',
    },
    {
      title: 'Total Usage',
      value: stats.totalUsage,
      icon: 'solar:users-group-rounded-bold',
      color: 'warning',
    },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h6">
        Voucher Statistics
      </Typography>

      <Grid container spacing={2}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={2.4} key={stat.title}>
            <Card
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: `${stat.color}.lighter`,
                border: 1,
                borderColor: `${stat.color}.main`,
              }}
            >
              <Stack spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: `${stat.color}.main`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify
                    icon={stat.icon}
                    sx={{ color: 'white', fontSize: 24 }}
                  />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'fontWeightBold' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Voucher Types Distribution
        </Typography>
        <Grid container spacing={2}>
          {stats.typeStats.map((typeStat) => (
            <Grid item xs={12} sm={6} md={3} key={typeStat.type}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 'fontWeightBold' }}>
                  {typeStat.count}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {typeStat.type.replace('_', ' ')}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Stack>
  );
}
