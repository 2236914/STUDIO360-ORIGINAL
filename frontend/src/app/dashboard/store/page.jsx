'use client';

import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function StoreStorefrontPage() {
  useEffect(() => {
    document.title = 'Store | STUDIO360';
  }, []);

  const storefrontModules = [
    {
      title: 'Homepage Editor',
      description: 'Edit your store homepage with hero banner, featured products, and call-to-action sections',
      icon: 'eva:home-fill',
      color: 'primary.main',
      path: '/dashboard/store/homepage',
    },
    {
      title: 'Shipping & Returns',
      description: 'Configure shipping information, return policies, and FAQ sections',
      icon: 'eva:car-fill',
      color: 'info.main',
      path: '/dashboard/store/shipping',
    },
    {
      title: 'About Page Editor',
      description: 'Tell your story, add social media links, and showcase your brand identity',
      icon: 'eva:info-fill',
      color: 'success.main',
      path: '/dashboard/store/about',
    },
  ];

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Store"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Store' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Overview Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Iconify icon="eva:edit-2-fill" width={24} sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              Customize Your Online Store
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Edit your storefront pages, customize content, upload images, and manage your online presence. 
              Create a beautiful and engaging shopping experience for your customers.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Storefront Editor Modules */}
      <Grid container spacing={3}>
        {storefrontModules.map((module) => (
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

      {/* Quick Actions Section */}
      <Card sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'background.paper' },
              }}
              onClick={() => window.open('/stores/your-store-id', '_blank')}
            >
              <Iconify icon="eva:external-link-fill" width={20} sx={{ color: 'text.secondary' }} />
              <Typography variant="body2">Preview Store</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'background.paper' },
              }}
            >
              <Iconify icon="eva:copy-fill" width={20} sx={{ color: 'text.secondary' }} />
              <Typography variant="body2">Copy Store Link</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'background.paper' },
              }}
            >
              <Iconify icon="eva:smartphone-fill" width={20} sx={{ color: 'text.secondary' }} />
              <Typography variant="body2">Mobile Preview</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'background.paper' },
              }}
            >
              <Iconify icon="eva:settings-2-fill" width={20} sx={{ color: 'text.secondary' }} />
              <Typography variant="body2">Store Settings</Typography>
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </DashboardContent>
  );
}
