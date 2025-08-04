'use client';

import { useState, useEffect } from 'react';

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

// Calculate totals for each column
const calculateTotals = (entries) => {
  const totals = {};
  const columns = [
    'netSales', 'feesAndCharges', 'cash', 'withholdingTax', 'ownersCapital', 'loansPayable'
  ];
  
  columns.forEach(column => {
    totals[column] = entries.reduce((sum, entry) => sum + entry[column], 0);
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
  const [receiptEntries, setReceiptEntries] = useState(MOCK_RECEIPT_ENTRIES);
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

  // Mock API function for adding entry
  const handleAddEntry = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const nextId = Math.max(...receiptEntries.map(entry => entry.id)) + 1;
      
      const entryToAdd = {
        ...newEntry,
        id: nextId,
        netSales: parseFloat(newEntry.netSales) || 0,
        feesAndCharges: parseFloat(newEntry.feesAndCharges) || 0,
        cash: parseFloat(newEntry.cash) || 0,
        withholdingTax: parseFloat(newEntry.withholdingTax) || 0,
        ownersCapital: parseFloat(newEntry.ownersCapital) || 0,
        loansPayable: parseFloat(newEntry.loansPayable) || 0,
      };

      setReceiptEntries(prev => [...prev, entryToAdd]);
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
            <IconButton sx={{ color: 'success.main' }}>
              <Iconify icon="logos:excel" />
            </IconButton>
            <IconButton sx={{ color: 'text.secondary' }}>
              <Iconify icon="eva:printer-fill" />
            </IconButton>
          </Stack>
        </Stack>

        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
          <Table sx={{ '& .MuiTableCell-root': { py: 1, px: 1.5 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>INVOICE NUMBERS</TableCell>
                <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>CUSTOMER / DESCRIPTION</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>CREDIT NET SALES (Total)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>DEBIT FEES AND CHARGES</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>DEBIT CASH</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>DEBIT WITHHOLDING TAX</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>CREDIT Owner's Capital</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>CREDIT Loan's Payable</TableCell>
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
                      {entry.invoiceNumber}
                    </Label>
                  </TableCell>
                  <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {entry.description}
                    </Typography>
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontWeight: entry.netSales > 0 ? 600 : 400,
                    }}
                  >
                    {entry.netSales > 0 ? `₱${fNumber(entry.netSales)}` : '-'}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontWeight: entry.feesAndCharges > 0 ? 600 : 400,
                    }}
                  >
                    {entry.feesAndCharges > 0 ? `₱${fNumber(entry.feesAndCharges)}` : '-'}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontWeight: entry.cash > 0 ? 600 : 400,
                    }}
                  >
                    {entry.cash > 0 ? `₱${fNumber(entry.cash)}` : '-'}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontWeight: entry.withholdingTax > 0 ? 600 : 400,
                    }}
                  >
                    {entry.withholdingTax > 0 ? `₱${fNumber(entry.withholdingTax)}` : '-'}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      borderRight: `1px solid ${theme.palette.divider}`,
                      fontWeight: entry.ownersCapital > 0 ? 600 : 400,
                    }}
                  >
                    {entry.ownersCapital > 0 ? `₱${fNumber(entry.ownersCapital)}` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {entry.loansPayable > 0 ? `₱${fNumber(entry.loansPayable)}` : '-'}
                  </TableCell>
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
                <TableCell align="right" sx={{ 
                  borderRight: `1px solid ${theme.palette.divider}`,
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    ₱{fNumber(TOTALS.netSales)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    ₱{fNumber(TOTALS.feesAndCharges)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    ₱{fNumber(TOTALS.cash)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    ₱{fNumber(TOTALS.withholdingTax)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    ₱{fNumber(TOTALS.ownersCapital)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    ₱{fNumber(TOTALS.loansPayable)}
                  </Typography>
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