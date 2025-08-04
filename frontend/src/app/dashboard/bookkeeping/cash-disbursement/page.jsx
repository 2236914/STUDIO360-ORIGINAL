'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { fNumber } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// ----------------------------------------------------------------------

const MOCK_DISBURSEMENT_ENTRIES = [
  {
    id: 1,
    date: 'Aug 15, 2024',
    invoiceNumber: 'SI0876213',
    description: 'DTI Certificate',
    creditCash: 1030,
    debitEquipment: 0,
    debitFurnitureFixtures: 0,
    debitTaxesLicenses: 1030,
    debitOfficeSupplies: 0,
    debitInventory: 0,
    debitSalary: 0,
    debitFreightDelivery: 0,
    debitAdvertising: 0,
    debitProfessionalFee: 0,
    debitUtilities: 0,
    debitRent: 0,
    creditWithholdingTax: 0,
    debitBankLoan: 0,
    debitInterestExpense: 0,
    debitOwnersWithdrawal: 0,
    entity: 'DTI',
  },
  {
    id: 2,
    date: 'Aug 20, 2024',
    invoiceNumber: 'BP#98727',
    description: "Mayor's Permit 2024",
    creditCash: 10000,
    debitEquipment: 0,
    debitFurnitureFixtures: 0,
    debitTaxesLicenses: 10000,
    debitOfficeSupplies: 0,
    debitInventory: 0,
    debitSalary: 0,
    debitFreightDelivery: 0,
    debitAdvertising: 0,
    debitProfessionalFee: 0,
    debitUtilities: 0,
    debitRent: 0,
    creditWithholdingTax: 0,
    debitBankLoan: 0,
    debitInterestExpense: 0,
    debitOwnersWithdrawal: 0,
    entity: 'City Hall',
  },
  {
    id: 3,
    date: 'Aug 30, 2024',
    invoiceNumber: 'SI02431',
    description: 'Books, Invoice, Doc Stamp',
    creditCash: 3000,
    debitEquipment: 0,
    debitFurnitureFixtures: 0,
    debitTaxesLicenses: 3000,
    debitOfficeSupplies: 0,
    debitInventory: 0,
    debitSalary: 0,
    debitFreightDelivery: 0,
    debitAdvertising: 0,
    debitProfessionalFee: 0,
    debitUtilities: 0,
    debitRent: 0,
    creditWithholdingTax: 0,
    debitBankLoan: 0,
    debitInterestExpense: 0,
    debitOwnersWithdrawal: 0,
    entity: 'BIR',
  },
  {
    id: 4,
    date: 'Sep 2, 2024',
    invoiceNumber: 'SI02432',
    description: 'Professional Fee - Accountant',
    creditCash: 5000,
    debitEquipment: 0,
    debitFurnitureFixtures: 0,
    debitTaxesLicenses: 0,
    debitOfficeSupplies: 0,
    debitInventory: 0,
    debitSalary: 0,
    debitFreightDelivery: 0,
    debitAdvertising: 0,
    debitProfessionalFee: 5000,
    debitUtilities: 0,
    debitRent: 0,
    creditWithholdingTax: 0,
    debitBankLoan: 0,
    debitInterestExpense: 0,
    debitOwnersWithdrawal: 0,
    entity: 'Professional Services',
  },
  {
    id: 5,
    date: 'Sep 5, 2024',
    invoiceNumber: 'SI02433',
    description: 'IKEA/Tables & Chairs',
    creditCash: 20000,
    debitEquipment: 0,
    debitFurnitureFixtures: 20000,
    debitTaxesLicenses: 0,
    debitOfficeSupplies: 0,
    debitInventory: 0,
    debitSalary: 0,
    debitFreightDelivery: 0,
    debitAdvertising: 0,
    debitProfessionalFee: 0,
    debitUtilities: 0,
    debitRent: 0,
    creditWithholdingTax: 0,
    debitBankLoan: 0,
    debitInterestExpense: 0,
    debitOwnersWithdrawal: 0,
    entity: 'IKEA',
  },
  {
    id: 6,
    date: 'Sep 10, 2024',
    invoiceNumber: 'SI02434',
    description: 'Inventory Purchase',
    creditCash: 50000,
    debitEquipment: 0,
    debitFurnitureFixtures: 0,
    debitTaxesLicenses: 0,
    debitOfficeSupplies: 0,
    debitInventory: 50000,
    debitSalary: 0,
    debitFreightDelivery: 0,
    debitAdvertising: 0,
    debitProfessionalFee: 0,
    debitUtilities: 0,
    debitRent: 0,
    creditWithholdingTax: 0,
    debitBankLoan: 0,
    debitInterestExpense: 0,
    debitOwnersWithdrawal: 0,
    entity: 'Supplier',
  },
  {
    id: 7,
    date: 'Sep 15, 2024',
    invoiceNumber: 'SI02435',
    description: 'Monthly Rent Payment',
    creditCash: 25000,
    debitEquipment: 0,
    debitFurnitureFixtures: 0,
    debitTaxesLicenses: 0,
    debitOfficeSupplies: 0,
    debitInventory: 0,
    debitSalary: 0,
    debitFreightDelivery: 0,
    debitAdvertising: 0,
    debitProfessionalFee: 0,
    debitUtilities: 0,
    debitRent: 25000,
    creditWithholdingTax: 0,
    debitBankLoan: 0,
    debitInterestExpense: 0,
    debitOwnersWithdrawal: 0,
    entity: 'Landlord',
  },
  {
    id: 8,
    date: 'Sep 20, 2024',
    invoiceNumber: 'SI02436',
    description: 'Utility Bills',
    creditCash: 8000,
    debitEquipment: 0,
    debitFurnitureFixtures: 0,
    debitTaxesLicenses: 0,
    debitOfficeSupplies: 0,
    debitInventory: 0,
    debitSalary: 0,
    debitFreightDelivery: 0,
    debitAdvertising: 0,
    debitProfessionalFee: 0,
    debitUtilities: 8000,
    debitRent: 0,
    creditWithholdingTax: 0,
    debitBankLoan: 0,
    debitInterestExpense: 0,
    debitOwnersWithdrawal: 0,
    entity: 'Meralco',
  },
  {
    id: 9,
    date: 'Sep 25, 2024',
    invoiceNumber: 'SI02437',
    description: 'Marketing Campaign',
    creditCash: 15000,
    debitEquipment: 0,
    debitFurnitureFixtures: 0,
    debitTaxesLicenses: 0,
    debitOfficeSupplies: 0,
    debitInventory: 0,
    debitSalary: 0,
    debitFreightDelivery: 0,
    debitAdvertising: 15000,
    debitProfessionalFee: 0,
    debitUtilities: 0,
    debitRent: 0,
    creditWithholdingTax: 0,
    debitBankLoan: 0,
    debitInterestExpense: 0,
    debitOwnersWithdrawal: 0,
    entity: 'Facebook/TikTok',
  },
  {
    id: 10,
    date: 'Sep 30, 2024',
    invoiceNumber: 'SI02438',
    description: 'Owner Withdrawal',
    creditCash: 15000,
    debitEquipment: 0,
    debitFurnitureFixtures: 0,
    debitTaxesLicenses: 0,
    debitOfficeSupplies: 0,
    debitInventory: 0,
    debitSalary: 0,
    debitFreightDelivery: 0,
    debitAdvertising: 0,
    debitProfessionalFee: 0,
    debitUtilities: 0,
    debitRent: 0,
    creditWithholdingTax: 0,
    debitBankLoan: 0,
    debitInterestExpense: 0,
    debitOwnersWithdrawal: 15000,
    entity: 'Owner',
  },
];

// Calculate totals for each column
const calculateTotals = () => {
  const totals = {};
  const columns = [
    'creditCash', 'debitEquipment', 'debitFurnitureFixtures', 'debitTaxesLicenses',
    'debitOfficeSupplies', 'debitInventory', 'debitSalary', 'debitFreightDelivery',
    'debitAdvertising', 'debitProfessionalFee', 'debitUtilities', 'debitRent',
    'creditWithholdingTax', 'debitBankLoan', 'debitInterestExpense', 'debitOwnersWithdrawal'
  ];
  
  columns.forEach(column => {
    totals[column] = MOCK_DISBURSEMENT_ENTRIES.reduce((sum, entry) => sum + entry[column], 0);
  });
  
  return totals;
};

const TOTALS = calculateTotals();

export default function CashDisbursementPage() {
  useEffect(() => {
    document.title = 'Bookkeeping - Cash Disbursement Journal | Kitsch Studio';
  }, []);
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        Cash Disbursement Book
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Dashboard / Bookkeeping / Cash Disbursement Book
      </Typography>

      {/* Overview Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Iconify icon="eva:info-fill" width={24} sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              Cash Disbursement Book Overview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Track all cash payments and disbursements made by your business. Monitor expenses, 
              vendor payments, and cash outflows with detailed transaction records and payment history.
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
            placeholder="Search disbursements..."
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
            <MenuItem value="August">August</MenuItem>
            <MenuItem value="September">September</MenuItem>
            <MenuItem value="October">October</MenuItem>
          </TextField>
          
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{ minWidth: 140 }}
          >
            + Add Entry
          </Button>
        </Stack>
      </Card>

      {/* Cash Disbursement Book Table */}
      <Card sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              CASH DISBURSEMENT BOOK (16+ columns)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {MOCK_DISBURSEMENT_ENTRIES.length} transactions • August - September 2024
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

        <Box sx={{ 
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: 0,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'transparent',
          },
          '&:hover': {
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: 4,
              '&:hover': {
                background: '#a8a8a8',
              },
            },
          },
        }}>
          <TableContainer component={Paper} sx={{ 
            boxShadow: 'none', 
            border: `1px solid ${theme.palette.divider}`, 
            minWidth: 2000,
            overflow: 'hidden',
          }}>
            <Table sx={{ '& .MuiTableCell-root': { py: 1, px: 1.5, whiteSpace: 'nowrap' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 100 }}>DATE</TableCell>
                  <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 120 }}>INVOICE NUMBER</TableCell>
                  <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 200 }}>SUPPLIER / DESCRIPTION</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 120 }}>CREDIT CASH</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 120 }}>DEBIT EQUIPMENT</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 140 }}>DEBIT FURNITURE & FIXTURES</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 140 }}>DEBIT TAXES & LICENSES</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 130 }}>DEBIT OFFICE SUPPLIES</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 120 }}>DEBIT INVENTORY</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 100 }}>DEBIT SALARY</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 140 }}>DEBIT FREIGHT-OUT/DELIVERY</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 120 }}>DEBIT ADVERTISING</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 140 }}>DEBIT PROFESSIONAL FEE</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 100 }}>DEBIT UTILITIES</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 100 }}>DEBIT RENT</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 140 }}>CREDIT WITHHOLDING TAX</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 120 }}>DEBIT BANK LOAN</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, borderRight: `1px solid ${theme.palette.divider}`, minWidth: 130 }}>DEBIT INTEREST EXPENSE</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, minWidth: 140 }}>DEBIT OWNER'S WITHDRAWAL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_DISBURSEMENT_ENTRIES.map((entry, index) => (
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
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {entry.invoiceNumber}
                        </Typography>
                        <Label 
                          variant="soft" 
                          color={entry.entity === 'IKEA' ? 'warning' : 'primary'}
                          sx={{ 
                            bgcolor: entry.entity === 'IKEA' ? '#FFF3E0' : '#E3F2FD',
                            color: entry.entity === 'IKEA' ? '#E65100' : '#1976D2',
                            border: entry.entity === 'IKEA' ? '1px solid #FFB74D' : '1px solid #90CAF9',
                            borderRadius: '12px',
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            alignSelf: 'flex-start',
                          }}
                        >
                          {entry.entity}
                        </Label>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {entry.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.creditCash > 0 ? `₱${fNumber(entry.creditCash)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitEquipment > 0 ? `₱${fNumber(entry.debitEquipment)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitFurnitureFixtures > 0 ? `₱${fNumber(entry.debitFurnitureFixtures)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitTaxesLicenses > 0 ? `₱${fNumber(entry.debitTaxesLicenses)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitOfficeSupplies > 0 ? `₱${fNumber(entry.debitOfficeSupplies)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitInventory > 0 ? `₱${fNumber(entry.debitInventory)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitSalary > 0 ? `₱${fNumber(entry.debitSalary)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitFreightDelivery > 0 ? `₱${fNumber(entry.debitFreightDelivery)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitAdvertising > 0 ? `₱${fNumber(entry.debitAdvertising)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitProfessionalFee > 0 ? `₱${fNumber(entry.debitProfessionalFee)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitUtilities > 0 ? `₱${fNumber(entry.debitUtilities)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitRent > 0 ? `₱${fNumber(entry.debitRent)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.creditWithholdingTax > 0 ? `₱${fNumber(entry.creditWithholdingTax)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitBankLoan > 0 ? `₱${fNumber(entry.debitBankLoan)}` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                      {entry.debitInterestExpense > 0 ? `₱${fNumber(entry.debitInterestExpense)}` : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {entry.debitOwnersWithdrawal > 0 ? `₱${fNumber(entry.debitOwnersWithdrawal)}` : '-'}
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
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.creditCash)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitEquipment)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitFurnitureFixtures)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitTaxesLicenses)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitOfficeSupplies)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitInventory)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitSalary)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitFreightDelivery)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitAdvertising)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitProfessionalFee)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitUtilities)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitRent)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.creditWithholdingTax)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitBankLoan)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderRight: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitInterestExpense)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ₱{fNumber(TOTALS.debitOwnersWithdrawal)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Card>
    </DashboardContent>
  );
} 