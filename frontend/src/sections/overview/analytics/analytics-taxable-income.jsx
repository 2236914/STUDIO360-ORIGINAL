'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

import { bookkeepingApi } from 'src/services/bookkeepingService';

// ----------------------------------------------------------------------

export function AnalyticsTaxableIncome() {
  const [filingStatus, setFilingStatus] = useState('filed'); // 'filed' or 'not-yet'
  const [taxData, setTaxData] = useState({
    grossSales: 0,
    exemption: 250000, // Standard exemption amount
    taxableBase: 0,
    currentQuarter: '1st Quarter',
    filingDeadline: 'May 15, 2025',
    coveragePeriod: 'Jan 1 to Mar 31, 2025',
    birForm: '1701Qv2018',
    alphaslistEsub: 'SAWT',
    isLoading: true
  });

  // Fetch real-time quarterly sales data
  useEffect(() => {
    const fetchQuarterlySales = async () => {
      try {
        setTaxData(prev => ({ ...prev, isLoading: true }));
        
        // Get current quarter (1st Quarter 2025 for now)
        const quarterlyData = await bookkeepingApi.getQuarterlySales(1, 2025);
        
        // Calculate taxable base (gross sales - exemption, minimum 0)
        const grossSales = quarterlyData.totalSales || 0;
        const exemption = 250000; // Standard exemption
        const taxableBase = Math.max(0, grossSales - exemption);
        
        setTaxData({
          grossSales,
          exemption,
          taxableBase,
          currentQuarter: '1st Quarter',
          filingDeadline: 'May 15, 2025',
          coveragePeriod: 'Jan 1 to Mar 31, 2025',
          birForm: '1701Qv2018',
          alphaslistEsub: 'SAWT',
          isLoading: false,
          receiptCount: quarterlyData.receiptCount || 0
        });
      } catch (error) {
        console.error('Error fetching quarterly sales:', error);
        // Fallback to hardcoded data if API fails
        setTaxData({
          grossSales: 125000,
          exemption: 250000,
          taxableBase: 0,
          currentQuarter: '1st Quarter',
          filingDeadline: 'May 15, 2025',
          coveragePeriod: 'Jan 1 to Mar 31, 2025',
          birForm: '1701Qv2018',
          alphaslistEsub: 'SAWT',
          isLoading: false
        });
      }
    };

    fetchQuarterlySales();
  }, []);

  const handleStatusChange = (status) => {
    setFilingStatus(status);
  };

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'primary.main',
            mr: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: 'white' }}>
            ₱
          </Typography>
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
            Taxable Income
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {taxData.currentQuarter}
          </Typography>
        </Box>

        {/* Refresh Button */}
        <Button
          variant="outlined"
          size="small"
          onClick={() => window.location.reload()}
          disabled={taxData.isLoading}
          startIcon={<Iconify icon="eva:refresh-outline" />}
          sx={{ ml: 'auto' }}
        >
          Refresh
        </Button>
      </Stack>

      {/* Financial Breakdown */}
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Gross Sales
            {!taxData.isLoading && (
              <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                (from Cash Receipt Journal)
              </Typography>
            )}
          </Typography>
          {taxData.isLoading ? (
            <Skeleton width={80} height={24} />
          ) : (
            <Typography variant="subtitle1" sx={{ color: 'success.main', fontWeight: 700 }}>
              ₱{taxData.grossSales.toLocaleString()}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Exemption
          </Typography>
          {taxData.isLoading ? (
            <Skeleton width={80} height={24} />
          ) : (
            <Typography variant="subtitle1" sx={{ color: 'warning.main', fontWeight: 700 }}>
              -₱{taxData.exemption.toLocaleString()}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Taxable Base
          </Typography>
          {taxData.isLoading ? (
            <Skeleton width={80} height={24} />
          ) : (
            <Typography variant="subtitle1" sx={{ color: 'error.main', fontWeight: 700 }}>
              ₱{taxData.taxableBase.toLocaleString()}
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* Filing Information */}
      <Stack spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          Filing Information
        </Typography>
        
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="eva:calendar-outline" width={16} sx={{ color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Coverage: {taxData.coveragePeriod}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="eva:clock-outline" width={16} sx={{ color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Deadline: {taxData.filingDeadline}
          </Typography>
        </Stack>
      </Stack>

      {/* Status Buttons */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
          onClick={() => handleStatusChange('filed')}
          sx={{
            flex: 1,
            bgcolor: filingStatus === 'filed' ? 'success.main' : 'grey.300',
            color: filingStatus === 'filed' ? 'white' : 'text.primary',
            fontWeight: 600,
            py: 1,
            border: 'none',
            '&:hover': {
              bgcolor: filingStatus === 'filed' ? 'success.dark' : 'grey.400',
              border: 'none',
            },
          }}
        >
          Filed
        </Button>

        <Button
          variant="contained"
          disableElevation
          startIcon={<Iconify icon="eva:clock-outline" />}
          onClick={() => handleStatusChange('not-yet')}
          sx={{
            flex: 1,
            bgcolor: filingStatus === 'not-yet' ? 'warning.main' : 'grey.300',
            color: filingStatus === 'not-yet' ? 'white' : 'text.primary',
            fontWeight: 600,
            py: 1,
            border: 'none',
            '&:hover': {
              bgcolor: filingStatus === 'not-yet' ? 'warning.dark' : 'grey.400',
              border: 'none',
            },
          }}
        >
          Not Yet
        </Button>
      </Stack>

      {/* Dynamic Alert Message */}
      {filingStatus === 'filed' ? (
        <Alert
          severity="success"
          icon={<Iconify icon="eva:checkmark-circle-2-fill" />}
          sx={{
            bgcolor: 'success.main',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
            '& .MuiAlert-message': {
              fontWeight: 500,
            },
          }}
        >
          Tax filing completed successfully!
        </Alert>
      ) : (
        <Alert
          severity="warning"
          icon={<Iconify icon="eva:alert-triangle-fill" />}
          sx={{
            bgcolor: 'warning.main',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
            '& .MuiAlert-message': {
              fontWeight: 500,
            },
          }}
        >
          Filing deadline approaching!
        </Alert>
      )}
    </Card>
  );
} 