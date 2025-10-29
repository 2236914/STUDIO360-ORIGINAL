import { useState, useEffect } from 'react';
import { Container, Typography, Tabs, Tab, Stack, Button, TextField } from '@mui/material';
import dayjs from 'dayjs';
import { getIncomeStatement, getBalanceSheet, getCashFlow, getTrialBalance, exportReport } from 'src/services/reportsService';

// ----------------------------------------------------------------------

export const metadata = { title: 'Reports | Bookkeeping | Kitsch Studio' };

export default function BookkeepingReportsPage() {
  const [tab, setTab] = useState('is');
  const [from, setFrom] = useState(dayjs().startOf('year').format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));
  const [asOf, setAsOf] = useState(dayjs().format('YYYY-MM-DD'));
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, from, to, asOf]);

  const load = async () => {
    try {
      if (tab === 'is') {
        const d = await getIncomeStatement({ from, to });
        setData(d);
      } else if (tab === 'bs') {
        const d = await getBalanceSheet({ asOf });
        setData(d);
      } else if (tab === 'cf') {
        const d = await getCashFlow({ from, to, method: 'indirect' });
        setData(d);
      } else if (tab === 'tb') {
        const d = await getTrialBalance({ asOf });
        setData(d);
      }
    } catch (e) {
      setData({ error: e.message });
    }
  };

  const onExport = async (format) => {
    const typeMap = { is: 'journal', bs: 'ledger', cf: 'ledger', tb: 'ledger' };
    const params = tab === 'is' || tab === 'cf' ? { from, to } : { asOf };
    await exportReport({ type: typeMap[tab], format, params });
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Financial Reports
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="is" label="Income Statement" />
        <Tab value="bs" label="Balance Sheet" />
        <Tab value="cf" label="Cash Flow" />
        <Tab value="tb" label="Trial Balance" />
      </Tabs>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2 }}>
        {(tab === 'is' || tab === 'cf') && (
          <>
            <TextField type="date" label="From" value={from} onChange={(e) => setFrom(e.target.value)} sx={{ maxWidth: 220 }} InputLabelProps={{ shrink: true }} />
            <TextField type="date" label="To" value={to} onChange={(e) => setTo(e.target.value)} sx={{ maxWidth: 220 }} InputLabelProps={{ shrink: true }} />
          </>
        )}
        {(tab === 'bs' || tab === 'tb') && (
          <TextField type="date" label="As of" value={asOf} onChange={(e) => setAsOf(e.target.value)} sx={{ maxWidth: 220 }} InputLabelProps={{ shrink: true }} />
        )}

        <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
          <Button variant="outlined" onClick={() => onExport('csv')}>Export CSV</Button>
          <Button variant="outlined" onClick={() => onExport('xlsx')}>Export Excel</Button>
          <Button variant="contained" onClick={() => onExport('pdf')}>Export PDF</Button>
        </Stack>
      </Stack>

      {/* Basic data preview */}
      {data?.error && (
        <Typography color="error" sx={{ mt: 2 }}>{data.error}</Typography>
      )}
      {tab === 'is' && data && (
        <Typography variant="body2">Net Income: ₱{Number(data?.totals?.netIncome || 0).toLocaleString()}</Typography>
      )}
      {tab === 'bs' && data && (
        <Typography variant="body2">Assets: ₱{Number(data?.totals?.assets || 0).toLocaleString()} | Liabilities+Equity: ₱{Number((data?.totals?.liabilities || 0) + (data?.totals?.equity || 0)).toLocaleString()}</Typography>
      )}
      {tab === 'cf' && data && (
        <Typography variant="body2">Net Cash Change: ₱{Number(data?.totals?.netChange || 0).toLocaleString()}</Typography>
      )}
      {tab === 'tb' && data && (
        <Typography variant="body2">Total Debit: ₱{Number(data?.totals?.debit || 0).toLocaleString()} | Total Credit: ₱{Number(data?.totals?.credit || 0).toLocaleString()}</Typography>
      )}
    </Container>
  );
} 