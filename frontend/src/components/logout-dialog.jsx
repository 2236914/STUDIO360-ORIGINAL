'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function LogoutDialog({ open, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="eva:log-out-fill" sx={{ color: 'warning.main' }} />
          Confirm Logout
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography>
          Are you sure you want to logout? You will need to sign in again to access your account.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 2.5 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          color="warning"
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Iconify icon="eva:log-out-fill" />
            )
          }
        >
          {loading ? 'Logging out...' : 'Logout'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 