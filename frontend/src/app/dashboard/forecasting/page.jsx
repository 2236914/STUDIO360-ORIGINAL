'use client';

import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const forecastingModules = [
  {
    title: 'Finance',
    description: 'Financial forecasting and analytics with AI-powered predictions',
    icon: 'eva:bar-chart-fill',
    color: 'primary.main',
    path: '/dashboard/forecasting/finance',
  },
  {
    title: 'Product Performance',
    description: 'Track product performance, sales trends, and growth metrics',
    icon: 'eva:trending-up-fill',
    color: 'success.main',
    path: '/dashboard/forecasting/product-performance',
  },
];

export default function ForecastingRootPage() {
  const router = useRouter();

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        Forecasting & Analytics
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Dashboard / Forecasting
      </Typography>

      {/* Overview Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Iconify icon="eva:bulb-fill" width={24} sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              Forecasting Overview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Access AI-powered forecasting tools to predict financial trends and product performance. 
              Make data-driven decisions with intelligent insights.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Forecasting Modules */}
      <Grid container spacing={3}>
        {forecastingModules.map((module) => (
          <Grid item xs={12} sm={6} md={6} key={module.title}>
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
              onClick={() => router.push(module.path)}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${module.color}20`,
                    }}
                  >
                    <Iconify icon={module.icon} width={32} sx={{ color: module.color }} />
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {module.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {module.description}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  endIcon={<Iconify icon="eva:arrow-forward-fill" />}
                  onClick={() => router.push(module.path)}
                  sx={{
                    bgcolor: module.color,
                    '&:hover': { bgcolor: module.color, opacity: 0.9 },
                  }}
                >
                  View {module.title}
                </Button>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </DashboardContent>
  );
}


