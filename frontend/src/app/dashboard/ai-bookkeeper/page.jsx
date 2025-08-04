'use client';

import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AIBookkeeperPage() {
  useEffect(() => {
    document.title = 'AI Bookkeeper | Kitsch Studio';
  }, []);

  const aiModules = [
    {
      title: 'AI Bookkeeper',
      description: 'AI-powered transaction categorization and analysis',
      icon: 'eva:smartphone-fill',
      color: 'secondary.main',
      path: '/dashboard/ai-bookkeeper/ai-bookkeeper',
    },
    {
      title: 'AI Categorization Log',
      description: 'Review and manage AI-categorized transactions',
      icon: 'eva:list-fill',
      color: 'error.main',
      path: '/dashboard/ai-bookkeeper/ai-categorization',
    },
  ];

  const handleUploadClick = () => {
    window.location.href = '/dashboard/ai-bookkeeper/upload-process';
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        AI Bookkeeper
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Dashboard / AI Bookkeeper
      </Typography>

      {/* Overview Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'secondary.lighter' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Iconify icon="eva:info-fill" width={24} sx={{ color: 'secondary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'secondary.main' }}>
              AI Bookkeeper Overview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Leverage artificial intelligence to automate your bookkeeping processes. 
              Our AI tools can categorize transactions, identify patterns, and provide 
              intelligent insights to streamline your financial management.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Upload Button Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              Start AI Bookkeeping Process
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Upload receipts, sales data, or Excel files to begin automated categorization
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Iconify icon="eva:upload-fill" />}
            onClick={handleUploadClick}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              px: 3,
              py: 1.5,
            }}
          >
            Upload Button for OCR/Excel
          </Button>
        </Stack>
      </Card>

      {/* AI Modules */}
      <Grid container spacing={3}>
        {aiModules.map((module) => (
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
              <Stack spacing={2} alignItems="center" textAlign="center">
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${module.color}20`,
                  }}
                >
                  <Iconify icon={module.icon} width={32} sx={{ color: module.color }} />
                </Box>
                
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {module.title}
                </Typography>
                
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {module.description}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </DashboardContent>
  );
} 