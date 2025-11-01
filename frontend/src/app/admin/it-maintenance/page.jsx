'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  Alert,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import supportApi from 'src/services/support';

// ----------------------------------------------------------------------

export default function ITMaintenanceDashboard() {
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadStats = async () => {
    try {
      setError(null);
      const data = await supportApi.getTicketStats();
      setStats(data || { total: 0, open: 0, inProgress: 0, closed: 0 });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading stats:', err);
      // Only show error if it's not a rate limit error (429)
      if (err.message && !err.message.includes('429') && !err.message.includes('rate limit')) {
        setError(err.message || 'Failed to load statistics');
      }
      // If rate limited, silently retry later
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'IT Maintenance Dashboard | STUDIO360';
    loadStats();

    // Auto-refresh every 30 seconds (reduced from 5s to avoid rate limiting)
    const interval = setInterval(() => {
      loadStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const resolutionRate = stats.total > 0 ? ((stats.closed / stats.total) * 100).toFixed(1) : '0.0';

  return (
    <DashboardContent>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          IT Maintenance Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Monitoring system updates, security maintenance, and data backups
        </Typography>
        <Divider />
      </Box>

      {/* Support Tickets Overview */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Support Tickets Overview
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary.main">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tickets
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">
                  {stats.open}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Open
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="info.main">
                  {stats.inProgress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  {stats.closed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Resolution Rate */}
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Resolution Rate
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {resolutionRate}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={parseFloat(resolutionRate)} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Box>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* System Status */}
      <Grid container spacing={3}>
        {/* Security Updates */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'success.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="eva:shield-fill" sx={{ fontSize: 24, color: 'success.main' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Security Updates
                  </Typography>
                  <Typography variant="h6">Current</Typography>
                </Box>
              </Stack>
              <Divider />
              <Typography variant="body2" color="text.secondary">
                All security patches and updates are applied successfully.
              </Typography>
              <Chip label="Up to Date" color="success" size="small" />
            </Stack>
          </Card>
        </Grid>

        {/* Data Backups */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'info.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="eva:cloud-upload-fill" sx={{ fontSize: 24, color: 'info.main' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Data Backups
                  </Typography>
                  <Typography variant="h6">Active</Typography>
                </Box>
              </Stack>
              <Divider />
              <Typography variant="body2" color="text.secondary">
                Automated backups running daily at 02:00 AM.
              </Typography>
              <Chip label="Backing Up Daily" color="info" size="small" />
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

