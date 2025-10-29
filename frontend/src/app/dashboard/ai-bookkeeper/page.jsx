'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function getStats() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('aiBookkeeperStats');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export default function AIBookkeeperPage() {
  useEffect(() => {
    document.title = 'AI Bookkeeper | STUDIO360';
  }, []);
  
  const [stats, setStats] = useState(null);

  // Load stats from backend (fallback to localStorage) and subscribe to updates
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/ai/stats');
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json.data) {
            setStats(json.data);
            
            // Persist to localStorage for cross-tab sync
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('aiBookkeeperStats', JSON.stringify(json.data));
            }
            return;
          }
        }
        
        // Fallback to localStorage
        const localStats = getStats();
        if (localStats) {
          setStats(localStats);
        }
      } catch (error) {
        console.error('Failed to load AI stats:', error);
        // Fallback to localStorage
        const localStats = getStats();
        if (localStats) {
          setStats(localStats);
        }
      }
    };

    // Initial load
    loadStats();
    
    // Set up polling for real-time updates
    const intervalId = setInterval(loadStats, 2000); // Poll every 2 seconds
    
    // Listen for storage events (cross-tab updates)
    const handleStorageChange = () => {
      const localStats = getStats();
      if (localStats) {
        setStats(localStats);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleUploadClick = () => {
    window.location.href = '/dashboard/ai-bookkeeper/upload-process';
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        AI Bookkeeper
      </Typography>
      
      <Breadcrumbs 
        separator={<Iconify icon="eva:chevron-right-fill" width={16} />} 
        sx={{ 
          mb: 3,
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'wrap',
          },
        }}
      >
        <Link
          component={RouterLink}
          href="/dashboard"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.primary',
            textDecoration: 'none',
            fontSize: { xs: '0.875rem', sm: '0.875rem' },
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          Dashboard
        </Link>
        <Link
          component={RouterLink}
          href="/dashboard/ai-bookkeeper"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.primary',
            textDecoration: 'none',
            fontSize: { xs: '0.875rem', sm: '0.875rem' },
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          Bookkeeping
        </Link>
        <Typography 
          color="text.secondary" 
          variant="body2"
          sx={{
            fontSize: { xs: '0.875rem', sm: '0.875rem' },
          }}
        >
          AI Bookkeeper
      </Typography>
      </Breadcrumbs>

      {/* Overview Section */}
      <Card sx={{ 
        p: { xs: 2, md: 3 }, 
        mb: 3, 
      }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Iconify 
            icon="eva:bulb-fill" 
            width={{ xs: 20, md: 24 }} 
            sx={{ color: 'primary.main', mt: 0.5 }} 
          />
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 1, 
                color: 'text.primary',
                fontWeight: 600,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              AI Bookkeeper Overview
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
              }}
            >
              Your intelligent assistant for automated bookkeeping. I can help categorize transactions, 
              generate reports, analyze patterns, and provide financial insights to streamline your accounting.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Upload CTA Section */}
      <Card sx={{ 
        p: { xs: 2, md: 3 }, 
        mb: 3, 
      }}>
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={{ xs: 2, md: 3 }} 
          alignItems={{ xs: 'stretch', md: 'center' }} 
          justifyContent="space-between"
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 1, 
                color: 'text.primary',
                fontWeight: 600,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Start AI Bookkeeping Process
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                wordBreak: 'break-word',
              }}
            >
              Upload receipts, sales data, or Excel files to begin automated categorization and analysis
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Iconify icon="eva:upload-fill" />}
            onClick={handleUploadClick}
            sx={{
                bgcolor: 'primary.main',
                '&:hover': { 
                  bgcolor: 'primary.dark',
                  transform: { xs: 'none', md: 'translateY(-2px)' },
                  boxShadow: { xs: 'none', md: 4 },
                },
              px: 3,
              py: 1.5,
                fontSize: { xs: '0.875rem', md: '1rem' },
                transition: 'all 0.3s',
                width: { xs: '100%', md: 'auto' },
                whiteSpace: 'nowrap',
            }}
          >
              Upload Files
          </Button>
          </Box>
        </Stack>
      </Card>

      {/* Analytics Cards (responsive) */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Card sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'success.main', width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}>
              <Iconify icon="eva:trending-up-fill" width={24} />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Transactions Processed
              </Typography>
              <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                {stats ? Number(stats.processed || 0).toLocaleString() : '0'}
              </Typography>
              <Label variant="soft" color="success" sx={{ fontSize: '0.75rem' }}>
                {stats ? 'Live' : 'No data'}
              </Label>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}>
              <Iconify icon="eva:checkmark-circle-2-fill" width={24} />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Accuracy Rate
              </Typography>
              <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                {stats ? `${Math.round(Number(stats.accuracyRate || 0))}%` : '0%'}
              </Typography>
              <Label variant="soft" color="success" sx={{ fontSize: '0.75rem' }}>
                {stats ? 'Live' : 'No data'}
              </Label>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'warning.main', width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}>
              <Iconify icon="eva:clock-fill" width={24} />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Time Saved
              </Typography>
              <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                {stats ? `${Number(stats.timeSavedMinutes || 0)} mins` : '0 mins'}
              </Typography>
              <Label variant="soft" color="success" sx={{ fontSize: '0.75rem' }}>
                {stats ? 'Live' : 'No data'}
              </Label>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'success.main', width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 } }}>
              <Iconify icon="eva:credit-card-fill" width={24} />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Cost Savings
              </Typography>
              <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                ₱{stats ? Number(stats.costSavings || 0).toLocaleString() : '0'}
              </Typography>
              <Label variant="soft" color="success" sx={{ fontSize: '0.75rem' }}>
                {stats ? 'Live' : 'No data'}
              </Label>
            </Box>
          </Stack>
        </Card>
      </Stack>


    </DashboardContent>
  );
} 