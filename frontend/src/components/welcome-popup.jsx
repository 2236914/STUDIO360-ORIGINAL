'use client';

import { useEffect, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { storefrontApi } from 'src/utils/api/storefront';

function WelcomePopup({ storeId }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!storeId) return;
        // Only show once per session
        if (sessionStorage.getItem('welcome_popup_dismissed') === '1') return;
        const resp = await storefrontApi.getWelcomePopup(storeId);
        const popup = resp?.data || resp; // support {success,data} or raw
        if (mounted && popup?.enabled) {
          setData(popup);
          setOpen(true);
        }
      } catch (_) {}
    })();
    return () => { mounted = false; };
  }, [storeId]);

  const handleClose = () => {
    sessionStorage.setItem('welcome_popup_dismissed', '1');
    setOpen(false);
  };

  if (!data) return null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>{data.title || 'Welcome!'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {data.subtitle || 'Thanks for visiting our store.'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">Continue</Button>
      </DialogActions>
    </Dialog>
  );
}

export default WelcomePopup;
export { WelcomePopup };