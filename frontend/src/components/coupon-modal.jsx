'use client';

import { useEffect, useMemo, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { storefrontApi } from 'src/utils/api/storefront';

// ----------------------------------------------------------------------

export default function CouponModal({ storeId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState(null);
  const [email, setEmail] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const storageKey = useMemo(() => `coupon_shown_${storeId}`, [storeId]);
  const cooldownKey = useMemo(() => `coupon_cooldown_${storeId}`, [storeId]);

  useEffect(() => {
    let isMounted = true;

    async function loadCoupon() {
      try {
        if (!storeId) return;

        const alreadyShown = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : '1';
        const cooldownUntil = typeof window !== 'undefined' ? Number(localStorage.getItem(cooldownKey) || 0) : 0;
        const now = Date.now();
        // Prefer dedicated coupon endpoint; fallback to homepage if needed
        let couponData = null;
        const couponResp = await storefrontApi.getCoupon(storeId);
        if (couponResp?.success && couponResp?.data) {
          couponData = couponResp.data;
        } else {
          const homeResp = await storefrontApi.getHomepage(storeId);
          couponData = homeResp?.data?.coupon || null;
        }

        if (isMounted) {
          setCoupon(couponData);
          // On storefront, always treat coupon as enabled if it exists (ignore dashboard enabled flag for modal)
          const enabled = Boolean(couponData);
          const shouldOpen = enabled && (!alreadyShown || now > cooldownUntil);
          setOpen(shouldOpen);
        }
      } catch (err) {
        // Fail silently for storefront
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCoupon();
    return () => {
      isMounted = false;
    };
  }, [storeId, storageKey]);

  const handleClose = () => {
    setOpen(false);
    try {
      localStorage.setItem(storageKey, '1');
      // Set a 7-day cooldown so it can reappear after that period
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(cooldownKey, String(Date.now() + sevenDaysMs));
    } catch (_) {
      // ignore
    }
  };

  const handleReveal = () => {
    if (!email.trim()) return;
    setSubmitting(true);
    (async () => {
      try {
        await storefrontApi.subscribeNewsletter(storeId, { email, name: '' });
      } catch (_) {
        // ignore errors
      } finally {
        setRevealed(true);
        setSubmitting(false);
      }
    })();
  };

  const handleCopy = async () => {
    const code = coupon?.button_text || coupon?.buttonText || '';
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch (_) {
      // ignore
    }
  };

  if (loading) return null;
  if (!coupon || !coupon.enabled) return null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {coupon?.headline || 'Get a discount on your first order'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {coupon?.subtext || 'Enter your email to reveal your coupon code.'}
          </Typography>

          {!revealed ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="contained" onClick={handleReveal} disabled={submitting}>
                Reveal
              </Button>
            </Stack>
          ) : (
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {coupon?.button_text || coupon?.buttonText || 'WELCOME'}
              </Typography>
              <Button variant="outlined" onClick={handleCopy}>
                Copy code
              </Button>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}


