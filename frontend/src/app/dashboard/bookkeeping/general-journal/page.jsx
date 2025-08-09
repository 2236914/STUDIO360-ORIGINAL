'use client';

import { useState, useEffect, useMemo } from 'react';
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

const MOCK_JOURNAL_ENTRIES = [
  {
    id: 1,
    date: 'Sep 1, 2024',
    entries: [
      {
        account: 'Equipment',
        description: 'Used personal computer',
        type: 'debit',
        amount: 15000,
      },
      {
        account: "Owner's Capital",
        description: 'Used personal computer',
        type: 'credit',
        amount: 15000,
      },
    ],
    ref: 'GJ01',
  },
  {
    id: 2,
    date: 'Sep 1, 2024',
    entries: [
      {
        account: 'Merchandise Inventory',
        description: 'Initial inventory investment',
        type: 'debit',
        amount: 100000,
      },
      {
        account: "Owner's Capital",
        description: 'Initial inventory investment',
        type: 'credit',
        amount: 100000,
      },
    ],
    ref: 'GJ02',
  },
  {
    id: 3,
    date: 'Sep 30, 2024',
    entries: [
      {
        account: 'Cost of Goods Sold',
        description: 'cost of goods sold Sep 2024',
        type: 'debit',
        amount: 60000,
      },
      {
        account: 'Merchandise Inventory',
        description: 'cost of goods sold Sep 2024',
        type: 'credit',
        amount: 60000,
      },
    ],
    ref: 'GJ03',
  },
  {
    id: 4,
    date: 'Sep 30, 2024',
    entries: [
      {
        account: 'Depreciation - Equipment',
        description: 'Sep 2024 depreciation-equipment',
        type: 'debit',
        amount: 1041.67,
      },
      {
        account: 'Accumulated Depreciation - Equipment',
        description: 'Sep 2024 depreciation-equipment',
        type: 'credit',
        amount: 1041.67,
      },
    ],
    ref: 'GJ04',
  },
];

// Totals will be computed from current journalEntries

export default function GeneralJournalPage() {
  useEffect(() => {
    document.title = 'Bookkeeping - General Journal | Kitsch Studio';
  }, []);
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);

  const [newEntry, setNewEntry] = useState({
    date: '',
    ref: '',
    entries: [
      { account: '', description: '', type: 'debit', amount: '' },
      { account: '', description: '', type: 'credit', amount: '' },
    ],
  });

  // Load entries from backend
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/bookkeeping/journal');
        const data = res?.data?.data?.journal;
        if (Array.isArray(data)) {
          setJournalEntries(data);
        }
      } catch (e) {
        console.warn('Failed to load journal from API, using mock. Error:', e?.message);
      }
    };
    load();
  }, []);

  // Compute totals based on loaded entries
  const { totalDebit, totalCredit } = useMemo(() => {
    const sums = (journalEntries || []).reduce(
      (acc, entry) => {
        (entry.entries || []).forEach((e) => {
          if (e.type === 'debit') acc.debit += Number(e.amount) || 0;
          if (e.type === 'credit') acc.credit += Number(e.amount) || 0;
        });
        return acc;
      },
      { debit: 0, credit: 0 }
    );
    return { totalDebit: sums.debit, totalCredit: sums.credit };
  }, [journalEntries]);

  // Create entry via backend
  const handleAddEntry = async () => {
    try {
      const cleanedEntries = (newEntry.entries || []).map((e) => ({
        account: e.account,
        description: e.description,
        type: e.type,
        amount: parseFloat(e.amount) || 0,
      }));
      const payload = { date: newEntry.date, ref: newEntry.ref, entries: cleanedEntries };
      const res = await axios.post('/api/bookkeeping/journal', payload);
      const saved = res?.data?.data?.entry;
      if (saved) {
        setJournalEntries(prev => [...prev, saved]);
      }
      setOpenAddDialog(false);
      setNewEntry({
        date: '',
        ref: '',
        entries: [
          { account: '', description: '', type: 'debit', amount: '' },
          { account: '', description: '', type: 'credit', amount: '' },
        ],
      });
      
      // Show success message (you can add a snackbar here)
      console.log('Entry added successfully!');
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedEntries = [...newEntry.entries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setNewEntry({ ...newEntry, entries: updatedEntries });
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        General Journal
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Dashboard / Bookkeeping / General Journal
      </Typography>

      {/* Overview Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Iconify icon="eva:info-fill" width={24} sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              General Journal Overview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Record all business transactions in chronological order with proper debit and credit entries. 
              Each journal entry shows both sides of the accounting equation for complete transaction recording.
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
            placeholder="Search journal entries..."
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

      {/* General Journal Table */}
      <Card sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              GENERAL JOURNAL
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {journalEntries.length} journal entries • September 2024
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
                <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Account Title/Description</TableCell>
                <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Ref</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}` }}>Debit</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Credit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {journalEntries.map((entry, entryIndex) => 
                entry.entries.map((item, itemIndex) => (
                  <TableRow 
                    key={`${entry.id}-${itemIndex}`} 
                    sx={{ 
                      '&:hover': { bgcolor: 'grey.50' },
                      bgcolor: entryIndex % 2 === 0 ? 'white' : 'grey.25',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {itemIndex === 0 ? entry.date : ''}
                    </TableCell>
                    <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      <Box sx={{ pl: item.type === 'credit' ? 3 : 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {item.account}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {itemIndex === 0 && (
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
                          {entry.ref}
                        </Label>
                      )}
                    </TableCell>
                    <TableCell 
                      align="right" 
                      sx={{ 
                        borderRight: `1px solid ${theme.palette.divider}`,
                        fontWeight: item.type === 'debit' ? 600 : 400,
                      }}
                    >
                      {item.type === 'debit' ? `₱${fNumber(item.amount)}` : '-'}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        fontWeight: item.type === 'credit' ? 600 : 400,
                      }}
                    >
                      {item.type === 'credit' ? `₱${fNumber(item.amount)}` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
              
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
                    ₱{fNumber(totalDebit)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    ₱{fNumber(totalCredit)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Entry Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Journal Entry</DialogTitle>
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
                label="Reference"
                value={newEntry.ref}
                onChange={(e) => setNewEntry({ ...newEntry, ref: e.target.value })}
                placeholder="Auto-generated"
                fullWidth
              />
            </Stack>

            <Typography variant="h6">Journal Entries</Typography>

            {newEntry.entries.map((entry, index) => (
              <Card key={index} sx={{ p: 2, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: entry.type === 'debit' ? 'error.main' : 'success.main' }}>
                  {entry.type === 'debit' ? 'Debit Entry' : 'Credit Entry'}
                </Typography>
                
                <Stack spacing={2}>
                  <TextField
                    label="Account"
                    value={entry.account}
                    onChange={(e) => handleInputChange(index, 'account', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Description"
                    value={entry.description}
                    onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Amount"
                    type="number"
                    value={entry.amount}
                    onChange={(e) => handleInputChange(index, 'amount', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    }}
                    fullWidth
                  />
                </Stack>
              </Card>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddEntry}
            disabled={!newEntry.date || !newEntry.entries[0].account || !newEntry.entries[1].account}
          >
            Add Entry
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
} 