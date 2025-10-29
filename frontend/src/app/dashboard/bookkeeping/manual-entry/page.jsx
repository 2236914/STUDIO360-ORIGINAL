'use client';

import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';
import axios from 'src/utils/axios';
import { DashboardContent } from 'src/layouts/dashboard';

function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios.get('/api/bookkeeping/accounts')
      .then((res) => {
        const list = res?.data?.data?.accounts || [];
        if (mounted) setAccounts(list);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  return { accounts, loading };
}

export default function ManualJournalEntryPage() {
  const { accounts } = useAccounts();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [ref, setRef] = useState('');
  const [particulars, setParticulars] = useState('');
  const [lines, setLines] = useState([{ code: '', description: '', debit: '', credit: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const totals = useMemo(() => {
    let dr = 0, cr = 0;
    for (const l of lines) {
      dr += Number(l.debit || 0);
      cr += Number(l.credit || 0);
    }
    return { dr, cr, balanced: Math.abs(dr - cr) <= 0.005 };
  }, [lines]);

  const setLine = (idx, patch) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };
  const addLine = () => setLines((prev) => [...prev, { code: '', description: '', debit: '', credit: '' }]);
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setMessage(null);
    if (!date) { setMessage({ type: 'error', text: 'Date is required' }); return; }
    if (lines.filter((l) => Number(l.debit || 0) > 0 || Number(l.credit || 0) > 0).length < 2) {
      setMessage({ type: 'error', text: 'At least two lines with amounts are required' });
      return;
    }
    if (!totals.balanced) { setMessage({ type: 'error', text: 'Debits must equal credits' }); return; }
    const payload = {
      date,
      ref: ref || undefined,
      particulars: particulars || '',
      lines: lines.map((l) => ({
        code: l.code,
        description: l.description || '',
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0),
      })),
    };
    setSubmitting(true);
    try {
      const res = await axios.post('/api/bookkeeping/journal', payload);
      const ok = !!res?.data?.success;
      if (ok) {
        setMessage({ type: 'success', text: 'Journal saved' });
        // Reset lines for next entry
        setLines([{ code: '', description: '', debit: '', credit: '' }]);
        if (!ref) setRef(res?.data?.data?.entry?.ref || '');
      } else {
        setMessage({ type: 'error', text: res?.data?.message || 'Failed to save journal' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: e?.response?.data?.message || e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardContent maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 1 }}>Manual Journal Entry</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Dashboard / Bookkeeping / Manual Entry</Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>
      )}

      <Card sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} sx={{ maxWidth: 260 }} />
            <TextField label="Reference" value={ref} onChange={(e) => setRef(e.target.value)} sx={{ maxWidth: 260 }} />
            <TextField label="Particulars" fullWidth value={particulars} onChange={(e) => setParticulars(e.target.value)} />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            {lines.map((l, idx) => (
              <Stack key={idx} direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center">
                <TextField select label="Account" value={l.code} onChange={(e) => setLine(idx, { code: e.target.value })} sx={{ minWidth: 260 }}>
                  {accounts.map((a) => (
                    <MenuItem key={a.code} value={a.code}>{`${a.code} — ${a.title}`}</MenuItem>
                  ))}
                </TextField>
                <TextField label="Description" value={l.description} onChange={(e) => setLine(idx, { description: e.target.value })} sx={{ flex: 1 }} />
                <TextField type="number" label="Debit" value={l.debit} onChange={(e) => setLine(idx, { debit: e.target.value })} sx={{ width: 160 }} />
                <TextField type="number" label="Credit" value={l.credit} onChange={(e) => setLine(idx, { credit: e.target.value })} sx={{ width: 160 }} />
                <IconButton onClick={() => removeLine(idx)} disabled={lines.length <= 1} color="error"><Iconify icon="eva:trash-2-fill" /></IconButton>
              </Stack>
            ))}
            <Box>
              <Button size="small" onClick={addLine} startIcon={<Iconify icon="eva:plus-fill" />}>Add Line</Button>
            </Box>
          </Stack>

          <Divider />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">Totals — Debit: {totals.dr.toFixed(2)} • Credit: {totals.cr.toFixed(2)}</Typography>
            {!totals.balanced && (
              <Typography variant="caption" color="error">Not balanced</Typography>
            )}
            <Button variant="contained" disabled={submitting || !totals.balanced} onClick={handleSubmit}>Save Journal</Button>
          </Stack>
        </Stack>
      </Card>
    </DashboardContent>
  );
}


