'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Switch from '@mui/material/Switch';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Table, Paper, TableRow, TableBody, TableCell, TableHead, TableContainer } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const MOCK_KPI_DATA = [
  {
    title: 'Total Processed',
    value: '0',
    change: '+0%',
    trend: 'up',
    color: 'success.main',
    miniChart: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    title: 'Total Corrected',
    value: '0',
    change: '+0%',
    trend: 'up',
    color: 'warning.main',
    miniChart: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    title: 'Avg. Confidence',
    value: '0.0',
    change: '+0.0',
    trend: 'up',
    color: 'info.main',
    miniChart: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    title: 'Correction Rate',
    value: '0',
    change: '+0%',
    trend: 'up',
    color: 'error.main',
    miniChart: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];

const MOCK_CATEGORY_DATA = [];

const MOCK_CONFIDENCE_DATA = [];

const MOCK_TRANSACTIONS = [];

function getStats() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('aiBookkeeperStats');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export default function AIBookkeeperPage() {
  useEffect(() => {
    document.title = 'AI Bookkeeper | STUDIO360';
  }, []);
  
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dense, setDense] = useState(false);

  // Load stats from backend (fallback to localStorage) and subscribe to updates
  useEffect(() => {
    const loadLocal = () => setStats(getStats());
    const load = async () => {
      try {
        const res = await fetch('/api/ai/stats');
        if (res.ok) {
          const json = await res.json();
          if (json?.success) {
            setStats(json.data || null);
            return;
          }
        }
        loadLocal();
      } catch (_) {
        loadLocal();
      }
    };
    load();
    window.addEventListener('storage', load);
    const id = setInterval(load, 1500); // lightweight poll to catch same-tab updates
    return () => {
      window.removeEventListener('storage', load);
      clearInterval(id);
    };
  }, []);

  const handleUploadClick = () => {
    window.location.href = '/dashboard/ai-bookkeeper/upload-process';
  };

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

  const formatConfidence = (confidence) => `${Math.round(confidence * 100)}%`;

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        AI Bookkeeper
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Dashboard / Bookkeeping / AI Bookkeeper
      </Typography>

      {/* Overview Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Iconify icon="eva:bulb-fill" width={24} sx={{ color: 'primary.main', mt: 0.5 }} />
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              AI Bookkeeper Overview
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Your intelligent assistant for automated bookkeeping. I can help categorize transactions, 
              generate reports, analyze patterns, and provide financial insights to streamline your accounting.
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Upload CTA Section */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'secondary.lighter' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ mb: 1, color: 'secondary.main' }}>
              Start AI Bookkeeping Process
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Upload receipts, sales data, or Excel files to begin automated categorization and analysis
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Iconify icon="eva:upload-fill" />}
            onClick={handleUploadClick}
            sx={{
              bgcolor: 'secondary.main',
              '&:hover': { bgcolor: 'secondary.dark' },
              px: 3,
              py: 1.5,
            }}
          >
            Upload Button for OCR/Excel
          </Button>
        </Stack>
      </Card>

      {/* Analytics Cards (responsive) */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        <Card sx={{ p: 3, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
              <Iconify icon="eva:trending-up-fill" width={24} />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Transactions Processed
              </Typography>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                {stats?.processed ?? 0}
              </Typography>
              <Label variant="soft" color="success" sx={{ fontSize: '0.75rem' }}>
                {stats ? '+live' : '+0'}
              </Label>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 3, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <Iconify icon="eva:checkmark-circle-2-fill" width={24} />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Accuracy Rate
              </Typography>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                {`${stats?.accuracyRate ?? 0  }%`}
              </Typography>
              <Label variant="soft" color="success" sx={{ fontSize: '0.75rem' }}>
                {stats ? '+live' : '+0%'}
              </Label>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 3, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
              <Iconify icon="eva:clock-fill" width={24} />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Time Saved
              </Typography>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                {`${stats?.timeSavedMinutes ?? 0  } mins`}
              </Typography>
              <Label variant="soft" color="success" sx={{ fontSize: '0.75rem' }}>
                {stats ? '+live' : '+0m'}
              </Label>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 3, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
              <Iconify icon="eva:credit-card-fill" width={24} />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Cost Savings
              </Typography>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                {`₱${  stats ? Number(stats.costSavings || 0).toLocaleString() : '0'}`}
              </Typography>
              <Label variant="soft" color="success" sx={{ fontSize: '0.75rem' }}>
                {stats ? '+live' : '+₱0'}
              </Label>
            </Box>
          </Stack>
        </Card>
      </Stack>

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
            {MOCK_CATEGORY_DATA.length > 0 ? (
              MOCK_CATEGORY_DATA.map((item) => (
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
              ))
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                No category data available
              </Typography>
            )}
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
              0
            </Typography>
          </Box>
          
          <Stack spacing={1}>
            {MOCK_CONFIDENCE_DATA.length > 0 ? (
              MOCK_CONFIDENCE_DATA.map((item) => (
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
              ))
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                No confidence data available
              </Typography>
            )}
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
              {MOCK_TRANSACTIONS.length > 0 ? (
                MOCK_TRANSACTIONS.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => (
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No transactions available
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
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