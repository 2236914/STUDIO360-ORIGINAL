'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import axios from 'src/utils/axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { fNumber } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse } from '@mui/material';

// ----------------------------------------------------------------------

const MOCK_LEDGER_ENTRIES = [
  {
    id: 1,
    date: 'Sep 1, 2024',
    description: 'Initial capital investment',
    ref: 'CR01',
    type: 'credit',
    amount: 200000,
    balance: 200000,
  },
  {
    id: 2,
    date: 'Sep 5, 2024',
    description: 'Office supplies purchase',
    ref: 'CD01',
    type: 'debit',
    amount: 15000,
    balance: 185000,
  },
  {
    id: 3,
    date: 'Sep 5, 2024',
    description: 'Loan from family members',
    ref: 'CR02',
    type: 'credit',
    amount: 100000,
    balance: 285000,
  },
  {
    id: 4,
    date: 'Sep 10, 2024',
    description: 'Monthly rent payment',
    ref: 'CD02',
    type: 'debit',
    amount: 25000,
    balance: 260000,
  },
  {
    id: 5,
    date: 'Sep 15, 2024',
    description: 'Equipment purchase',
    ref: 'CD03',
    type: 'debit',
    amount: 50000,
    balance: 210000,
  },
  {
    id: 6,
    date: 'Sep 20, 2024',
    description: 'Sales revenue',
    ref: 'CR03',
    type: 'credit',
    amount: 75000,
    balance: 285000,
  },
  {
    id: 7,
    date: 'Sep 25, 2024',
    description: 'Utility bills payment',
    ref: 'CD04',
    type: 'debit',
    amount: 8000,
    balance: 277000,
  },
  {
    id: 8,
    date: 'Sep 28, 2024',
    description: 'Additional investment',
    ref: 'CR04',
    type: 'credit',
    amount: 50000,
    balance: 327000,
  },
  {
    id: 9,
    date: 'Sep 30, 2024',
    description: 'Insurance payment',
    ref: 'CD05',
    type: 'debit',
    amount: 12000,
    balance: 315000,
  },
  {
    id: 10,
    date: 'Sep 30, 2024',
    description: 'Service income',
    ref: 'CR05',
    type: 'credit',
    amount: 45000,
    balance: 360000,
  },
  {
    id: 11,
    date: 'Sep 30, 2024',
    description: 'Final expenses',
    ref: 'CD06',
    type: 'debit',
    amount: 81258.96,
    balance: 278741.04,
  },
];

export default function GeneralLedgerPage() {
  useEffect(() => {
    document.title = 'Bookkeeping - General Ledger | Kitsch Studio';
  }, []);
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('All');
  const [accounts, setAccounts] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false); // (unused add dialog retained for future)
  const [ledgerSummary, setLedgerSummary] = useState([]); // per-account totals
  const [ledgerDetail, setLedgerDetail] = useState([]); // full ledger with entries
  const [expanded, setExpanded] = useState(()=> new Set()); // expanded account codes
    const [newEntry, setNewEntry] = useState({
      date: '',
      description: '',
      ref: '',
      type: 'debit',
      amount: '',
    });
  // Runtime month label (e.g., "September 2025")
  const [monthLabel, setMonthLabel] = useState('');
  useEffect(() => {
    try {
      const label = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
      setMonthLabel(label);
    } catch (_) {
      // Fallback simple formatter
      const d = new Date();
      setMonthLabel(`${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`);
    }
  }, []);

  // Filter by selected account and search query (code/title or any entry fields)
  const filteredRows = (() => {
    const q = (searchQuery || '').trim().toLowerCase();
    const base = selectedAccount === 'All' ? ledgerSummary : ledgerSummary.filter((a) => a.code === selectedAccount);
    if (!q) return base;
    return base.filter((acc) => {
      const codeMatch = String(acc.code || '').toLowerCase().includes(q);
      const titleMatch = String(acc.accountTitle || '').toLowerCase().includes(q);
      if (codeMatch || titleMatch) return true;
      const detail = ledgerDetail.find((l) => l.code === acc.code);
      const entries = detail?.entries || [];
      return entries.some((e) => {
        const desc = String(e.description || '').toLowerCase();
        const ref = String(e.reference || '').toLowerCase();
        const date = String(e.date || '').toLowerCase();
        const debit = typeof e.debit === 'number' ? String(e.debit) : String(e.debit || '');
        const credit = typeof e.credit === 'number' ? String(e.credit) : String(e.credit || '');
        return (
          desc.includes(q) || ref.includes(q) || date.includes(q) || debit.includes(q) || credit.includes(q)
        );
      });
    });
  })();
  const TOTAL_DEBIT = filteredRows.reduce((sum, acc) => sum + Number(acc.debit || 0), 0);
  const TOTAL_CREDIT = filteredRows.reduce((sum, acc) => sum + Number(acc.credit || 0), 0);

    // Fetch ledger summary (memoized)
    const fetchLedger = useCallback(async () => {
      try {
        const res = await axios.get('/api/bookkeeping/ledger'); // get full (summary + entries)
        const dataSummary = res?.data?.data?.summary || [];
        const dataLedger = res?.data?.data?.ledger || [];
        const acct = res?.data?.data?.accounts || [];
        setLedgerSummary(dataSummary);
        setLedgerDetail(dataLedger);
        setAccounts(acct);
      } catch (err) {
        console.error('Failed to load ledger:', err);
      }
    }, []);

    // Initial load
    useEffect(() => { fetchLedger(); }, [fetchLedger]);

    // Listen for cross-page posting flag (sales or other books) -> auto-refresh
    useEffect(() => {
      let timer; // polling fallback if storage event not triggered in same tab
      const KEY = 'ledgerNeedsRefresh';
      const check = () => {
        try {
          const v = window.localStorage.getItem(KEY);
          if (v === '1') {
            window.localStorage.setItem(KEY, '0');
            fetchLedger();
          }
        } catch (_) { /* ignore */ }
      };
      const onStorage = (e) => { if (e.key === KEY && e.newValue === '1') check(); };
      window.addEventListener('storage', onStorage);
      timer = setInterval(check, 4000); // light polling safety
      return () => { window.removeEventListener('storage', onStorage); clearInterval(timer); };
    }, [fetchLedger]);

  // (Manual add function removed – general ledger derived from journals; kept placeholder if needed later)

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        General Ledger
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Dashboard / Bookkeeping / General Ledger
      </Typography>

      {/* Overview Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Iconify icon="eva:info-fill" width={24} sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              General Ledger Overview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Track all account transactions with running balances. View debits, credits, and real-time balance calculations 
              for your business accounts including Cash, Accounts Receivable, and more.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Filters & Actions */}
      <Card sx={{ p: 3, mb: 3 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>Filters & Actions</Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <TextField
            select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            sx={{ minWidth: 240 }}
            label="Account (COA)"
          >
            <MenuItem value="All">All Accounts</MenuItem>
            {accounts.map((acc) => (
              <MenuItem key={acc.code} value={acc.code}>
                {acc.code} — {acc.title}
              </MenuItem>
            ))}
          </TextField>
          
          {/* No manual add in summary view */}
        </Stack>
      </Card>

      {/* General Ledger Table */}
      <Card sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              GENERAL LEDGER
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {ledgerSummary.length} accounts • {monthLabel || ''}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mt: 0.5 }}>SUMMARY (Totals per Account)</Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <IconButton
              sx={{ color: 'text.secondary' }}
              onClick={() => {
                fetchLedger();
              }}
              title="Refresh"
            >
              <Iconify icon="eva:refresh-fill" />
            </IconButton>
            <IconButton sx={{ color: 'text.secondary' }} title="Print">
              <Iconify icon="eva:printer-fill" />
            </IconButton>
          </Stack>
        </Stack>

        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
          <Table sx={{ '& .MuiTableCell-root': { py: 1, px: 1.5 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Account Code</TableCell>
                <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Account Title</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Debit</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Credit</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((acc, index) => {
                const isExpanded = expanded.has(acc.code);
                const detail = ledgerDetail.find(l => l.code === acc.code);
                const entriesAll = detail?.entries || [];
                const q = (searchQuery || '').trim().toLowerCase();
                const entries = q
                  ? entriesAll.filter((e) => {
                      const desc = String(e.description || '').toLowerCase();
                      const ref = String(e.reference || '').toLowerCase();
                      const date = String(e.date || '').toLowerCase();
                      const debit = typeof e.debit === 'number' ? String(e.debit) : String(e.debit || '');
                      const credit = typeof e.credit === 'number' ? String(e.credit) : String(e.credit || '');
                      return desc.includes(q) || ref.includes(q) || date.includes(q) || debit.includes(q) || credit.includes(q);
                    })
                  : entriesAll;
                return (
                  <Fragment key={`row-${acc.code}`}>
                    <TableRow key={acc.code}
                      sx={{ '&:hover': { bgcolor: 'grey.50' }, bgcolor: index % 2 === 0 ? 'white' : 'grey.25', borderBottom: `1px solid ${theme.palette.divider}`, cursor: 'pointer' }}
                      onClick={() => {
                        setExpanded(prev => {
                          const next = new Set(prev);
                          if (next.has(acc.code)) next.delete(acc.code); else next.add(acc.code);
                          return next;
                        });
                      }}
                    >
                      <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}`, display:'flex', alignItems:'center', gap:0.5 }}>
                        {entries.length > 0 ? (
                          isExpanded ? (
                            <Iconify icon="eva:arrow-ios-downward-fill" width={16} />
                          ) : (
                            <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
                          )
                        ) : null}
                        {acc.code}
                      </TableCell>
                      <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>{acc.accountTitle}</TableCell>
                      <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>₱{fNumber(acc.debit)}</TableCell>
                      <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>₱{fNumber(acc.credit)}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: acc.balanceSide === 'debit' ? 'error.main' : 'success.main' }}>
                          ₱{fNumber(acc.balance)} {acc.balanceSide === 'debit' ? 'Dr' : 'Cr'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {isExpanded && entries.length > 0 && (
                      <TableRow key={`${acc.code}-details`} sx={{ bgcolor: 'background.default' }}>
                        <TableCell colSpan={5} sx={{ py:0, borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p:1.5, pt:0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight:600, display:'block', mb:0.5 }}>Entries</Typography>
                              <Table size="small" sx={{ '& .MuiTableCell-root': { py:0.5, px:1 } }}>
                                <TableHead>
                                  <TableRow sx={{ bgcolor:'grey.100' }}>
                                    <TableCell sx={{ fontSize:11, fontWeight:600 }}>Date</TableCell>
                                    <TableCell sx={{ fontSize:11, fontWeight:600 }}>Description</TableCell>
                                    <TableCell sx={{ fontSize:11, fontWeight:600 }}>Ref</TableCell>
                                    <TableCell align="right" sx={{ fontSize:11, fontWeight:600 }}>Debit</TableCell>
                                    <TableCell align="right" sx={{ fontSize:11, fontWeight:600 }}>Credit</TableCell>
                                    <TableCell align="right" sx={{ fontSize:11, fontWeight:600 }}>Running Bal.</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {entries.map((e,i) => (
                                    <TableRow key={`${acc.code}-${e.reference||''}-${e.date||''}-${e.debit||0}-${e.credit||0}-${i}`} sx={{ '&:hover': { bgcolor:'grey.50' } }}>
                                      <TableCell sx={{ fontSize:11 }}>{e.date || ''}</TableCell>
                                      <TableCell sx={{ fontSize:11, maxWidth:240, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{e.description || ''}</TableCell>
                                      <TableCell sx={{ fontSize:11 }}>{e.reference || ''}</TableCell>
                                      <TableCell align="right" sx={{ fontSize:11 }}>{e.debit ? `₱${fNumber(e.debit)}` : ''}</TableCell>
                                      <TableCell align="right" sx={{ fontSize:11 }}>{e.credit ? `₱${fNumber(e.credit)}` : ''}</TableCell>
                                      <TableCell align="right" sx={{ fontSize:11, fontWeight:600 }}>{typeof e.balance==='number' ? `₱${fNumber(e.balance)}` : ''}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
              <TableRow sx={{ bgcolor: '#E3F2FD', borderTop: `2px solid ${theme.palette.primary.main}` }}>
                <TableCell colSpan={2} sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>TOTAL</Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>₱{fNumber(TOTAL_DEBIT)}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>₱{fNumber(TOTAL_CREDIT)}</Typography>
                </TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableBody>
          </Table>
                 </TableContainer>
       </Card>
      {/* Manual add removed in summary view */}
     </DashboardContent>
   );
 } 