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
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TablePagination from '@mui/material/TablePagination';

import { fNumber } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// ----------------------------------------------------------------------

const MOCK_KPI_DATA = [
  {
    title: 'Total Processed',
    value: '125',
    change: '+12%',
    trend: 'up',
    color: 'success.main',
    miniChart: [10, 15, 12, 18, 22, 25, 30, 28, 35, 40, 38, 45],
  },
  {
    title: 'Total Corrected',
    value: '37',
    change: '+8%',
    trend: 'up',
    color: 'warning.main',
    miniChart: [5, 8, 6, 10, 12, 15, 18, 16, 20, 22, 25, 30],
  },
  {
    title: 'Avg. Confidence',
    value: '1.0',
    change: '+0.2',
    trend: 'up',
    color: 'info.main',
    miniChart: [0.7, 0.75, 0.8, 0.85, 0.9, 0.92, 0.95, 0.93, 0.96, 0.98, 0.97, 1.0],
  },
  {
    title: 'Correction Rate',
    value: '30',
    change: '-2.5%',
    trend: 'down',
    color: 'error.main',
    miniChart: [35, 32, 30, 28, 25, 22, 20, 18, 15, 12, 10, 8],
  },
];

const MOCK_CATEGORY_DATA = [
  { category: 'Online Sales Revenue', count: 36, percentage: 28.8 },
  { category: 'Cost of Goods Sold', count: 28, percentage: 22.4 },
  { category: 'Marketing Expenses', count: 24, percentage: 19.2 },
  { category: 'Operating Expenses', count: 18, percentage: 14.4 },
  { category: 'Platform Fees', count: 12, percentage: 9.6 },
  { category: 'Walk-in Sales', count: 7, percentage: 5.6 },
];

const MOCK_CONFIDENCE_DATA = [
  { range: '0.5-0.6', count: 5 },
  { range: '0.6-0.7', count: 12 },
  { range: '0.7-0.8', count: 25 },
  { range: '0.8-0.9', count: 45 },
  { range: '0.9-1.0', count: 38 },
];

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    date: 'Jul 12',
    description: 'Shopee Order #SP12345-Phone Case',
    source: 'Shopee',
    aiCategory: 'Online Sales Revenue',
    confidence: 1.0,
    corrected: true,
    finalCategory: 'Online Sales Revenue',
  },
  {
    id: 2,
    date: 'Jul 12',
    description: 'Facebook Ads Campaign - Product Promotion',
    source: 'Excel',
    aiCategory: 'Operating Expenses',
    confidence: 0.0,
    corrected: true,
    finalCategory: 'Marketing Expenses',
  },
  {
    id: 3,
    date: 'Jul 11',
    description: 'Walk-in Customer - Cash Sale P850',
    source: 'Manual',
    aiCategory: 'Walk-in Sales',
    confidence: 1.0,
    corrected: true,
    finalCategory: 'Walk-in Sales',
  },
  {
    id: 4,
    date: 'Jul 10',
    description: 'Product Sourcing - Supplier ABC',
    source: 'Excel',
    aiCategory: 'Cost of Goods Sold',
    confidence: 0.9,
    corrected: true,
    finalCategory: 'Cost of Goods Sold',
  },
  {
    id: 5,
    date: 'Jul 10',
    description: 'TikTok Shop Commission - Order #TK789',
    source: 'TikTok',
    aiCategory: 'Platform Fees',
    confidence: 0.9,
    corrected: true,
    finalCategory: 'Platform Fees',
  },
  {
    id: 6,
    date: 'Jul 9',
    description: 'Office Supplies - Paper and Ink',
    source: 'Manual',
    aiCategory: 'Operating Expenses',
    confidence: 0.8,
    corrected: false,
    finalCategory: 'Operating Expenses',
  },
  {
    id: 7,
    date: 'Jul 9',
    description: 'Lazada Order #LZ45678-Phone Accessories',
    source: 'Lazada',
    aiCategory: 'Online Sales Revenue',
    confidence: 1.0,
    corrected: true,
    finalCategory: 'Online Sales Revenue',
  },
  {
    id: 8,
    date: 'Jul 8',
    description: 'Google Ads - Brand Campaign',
    source: 'Excel',
    aiCategory: 'Marketing Expenses',
    confidence: 0.95,
    corrected: true,
    finalCategory: 'Marketing Expenses',
  },
  {
    id: 9,
    date: 'Jul 8',
    description: 'Inventory Purchase - Phone Cases',
    source: 'Manual',
    aiCategory: 'Cost of Goods Sold',
    confidence: 0.85,
    corrected: true,
    finalCategory: 'Cost of Goods Sold',
  },
  {
    id: 10,
    date: 'Jul 7',
    description: 'Shopee Commission - Order #SP98765',
    source: 'Shopee',
    aiCategory: 'Platform Fees',
    confidence: 0.9,
    corrected: true,
    finalCategory: 'Platform Fees',
  },
];

export default function AICategorizationPage() {
  useEffect(() => {
    document.title = 'AI Bookkeeper - AI Categorization Log | Kitsch Studio';
  }, []);
  
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dense, setDense] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'Shopee': return 'success';
      case 'Lazada': return 'primary';
      case 'TikTok': return 'secondary';
      case 'Excel': return 'warning';
      case 'Manual': return 'info';
      default: return 'default';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  };

  const formatConfidence = (confidence) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        AI Categorization Log
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Track AI-powered categorization of sales and expense transactions with accuracy monitoring and manual correction tracking.
      </Typography>

      {/* KPI Cards with Mini Charts */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        {MOCK_KPI_DATA.map((kpi) => (
          <Card key={kpi.title} sx={{ p: 2, flex: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  {kpi.title}
                </Typography>
                <Typography variant="h4" sx={{ color: kpi.color, fontWeight: 600, mb: 0.5 }}>
                  {kpi.value}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: kpi.trend === 'up' ? 'success.main' : 'error.main',
                    fontWeight: 600 
                  }}
                >
                  {kpi.change}
                </Typography>
              </Box>
              
              {/* Mini Chart */}
              <Box sx={{ width: 60, height: 30 }}>
                <svg width="60" height="30" viewBox="0 0 60 30">
                  <path
                    d={`M 0 ${30 - (kpi.miniChart[0] / Math.max(...kpi.miniChart)) * 30} ${kpi.miniChart.map((value, index) => 
                      `L ${(index + 1) * 5} ${30 - (value / Math.max(...kpi.miniChart)) * 30}`
                    ).join(' ')}`}
                    stroke={kpi.color}
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </Box>
            </Stack>
          </Card>
        ))}
      </Stack>

      {/* Charts Section */}
      <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
        {/* Top Categories Chart */}
        <Card sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Top Sales & Expense Categories
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Most frequently categorized transaction types.
          </Typography>
          
          <Stack spacing={1}>
            {MOCK_CATEGORY_DATA.map((item) => (
              <Box key={item.category}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.category}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {item.count}
                  </Typography>
                </Stack>
                <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.100', borderRadius: 1, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      width: `${item.percentage}%`, 
                      height: '100%', 
                      bgcolor: 'success.main',
                      borderRadius: 1,
                    }} 
                  />
                </Box>
              </Box>
            ))}
          </Stack>
        </Card>

        {/* Confidence Distribution Chart */}
        <Card sx={{ p: 3, flex: 1, position: 'relative' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Confidence Distribution
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            AI confidence score ranges.
          </Typography>
          
          {/* Notification Badge */}
          <Box sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            width: 20, 
            height: 20, 
            bgcolor: 'error.main', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
              2
            </Typography>
          </Box>
          
          <Stack spacing={1}>
            {MOCK_CONFIDENCE_DATA.map((item) => (
              <Box key={item.range}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.range}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {item.count}
                  </Typography>
                </Stack>
                <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.100', borderRadius: 1, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      width: `${(item.count / Math.max(...MOCK_CONFIDENCE_DATA.map(d => d.count))) * 100}%`, 
                      height: '100%', 
                      bgcolor: 'success.main',
                      borderRadius: 1,
                    }} 
                  />
                </Box>
              </Box>
            ))}
          </Stack>
        </Card>
      </Stack>

      {/* Transactions Table */}
      <Card sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Sales & Expense Categorization Log
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              AI categorization history for sales revenue and business expenses with accuracy tracking.
            </Typography>
          </Box>
        </Stack>

        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
          <Table size={dense ? 'small' : 'medium'}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>AI Category</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Confidence</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Corrected</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Final Category</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_TRANSACTIONS.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => (
                <TableRow key={transaction.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {transaction.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Label 
                      variant="soft" 
                      color={getSourceColor(transaction.source)}
                      sx={{ 
                        borderRadius: '12px',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {transaction.source}
                    </Label>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {transaction.aiCategory}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Label 
                      variant="soft" 
                      color={getConfidenceColor(transaction.confidence)}
                      sx={{ 
                        borderRadius: '12px',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {formatConfidence(transaction.confidence)}
                    </Label>
                  </TableCell>
                  <TableCell align="center">
                    {transaction.corrected ? (
                      <Iconify icon="eva:checkmark-fill" width={16} sx={{ color: 'success.main' }} />
                    ) : (
                      <Iconify icon="eva:close-fill" width={16} sx={{ color: 'text.disabled' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: transaction.corrected && transaction.finalCategory !== transaction.aiCategory 
                          ? 'warning.main' 
                          : 'text.primary'
                      }}
                    >
                      {transaction.finalCategory}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Controls */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
          <FormControlLabel
            control={<Switch checked={dense} onChange={(e) => setDense(e.target.checked)} />}
            label="Dense"
          />
          <TablePagination
            component="div"
            count={MOCK_TRANSACTIONS.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Stack>
      </Card>
    </DashboardContent>
  );
} 