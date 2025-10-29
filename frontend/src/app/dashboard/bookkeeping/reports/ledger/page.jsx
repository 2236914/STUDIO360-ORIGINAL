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
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import axios from 'src/utils/axios';

function useMonthYear() {
  const now = new Date();
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [year, setYear] = useState(now.getUTCFullYear());
  return { month, setMonth, year, setYear };
}

export default function LedgerReportPage() {
  const { month, setMonth, year, setYear } = useMonthYear();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/bookkeeping/ledger', { params: { month, year } });
      const list = res?.data?.data?.ledger || [];
      setRows(list);
    } catch (_) { setRows([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [month, year]);

  const exportCsv = () => {
    const url = `/api/bookkeeping/reports/export?type=ledger&format=csv&month=${month}&year=${year}`;
    window.open(url, '_blank');
  };
  const doPrint = () => window.print();

  const totals = useMemo(() => {
    let dr = 0, cr = 0;
    for (const acc of rows) { dr += Number(acc?.totals?.debit || 0); cr += Number(acc?.totals?.credit || 0); }
    return { dr, cr };
  }, [rows]);

  return (
    <DashboardContent maxWidth="xl">
      <style>{`@media print { .no-print { display: none !important; }}`}</style>
      <Typography variant="h4" sx={{ mb: 1 }}>Ledger Report</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Dashboard / Bookkeeping / Reports / Ledger</Typography>

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
                <TableCell />
                <TableCell>Account</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((acc, idx) => (
                <>
                  <TableRow key={`acc-${idx}`} hover>
                    <TableCell width={48}>
                      <IconButton size="small" onClick={() => setOpen((p) => ({ ...p, [idx]: !p[idx] }))}>
                        <Iconify icon={open[idx] ? 'eva:arrow-down-fill' : 'eva:arrow-right-fill'} />
                      </IconButton>
                    </TableCell>
                    <TableCell>{acc.code} — {acc.accountTitle}</TableCell>
                    <TableCell align="right">{Number(acc?.totals?.debit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell align="right">{Number(acc?.totals?.credit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                  <TableRow key={`accd-${idx}`}>
                    <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                      <Collapse in={!!open[idx]} timeout="auto" unmountOnExit>
                        <Box sx={{ px: 2, py: 1 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Ref</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align="right">Debit</TableCell>
                                <TableCell align="right">Credit</TableCell>
                                <TableCell align="right">Balance</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(acc.entries || []).map((e, i) => (
                                <TableRow key={`e-${idx}-${i}`}>
                                  <TableCell>{e.date}</TableCell>
                                  <TableCell>{e.reference}</TableCell>
                                  <TableCell>{e.description}</TableCell>
                                  <TableCell align="right">{Number(e.debit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                  <TableCell align="right">{Number(e.credit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                  <TableCell align="right">{Number(e.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              ))}
              <TableRow>
                <TableCell />
                <TableCell align="right"><Typography variant="subtitle2">Totals</Typography></TableCell>
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


