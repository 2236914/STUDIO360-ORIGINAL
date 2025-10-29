'use client';

import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import { DashboardContent } from 'src/layouts/dashboard';
import axios from 'src/utils/axios';

function useMonthYear() {
  const now = new Date();
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [year, setYear] = useState(now.getUTCFullYear());
  return { month, setMonth, year, setYear };
}

export default function JournalReportPage() {
  const { month, setMonth, year, setYear } = useMonthYear();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/bookkeeping/journal', { params: { page: 1, limit: 100000, month, year } });
      const list = res?.data?.data?.journal || [];
      setRows(list);
    } catch (_) { setRows([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [month, year]);

  const totals = useMemo(() => {
    let dr = 0, cr = 0;
    for (const e of rows) for (const l of e.lines || []) { dr += Number(l.debit || 0); cr += Number(l.credit || 0); }
    return { dr, cr };
  }, [rows]);

  const exportCsv = () => {
    const url = `/api/bookkeeping/reports/export?type=journal&format=csv&month=${month}&year=${year}`;
    window.open(url, '_blank');
  };
  const doPrint = () => window.print();

  return (
    <DashboardContent maxWidth="xl">
      <style>{`@media print { .no-print { display: none !important; }}`}</style>
      <Typography variant="h4" sx={{ mb: 1 }}>Journal Report</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Dashboard / Bookkeeping / Reports / Journal</Typography>

      <Card sx={{ p: 2, mb: 2 }} className="no-print">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField select label="Month" value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))} sx={{ width: 140 }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (<MenuItem key={m} value={m}>{m}</MenuItem>))}
          </TextField>
          <TextField label="Year" type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10) || year)} sx={{ width: 140 }} />
          <Button variant="outlined" onClick={load} disabled={loading}>Refresh</Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={exportCsv}>Export CSV</Button>
          <Button variant="contained" onClick={doPrint}>Print</Button>
        </Stack>
      </Card>

      <Card sx={{ p: 2 }}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Ref</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.flatMap((e, idx) => (e.lines || []).map((l, i) => (
                <TableRow key={`${idx}-${i}`}>
                  <TableCell>{e.date}</TableCell>
                  <TableCell>{e.ref}</TableCell>
                  <TableCell>{l.code}</TableCell>
                  <TableCell>{l.description}</TableCell>
                  <TableCell align="right">{Number(l.debit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell align="right">{Number(l.credit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
              )))}
              <TableRow>
                <TableCell colSpan={4} align="right"><Typography variant="subtitle2">Totals</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2">{totals.dr.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2">{totals.cr.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</Typography></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </DashboardContent>
  );
}


