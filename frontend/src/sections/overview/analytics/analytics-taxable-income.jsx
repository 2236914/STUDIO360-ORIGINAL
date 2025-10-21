'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AnalyticsTaxableIncome() {
  const [filingStatus, setFilingStatus] = useState('not-yet'); // 'filed' or 'not-yet'

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
        
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
            Taxable Income
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Current Quarter
          </Typography>
        </Box>
      </Stack>

      {/* Financial Breakdown */}
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Gross Sales
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'success.main', fontWeight: 700 }}>
            ₱0
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Exemption
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'warning.main', fontWeight: 700 }}>
            -₱0
          </Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Taxable Base
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'error.main', fontWeight: 700 }}>
            ₱0
          </Typography>
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
            Status
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="eva:clock-outline" width={16} sx={{ color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Deadline
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