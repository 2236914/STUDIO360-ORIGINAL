'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Typography,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  CircularProgress,
  Alert,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import accountHistoryService from 'src/services/accountHistoryService';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export default function AccountHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterActivity, setFilterActivity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await accountHistoryService.getLoginHistory({
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      });
      
      console.log('Account History Page: Full response:', response);
      console.log('Account History Page: Response data:', response.data);
      
      // The service returns { success, data, pagination, message }
      // Extract the actual data array
      const historyData = response?.data || [];
      
      console.log('Account History Page: Setting history to:', historyData);
      setHistory(historyData);
    } catch (err) {
      console.error('Error loading account history:', err);
      toast.error('Failed to load account history');
      setHistory([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Account History | IT Maintenance';
    loadHistory();
  }, [page, rowsPerPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'successful': return 'success';
      case 'failed': return 'error';
      case 'suspicious': return 'warning';
      default: return 'default';
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'login': return 'eva:log-in-fill';
      case 'logout': return 'eva:log-out-fill';
      case 'password_change': return 'eva:lock-fill';
      default: return 'eva:activity-fill';
    }
  };

  const filteredHistory = history.filter((entry) => {
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    const matchesActivity = filterActivity === 'all' || entry.activity_type === filterActivity;
    const matchesSearch = !searchQuery || 
      entry.device_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.ip_address?.includes(searchQuery);
    
    return matchesStatus && matchesActivity && matchesSearch;
  });

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        links={[
          { name: 'IT Maintenance', href: '/admin/it-maintenance' },
          { name: 'Account History' },
        ]}
        sx={{ mb: 5 }}
      />

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Iconify icon="eva:search-fill" sx={{ mr: 1 }} />,
            }}
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="successful">Successful</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="suspicious">Suspicious</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Activity</InputLabel>
            <Select
              value={filterActivity}
              onChange={(e) => setFilterActivity(e.target.value)}
              label="Activity"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="login">Login</MenuItem>
              <MenuItem value="logout">Logout</MenuItem>
              <MenuItem value="password_change">Password Change</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* History Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date/Time</TableCell>
                <TableCell>Activity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Device</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>IP Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No history found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(entry.created_at).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon={getActivityIcon(entry.activity_type)} />
                        <Typography variant="body2">
                          {entry.activity_type || 'Unknown'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entry.status || 'Unknown'}
                        color={getStatusColor(entry.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {entry.device_type || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.browser_name || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {entry.location || 'Unknown Location'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {entry.ip_address || 'Unknown'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={history.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>
    </DashboardContent>
  );
}

