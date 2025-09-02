'use client';

import { useState, useEffect } from 'react';
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
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

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
    const [openAddDialog, setOpenAddDialog] = useState(false);
  const [ledgerSummary, setLedgerSummary] = useState([]);
    const [newEntry, setNewEntry] = useState({
      date: '',
      description: '',
      ref: '',
      type: 'debit',
      amount: '',
    });

  // Filter by selected account code (from COA). 'All' shows every account.
  const filteredRows = selectedAccount === 'All' ? ledgerSummary : ledgerSummary.filter((a) => a.code === selectedAccount);
  const TOTAL_DEBIT = filteredRows.reduce((sum, acc) => sum + Number(acc.debit || 0), 0);
  const TOTAL_CREDIT = filteredRows.reduce((sum, acc) => sum + Number(acc.credit || 0), 0);

    // Fetch ledger entries on mount
    useEffect(() => {
    const fetchLedger = async () => {
        try {
  const res = await axios.get('/api/bookkeeping/ledger?summary=1');
  const data = res?.data?.data?.summary || [];
  const acct = res?.data?.data?.accounts || [];
  setLedgerSummary(data);
  setAccounts(acct);
        } catch (err) {
          console.error('Failed to load ledger:', err);
        }
      };
      fetchLedger();
    }, []);

    // Add entry via backend
    const handleAddEntry = async () => {
      try {
        const payload = {
          date: newEntry.date,
          account: selectedAccount === 'All' ? 'Cash' : selectedAccount,
          description: newEntry.description,
          type: newEntry.type,
          amount: parseFloat(newEntry.amount),
        };
        const res = await axios.post('/api/bookkeeping/ledger', payload);
        const created = res?.data?.data?.entry;
        if (created) {
          // Generate a local ref for display based on returned id and type
          const localRef = created.type === 'credit' ? `CR${String(created.id).padStart(2, '0')}` : `CD${String(created.id).padStart(2, '0')}`;
          setLedgerEntries(prev => [...prev, { ...created, ref: localRef }]);
        }
        setOpenAddDialog(false);
        setNewEntry({
          date: '',
          description: '',
          ref: '',
          type: 'debit',
          amount: '',
        });
      } catch (error) {
        console.error('Error adding entry:', error instanceof Error ? error.message : String(error));
      }
    };

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
              {ledgerSummary.length} accounts • September 2024
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mt: 0.5 }}>SUMMARY (Totals per Account)</Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <IconButton sx={{ color: 'text.secondary' }}>
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
              {filteredRows.map((acc, index) => (
                <TableRow key={acc.code}
                  sx={{ '&:hover': { bgcolor: 'grey.50' }, bgcolor: index % 2 === 0 ? 'white' : 'grey.25', borderBottom: `1px solid ${theme.palette.divider}` }}
                >
                  <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>{acc.code}</TableCell>
                  <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>{acc.accountTitle}</TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>₱{fNumber(acc.debit)}</TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>₱{fNumber(acc.credit)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: acc.balanceSide === 'debit' ? 'error.main' : 'success.main' }}>
                      ₱{fNumber(acc.balance)} {acc.balanceSide === 'debit' ? 'Dr' : 'Cr'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
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