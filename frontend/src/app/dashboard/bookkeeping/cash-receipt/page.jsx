'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'src/utils/axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

import { fNumber } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// ----------------------------------------------------------------------

const MOCK_RECEIPT_ENTRIES = [
  {
    id: 1,
    date: 'Sep 1, 2024',
    invoiceNumber: 'Deposit slip #1234',
    description: 'Initial capital investment',
    netSales: 0,
    feesAndCharges: 0,
    cash: 200000,
    withholdingTax: 0,
    ownersCapital: 200000,
    loansPayable: 0,
  },
  {
    id: 2,
    date: 'Sep 1, 2024',
    invoiceNumber: 'AR 0001',
    description: 'Loan from family members',
    netSales: 0,
    feesAndCharges: 0,
    cash: 100000,
    withholdingTax: 0,
    ownersCapital: 0,
    loansPayable: 100000,
  },
  {
    id: 3,
    date: 'Sep 2, 2024',
    invoiceNumber: 'SI0001',
    description: 'Tiktok various customers',
    netSales: 80,
    feesAndCharges: 19.18,
    cash: 60.82,
    withholdingTax: 1,
    ownersCapital: 0,
    loansPayable: 0,
  },
  {
    id: 4,
    date: 'Sep 3, 2024',
    invoiceNumber: 'SI0002',
    description: 'Lazada various customers',
    netSales: 94.05,
    feesAndCharges: 16.20,
    cash: 77.85,
    withholdingTax: 3,
    ownersCapital: 0,
    loansPayable: 0,
  },
  {
    id: 5,
    date: 'Sep 4, 2024',
    invoiceNumber: 'SI0003',
    description: 'Shopee various customers',
    netSales: 1661.30,
    feesAndCharges: 161.11,
    cash: 1500.19,
    withholdingTax: 4,
    ownersCapital: 0,
    loansPayable: 0,
  },
  {
    id: 6,
    date: 'Sep 5, 2024',
    invoiceNumber: 'SI0004',
    description: 'Tiktok various customers',
    netSales: 5,
    feesAndCharges: 2,
    cash: 3,
    withholdingTax: 5,
    ownersCapital: 0,
    loansPayable: 0,
  },
  {
    id: 7,
    date: 'Sep 6, 2024',
    invoiceNumber: 'SI0005',
    description: 'Lazada various customers',
    netSales: 120,
    feesAndCharges: 25.50,
    cash: 94.50,
    withholdingTax: 7,
    ownersCapital: 0,
    loansPayable: 0,
  },
  {
    id: 8,
    date: 'Sep 7, 2024',
    invoiceNumber: 'SI0006',
    description: 'Shopee various customers',
    netSales: 85.75,
    feesAndCharges: 18.25,
    cash: 67.50,
    withholdingTax: 2,
    ownersCapital: 0,
    loansPayable: 0,
  },
  {
    id: 9,
    date: 'Sep 8, 2024',
    invoiceNumber: 'SI0007',
    description: 'Tiktok various customers',
    netSales: 45.20,
    feesAndCharges: 12.30,
    cash: 32.90,
    withholdingTax: 1,
    ownersCapital: 0,
    loansPayable: 0,
  },
  {
    id: 10,
    date: 'Sep 9, 2024',
    invoiceNumber: 'SI0008',
    description: 'Lazada various customers',
    netSales: 200.50,
    feesAndCharges: 35.75,
    cash: 164.75,
    withholdingTax: 6,
    ownersCapital: 0,
    loansPayable: 0,
  },
];

// Calculate totals for each column (supports both old and new shapes)
const calculateTotals = (entries) => {
  const totals = {
    // new keys
    cashDebit: 0,
    feesChargesDebit: 0,
    salesReturnsDebit: 0,
    netSalesCredit: 0,
    otherIncomeCredit: 0,
    arCredit: 0,
    // legacy keys for backward compat
    netSales: 0,
    feesAndCharges: 0,
    cash: 0,
    withholdingTax: 0,
    ownersCapital: 0,
    loansPayable: 0,
  };
  entries.forEach((e) => {
    totals.cashDebit += Number(e.cashDebit || 0);
    totals.feesChargesDebit += Number(e.feesChargesDebit || 0);
    totals.salesReturnsDebit += Number(e.salesReturnsDebit || 0);
    totals.netSalesCredit += Number(e.netSalesCredit || 0);
    totals.otherIncomeCredit += Number(e.otherIncomeCredit || 0);
    totals.arCredit += Number(e.arCredit || 0);
    // legacy
    totals.netSales += Number(e.netSales || 0);
    totals.feesAndCharges += Number(e.feesAndCharges || 0);
    totals.cash += Number(e.cash || 0);
    totals.withholdingTax += Number(e.withholdingTax || 0);
    totals.ownersCapital += Number(e.ownersCapital || 0);
    totals.loansPayable += Number(e.loansPayable || 0);
  });
  return totals;
};

export default function CashReceiptPage() {
  useEffect(() => {
    document.title = 'Bookkeeping - Cash Receipt Journal | Kitsch Studio';
  }, []);
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [receiptEntries, setReceiptEntries] = useState([]);

  const [newEntry, setNewEntry] = useState({
    date: '',
    invoiceNumber: '',
    description: '',
    netSales: '',
    feesAndCharges: '',
    cash: '',
    withholdingTax: '',
    ownersCapital: '',
    loansPayable: '',
  });

  // Calculate totals from current entries
  const TOTALS = calculateTotals(receiptEntries);

  // Fetch entries memoized
  const fetchReceipts = useCallback(async () => {
    try {
      const res = await axios.get('/api/bookkeeping/cash-receipts');
      const data = res?.data?.data?.receipts;
      if (Array.isArray(data)) setReceiptEntries(data);
    } catch (e) {
      console.warn('Failed to load cash receipts from API. Error:', e?.message);
    }
  }, []);

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  // Auto-refresh via localStorage flag
  useEffect(() => {
    const KEY = 'cashReceiptsNeedsRefresh';
    const check = () => {
      try {
        if (window.localStorage.getItem(KEY) === '1') {
          window.localStorage.setItem(KEY, '0');
          fetchReceipts();
        }
      } catch (_) {}
    };
    const onStorage = (e) => { if (e.key === KEY && e.newValue === '1') check(); };
    window.addEventListener('storage', onStorage);
    const timer = setInterval(check, 4000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(timer); };
  }, [fetchReceipts]);

  // Create entry via backend
  const handleAddEntry = async () => {
    try {
      const payload = {
        date: newEntry.date,
        invoiceNumber: newEntry.invoiceNumber,
        description: newEntry.description,
        netSales: parseFloat(newEntry.netSales) || 0,
        feesAndCharges: parseFloat(newEntry.feesAndCharges) || 0,
        cash: parseFloat(newEntry.cash) || 0,
        withholdingTax: parseFloat(newEntry.withholdingTax) || 0,
        ownersCapital: parseFloat(newEntry.ownersCapital) || 0,
        loansPayable: parseFloat(newEntry.loansPayable) || 0,
      };
      const res = await axios.post('/api/bookkeeping/cash-receipts', payload);
      const saved = res?.data?.data?.entry;
      if (saved) setReceiptEntries(prev => [...prev, saved]);
      setOpenAddDialog(false);
      setNewEntry({
        date: '',
        invoiceNumber: '',
        description: '',
        netSales: '',
        feesAndCharges: '',
        cash: '',
        withholdingTax: '',
        ownersCapital: '',
        loansPayable: '',
      });
      
      // Show success message (you can add a snackbar here)
      console.log('Cash receipt entry added successfully!');
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        Cash Receipt Journal
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Dashboard / Bookkeeping / Cash Receipt Journal
      </Typography>

      {/* Overview Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Iconify icon="eva:info-fill" width={24} sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              Cash Receipt Journal Overview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Track all cash inflows and receipts received by your business. Monitor sales, 
              investments, loans, and other cash receipts with detailed transaction records.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Filters & Actions */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filters & Actions
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search receipts..."
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
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="September">September</MenuItem>
            <MenuItem value="October">October</MenuItem>
            <MenuItem value="November">November</MenuItem>
          </TextField>
          
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => setOpenAddDialog(true)}
            sx={{ minWidth: 140 }}
          >
            + Add Entry
          </Button>
        </Stack>
      </Card>

      {/* Cash Receipt Journal Table */}
      <Card sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              CASH RECEIPT JOURNAL (BOOK)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {receiptEntries.length} receipt entries • September 2024
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <IconButton
              sx={{ color: 'text.secondary' }}
              title="Refresh"
              onClick={() => fetchReceipts()}
            >
              <Iconify icon="eva:refresh-fill" />
            </IconButton>
            <IconButton sx={{ color: 'success.main' }} title="Export">
              <Iconify icon="logos:excel" />
            </IconButton>
            <IconButton sx={{ color: 'text.secondary' }} title="Print">
              <Iconify icon="eva:printer-fill" />
            </IconButton>
          </Stack>
        </Stack>

        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
          <Table sx={{ '& .MuiTableCell-root': { py: 1, px: 1.5 } }}>
            <TableHead>
              {/* Grouped header row */}
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell rowSpan={2} sx={{ fontWeight: 700, borderRight: `1px solid ${theme.palette.divider}` }}>Date</TableCell>
                <TableCell rowSpan={2} sx={{ fontWeight: 700, borderRight: `1px solid ${theme.palette.divider}` }}>OR/Reference No.</TableCell>
                <TableCell rowSpan={2} sx={{ fontWeight: 700, borderRight: `1px solid ${theme.palette.divider}` }}>Customer / Source</TableCell>
                <TableCell align="center" colSpan={3} sx={{ fontWeight: 700, borderRight: `1px solid ${theme.palette.divider}` }}>DEBIT</TableCell>
                <TableCell align="center" colSpan={3} sx={{ fontWeight: 700, borderRight: `1px solid ${theme.palette.divider}` }}>CREDIT</TableCell>
                <TableCell rowSpan={2} align="center" sx={{ fontWeight: 700 }}>Remarks</TableCell>
              </TableRow>
              {/* Sub-headers row */}
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>CashBank / eWallet</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Fees & Charges</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Sales Returns / Refunds</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Net Sales</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Other Income</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Accounts Receivable</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receiptEntries.map((entry, index) => (
                <TableRow 
                  key={entry.id} 
                  sx={{ 
                    '&:hover': { bgcolor: 'grey.50' },
                    bgcolor: index % 2 === 0 ? 'white' : 'grey.25',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    {entry.date}
                  </TableCell>
                  <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Label 
                      variant="soft" 
                      color="primary"
                      sx={{ 
                        bgcolor: '#E3F2FD',
                        color: '#1976D2',
                        border: '1px solid #90CAF9',
                        borderRadius: '12px',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {entry.referenceNo || entry.invoiceNumber}
                    </Label>
                  </TableCell>
                  <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{entry.customer || entry.description}</Typography>
                  </TableCell>
                  <TableCell
                    align="right" 
                    sx={{ 
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontWeight: entry.cashDebit > 0 || entry.cash > 0 ? 600 : 400,
                    }}
                  >
                    {entry.cashDebit > 0 ? `₱${fNumber(entry.cashDebit)}` : (entry.cash > 0 ? `₱${fNumber(entry.cash)}` : '-')}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontWeight: (entry.feesChargesDebit || entry.feesAndCharges) > 0 ? 600 : 400,
                    }}
                  >
                    {(entry.feesChargesDebit || entry.feesAndCharges) > 0 ? `₱${fNumber(entry.feesChargesDebit || entry.feesAndCharges)}` : '-'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ 
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontWeight: (entry.salesReturnsDebit || 0) > 0 ? 600 : 400,
                    }}
                  >
                    {(entry.salesReturnsDebit || 0) > 0 ? `₱${fNumber(entry.salesReturnsDebit)}` : '-'}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontWeight: (entry.netSalesCredit || entry.netSales) > 0 ? 600 : 400,
                    }}
                  >
                    {(entry.netSalesCredit || entry.netSales) > 0 ? `₱${fNumber(entry.netSalesCredit || entry.netSales)}` : '-'}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontWeight: (entry.otherIncomeCredit || 0) > 0 ? 600 : 400,
                    }}
                  >
                    {(entry.otherIncomeCredit || 0) > 0 ? `₱${fNumber(entry.otherIncomeCredit)}` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {(entry.arCredit || 0) > 0 ? `₱${fNumber(entry.arCredit)}` : '-'}
                  </TableCell>
                  <TableCell align="right">{entry.remarks || ''}</TableCell>
                </TableRow>
              ))}
              
              {/* Total Row */}
              <TableRow sx={{ 
                bgcolor: '#E3F2FD', 
                borderTop: `2px solid ${theme.palette.primary.main}`,
              }}>
                <TableCell colSpan={3} sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    TOTAL
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>₱{fNumber((TOTALS.cashDebit || 0) + (TOTALS.cash || 0))}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>₱{fNumber((TOTALS.feesChargesDebit || 0) + (TOTALS.feesAndCharges || 0))}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>₱{fNumber(TOTALS.salesReturnsDebit || 0)}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>₱{fNumber((TOTALS.netSalesCredit || 0) + (TOTALS.netSales || 0))}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>₱{fNumber(TOTALS.otherIncomeCredit || 0)}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>₱{fNumber(TOTALS.arCredit || 0)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}></Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Entry Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Cash Receipt Entry</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Date"
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Invoice Number"
                value={newEntry.invoiceNumber}
                onChange={(e) => setNewEntry({ ...newEntry, invoiceNumber: e.target.value })}
                placeholder="e.g., SI0009, Deposit slip #1234"
                fullWidth
              />
            </Stack>

            <TextField
              label="Description"
              value={newEntry.description}
              onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
              placeholder="e.g., Shopee various customers, Initial capital investment"
              fullWidth
              multiline
              rows={2}
            />

            <Typography variant="h6">Transaction Amounts</Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Net Sales"
                type="number"
                value={newEntry.netSales}
                onChange={(e) => setNewEntry({ ...newEntry, netSales: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                fullWidth
              />
              <TextField
                label="Fees and Charges"
                type="number"
                value={newEntry.feesAndCharges}
                onChange={(e) => setNewEntry({ ...newEntry, feesAndCharges: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Cash"
                type="number"
                value={newEntry.cash}
                onChange={(e) => setNewEntry({ ...newEntry, cash: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                fullWidth
              />
              <TextField
                label="Withholding Tax"
                type="number"
                value={newEntry.withholdingTax}
                onChange={(e) => setNewEntry({ ...newEntry, withholdingTax: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Owner's Capital"
                type="number"
                value={newEntry.ownersCapital}
                onChange={(e) => setNewEntry({ ...newEntry, ownersCapital: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                fullWidth
              />
              <TextField
                label="Loan's Payable"
                type="number"
                value={newEntry.loansPayable}
                onChange={(e) => setNewEntry({ ...newEntry, loansPayable: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddEntry}
            disabled={!newEntry.date || !newEntry.invoiceNumber || !newEntry.description}
          >
            Add Entry
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
} 