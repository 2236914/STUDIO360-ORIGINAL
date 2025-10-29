'use client';

import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Table, Paper, TableRow, TableBody, TableCell, TableHead, TableContainer } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import axios from 'src/utils/axios';
import { fNumber } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function toCsv(headers, rows) {
  const escape = (v) => String(v == null ? '' : v).replace(/"/g, '""');
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => escape(r[h])).join(','));
  }
  return lines.join('\n');
}

export default function FinancialReportsPage() {
  useEffect(() => {
    document.title = 'Bookkeeping - Financial Reports | Kitsch Studio';
  }, []);

  const [summary, setSummary] = useState([]); // [{ code, accountTitle, debit, credit, balance, balanceSide }]
  const [activeTab, setActiveTab] = useState(0); // 0: TB, 1: IS, 2: BS
  const [month, setMonth] = useState(''); // '' = all
  const [year, setYear] = useState(new Date().getFullYear());
  // Shop profile for print header
  const shop = useMemo(() => ({
    shopname: process.env.NEXT_PUBLIC_SHOP_NAME || process.env.NEXT_PUBLIC_STORE_NAME || 'Shop',
    name: process.env.NEXT_PUBLIC_OWNER_NAME || '',
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '',
    contact: process.env.NEXT_PUBLIC_BUSINESS_CONTACT || process.env.NEXT_PUBLIC_BUSINESS_PHONE || '',
    logo: process.env.NEXT_PUBLIC_SHOP_LOGO_URL || '/logo.png',
  }), []);
  const [logoUrl, setLogoUrl] = useState('');
  const [shopName, setShopName] = useState('');
  const resolvedLogo = useMemo(() => {
    const raw = logoUrl || shop.logo;
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    const base = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || '';
    const path = raw.replace(/^\/?/, '');
    return base ? `${base}/${path}` : `/${path}`;
  }, [logoUrl, shop.logo]);
  const monthLabel = month ? new Date(2000, Number(month) - 1, 1).toLocaleString('en-US', { month: 'long' }) : 'All Months';
  const printedAt = useMemo(() => new Date().toLocaleString(), []);

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams();
        params.set('summary', '1');
        if (month) params.set('month', String(month));
        if (year) params.set('year', String(year));
        const res = await axios.get(`/api/bookkeeping/ledger?${params.toString()}`);
        setSummary(res?.data?.data?.summary || []);
      } catch (e) {
        console.error('Failed to load ledger summary', e);
      }
    };
    load();
  }, [month, year]);

  // Load shop profile (name + photo). Fallback to platforms.logo_url, then env.
  useEffect(() => {
    const run = async () => {
      try {
        const info = await axios.get('/api/shop/info');
        const si = info?.data?.data || {};
        if (si?.profile_photo_url) setLogoUrl(si.profile_photo_url);
        if (si?.shop_name) setShopName(si.shop_name);
      } catch (_) { /* ignore and try platforms */ }
      try {
        if (!logoUrl) {
          const r = await axios.get('/api/store-pages/homepage/platforms');
          const list = r?.data?.data || [];
          const first = Array.isArray(list) ? list.find(p => p.logo_url) || list[0] : null;
          if (first?.logo_url) setLogoUrl(first.logo_url);
        }
      } catch (_) {
        // ignore; fall back to env logo
      }
    };
    run();
  }, []);

  // Helpers to classify accounts by code prefix
  const sumSigned = (rows) => rows.reduce((s, r) => s + (r.balanceSide === 'debit' ? Number(r.balance || 0) : -Number(r.balance || 0)), 0);
  const filterByPrefix = (prefix) => (summary || []).filter((x) => String(x.code || '').startsWith(prefix));

  // Trial Balance: show ending balance on its normal side
  const trialRows = useMemo(() => {
    return (summary || []).map((r) => ({
      code: r.code,
      account: r.accountTitle,
      debit: r.balanceSide === 'debit' ? Number(r.balance || 0) : 0,
      credit: r.balanceSide === 'credit' ? Number(r.balance || 0) : 0,
    }));
  }, [summary]);
  const tbTotals = useMemo(() => ({
    debit: trialRows.reduce((s, r) => s + Number(r.debit || 0), 0),
    credit: trialRows.reduce((s, r) => s + Number(r.credit || 0), 0),
  }), [trialRows]);

  // Income Statement: Revenues (4xx) - Expenses (5xx)
  const revenueRows = useMemo(() => filterByPrefix('4'), [summary]);
  const expenseRows = useMemo(() => filterByPrefix('5'), [summary]);
  const totalRevenue = useMemo(() => sumSigned(revenueRows) * -1, [revenueRows]); // credits positive
  const totalExpenses = useMemo(() => sumSigned(expenseRows), [expenseRows]); // debits positive
  const netIncome = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);

  // Balance Sheet: Assets (1xx), Liabilities (2xx), Equity (3xx)
  const assets = useMemo(() => sumSigned(filterByPrefix('1')), [summary]);
  const liabilities = useMemo(() => sumSigned(filterByPrefix('2')) * -1, [summary]);
  const equity = useMemo(() => (sumSigned(filterByPrefix('3')) * -1) + netIncome, [summary, netIncome]);

  const exportCsv = (name, headers, rows) => {
    const csv = toCsv(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const suffix = `${year || 'all'}${month ? '-' + String(month).padStart(2,'0') : ''}`;
    a.download = `${name}_${suffix}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardContent maxWidth="xl">
      <style jsx global>{`
        @media print {
          header, nav, aside, .no-print { display: none !important; }
          .print-container { padding: 0 !important; }
          .print-card { box-shadow: none !important; border: none !important; }
          .table-bordered td, .table-bordered th { border: 1px solid #ccc !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .only-print { display: block !important; }
        }
        @media screen { .only-print { display: none; } }
      `}</style>
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }} className="no-print">
        Financial Reports
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }} className="no-print">
        Dashboard / Bookkeeping / Financial Reports
      </Typography>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 2 }} className="no-print">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <TextField
            select
            label="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
              <MenuItem key={m} value={m}>{new Date(2000, m-1, 1).toLocaleString('en-US',{month:'long'})}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{ minWidth: 140 }}
          >
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" onClick={() => window.print()} startIcon={<Iconify icon="eva:printer-fill" />}>Print</Button>
        </Stack>
      </Card>

      {/* Print Header (only on printed page) */}
      <Box className="only-print" sx={{ mb: 2 }}>
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap: 1 }}>
            {/* Logo (optional) */}
            <img src={resolvedLogo} alt="Shop Logo" style={{ height: 40, width: 'auto' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{shopName || shop.shopname}</Typography>
          </Box>
          {shop.name && <Typography variant="body2">{shop.name}</Typography>}
          {shop.address && <Typography variant="body2">{shop.address}</Typography>}
          {shop.contact && <Typography variant="body2">{shop.contact}</Typography>}
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2">Current Date: {new Date().toLocaleDateString()}</Typography>
          <Typography variant="body2">Period: {monthLabel} {year}</Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Card
        sx={{
          p: 0,
          mb: 3,
          border: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: 'background.paper',
          position: { md: 'sticky' },
          top: { md: 72 },
          zIndex: 10,
        }}
        className="no-print"
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          allowScrollButtonsMobile
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 44,
            px: 1,
            '& .MuiTabs-indicator': { height: 3, borderRadius: 3 },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 44,
              px: { xs: 1.25, sm: 2 },
            },
          }}
        >
          <Tab icon={<Iconify icon="solar:book-bold" width={18} />} iconPosition="start" label="Trial Balance" />
          <Tab icon={<Iconify icon="solar:chart-2-bold" width={18} />} iconPosition="start" label="Income Statement" />
          <Tab icon={<Iconify icon="solar:card-bold" width={18} />} iconPosition="start" label="Balance Sheet" />
        </Tabs>
      </Card>

      {/* Trial Balance */}
      <Card sx={{ p: 3, mb: 3, display: activeTab === 0 ? 'block' : 'none' }} className="print-card">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Trial Balance</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton
              title="Export CSV"
              sx={{ color: 'success.main' }}
              onClick={() => {
                const headers = ['code','account','debit','credit'];
                exportCsv('trial_balance', headers, trialRows.map(r => ({ ...r, debit: r.debit.toFixed(2), credit: r.credit.toFixed(2) })));
              }}
            >
              <Iconify icon="logos:excel" />
            </IconButton>
            <IconButton title="Print" onClick={() => window.print()} sx={{ color: 'text.secondary' }}>
              <Iconify icon="eva:printer-fill" />
            </IconButton>
          </Stack>
        </Stack>
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table size="small" className="table-bordered">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Account</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trialRows.map((r) => (
                <TableRow key={r.code}>
                  <TableCell>{r.code}</TableCell>
                  <TableCell>{r.account}</TableCell>
                  <TableCell align="right">₱{fNumber(r.debit)}</TableCell>
                  <TableCell align="right">₱{fNumber(r.credit)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>₱{fNumber(tbTotals.debit)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>₱{fNumber(tbTotals.credit)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Income Statement */}
      <Card sx={{ p: 3, mb: 3, display: activeTab === 1 ? 'block' : 'none' }} className="print-card">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Income Statement</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton
              title="Export CSV"
              sx={{ color: 'success.main' }}
              onClick={() => {
                const headers = ['section','amount'];
                exportCsv('income_statement', headers, [
                  { section: 'Total Revenue', amount: totalRevenue.toFixed(2) },
                  { section: 'Total Expenses', amount: totalExpenses.toFixed(2) },
                  { section: 'Net Income', amount: netIncome.toFixed(2) },
                ]);
              }}
            >
              <Iconify icon="logos:excel" />
            </IconButton>
            <IconButton title="Print" onClick={() => window.print()} sx={{ color: 'text.secondary' }}>
              <Iconify icon="eva:printer-fill" />
            </IconButton>
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Revenue</Typography>
            <Typography sx={{ fontWeight: 600 }}>₱{fNumber(totalRevenue)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Expenses</Typography>
            <Typography sx={{ fontWeight: 600 }}>₱{fNumber(totalExpenses)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography>Net Income</Typography>
            <Typography sx={{ fontWeight: 700, color: netIncome >= 0 ? 'success.main' : 'error.main' }}>₱{fNumber(netIncome)}</Typography>
          </Box>
        </Stack>
      </Card>

      {/* Balance Sheet */}
      <Card sx={{ p: 3, display: activeTab === 2 ? 'block' : 'none' }} className="print-card">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Balance Sheet</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton
              title="Export CSV"
              sx={{ color: 'success.main' }}
              onClick={() => {
                const headers = ['section','amount'];
                exportCsv('balance_sheet', headers, [
                  { section: 'Assets', amount: assets.toFixed(2) },
                  { section: 'Liabilities', amount: liabilities.toFixed(2) },
                  { section: 'Equity (incl. Net Income)', amount: equity.toFixed(2) },
                ]);
              }}
            >
              <Iconify icon="logos:excel" />
            </IconButton>
            <IconButton title="Print" onClick={() => window.print()} sx={{ color: 'text.secondary' }}>
              <Iconify icon="eva:printer-fill" />
            </IconButton>
          </Stack>
        </Stack>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Assets</Typography>
            <Typography sx={{ fontWeight: 600 }}>₱{fNumber(assets)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Liabilities</Typography>
            <Typography sx={{ fontWeight: 600 }}>₱{fNumber(liabilities)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Equity (incl. Net Income)</Typography>
            <Typography sx={{ fontWeight: 600 }}>₱{fNumber(equity)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography>Assets</Typography>
            <Typography sx={{ fontWeight: 700 }}>₱{fNumber(assets)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Liabilities + Equity</Typography>
            <Typography sx={{ fontWeight: 700 }}>₱{fNumber(liabilities + equity)}</Typography>
          </Box>
        </Stack>
      </Card>
    </DashboardContent>
  );
}


