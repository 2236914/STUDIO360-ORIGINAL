import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { fDate, fTime } from 'src/utils/format-time';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

// Mock login history data
const LOGIN_HISTORY = [
  {
    id: '1',
    date: '2024-01-15T10:30:00Z',
    device: 'Windows Chrome',
    location: 'Quezon City, Philippines',
    ipAddress: '192.168.1.1',
    status: 'successful',
    browser: 'Chrome 120.0',
    os: 'Windows 11',
  },
  {
    id: '2',
    date: '2024-01-14T15:45:00Z',
    device: 'iPhone Safari',
    location: 'Manila, Philippines',
    ipAddress: '192.168.1.2',
    status: 'successful',
    browser: 'Safari 17.0',
    os: 'iOS 17.2',
  },
  {
    id: '3',
    date: '2024-01-14T09:15:00Z',
    device: 'Windows Chrome',
    location: 'Quezon City, Philippines',
    ipAddress: '192.168.1.1',
    status: 'failed',
    browser: 'Chrome 120.0',
    os: 'Windows 11',
  },
  {
    id: '4',
    date: '2024-01-13T18:20:00Z',
    device: 'Android Chrome',
    location: 'Makati, Philippines',
    ipAddress: '192.168.1.3',
    status: 'successful',
    browser: 'Chrome Mobile 120.0',
    os: 'Android 14',
  },
  {
    id: '5',
    date: '2024-01-13T14:10:00Z',
    device: 'Windows Firefox',
    location: 'Quezon City, Philippines',
    ipAddress: '192.168.1.1',
    status: 'successful',
    browser: 'Firefox 121.0',
    os: 'Windows 11',
  },
  {
    id: '6',
    date: '2024-01-12T20:30:00Z',
    device: 'Mac Safari',
    location: 'Pasig, Philippines',
    ipAddress: '192.168.1.4',
    status: 'successful',
    browser: 'Safari 17.0',
    os: 'macOS Sonoma',
  },
  {
    id: '7',
    date: '2024-01-12T11:45:00Z',
    device: 'Windows Chrome',
    location: 'Unknown Location',
    ipAddress: '203.177.89.15',
    status: 'suspicious',
    browser: 'Chrome 119.0',
    os: 'Windows 10',
  },
];

// ----------------------------------------------------------------------

export function AccountHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState(LOGIN_HISTORY);

  const handleSearch = useCallback((event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === '') {
      setFilteredHistory(LOGIN_HISTORY);
    } else {
      const filtered = LOGIN_HISTORY.filter(
        (item) =>
          item.device.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          item.ipAddress.toLowerCase().includes(query) ||
          item.browser.toLowerCase().includes(query) ||
          item.os.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query)
      );
      setFilteredHistory(filtered);
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    toast.success('Login history cleared successfully!');
    setFilteredHistory([]);
  }, []);

  const handleExportHistory = useCallback(() => {
    // Create CSV content
    const headers = ['Date', 'Time', 'Device', 'Browser', 'OS', 'Location', 'IP Address', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map((item) =>
        [
          fDate(item.date),
          fTime(item.date),
          item.device,
          item.browser,
          item.os,
          `"${item.location}"`,
          item.ipAddress,
          item.status,
        ].join(',')
      ),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `login-history-${fDate(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Login history exported successfully!');
  }, [filteredHistory]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'successful':
        return 'success';
      case 'failed':
        return 'error';
      case 'suspicious':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDeviceIcon = (device) => {
    if (device.includes('Windows')) return 'logos:microsoft-windows';
    if (device.includes('iPhone') || device.includes('iOS')) return 'logos:apple';
    if (device.includes('Android')) return 'logos:android-icon';
    if (device.includes('Mac')) return 'logos:apple';
    return 'solar:device-2-bold';
  };

  return (
    <Stack spacing={3}>
      {/* Header Section */}
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Stack>
              <Typography variant="h6">Account Login History</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Monitor your account access and security activities
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:download-bold" />}
                onClick={handleExportHistory}
                disabled={filteredHistory.length === 0}
              >
                Export
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                onClick={handleClearHistory}
                disabled={filteredHistory.length === 0}
              >
                Clear History
              </Button>
            </Stack>
          </Stack>

          {/* Search */}
          <TextField
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by device, location, IP address..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          {/* Statistics */}
          <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
            <Stack alignItems="center">
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                {LOGIN_HISTORY.filter((item) => item.status === 'successful').length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Successful Logins
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h4" sx={{ color: 'error.main' }}>
                {LOGIN_HISTORY.filter((item) => item.status === 'failed').length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Failed Attempts
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h4" sx={{ color: 'warning.main' }}>
                {LOGIN_HISTORY.filter((item) => item.status === 'suspicious').length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Suspicious Activities
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h4" sx={{ color: 'info.main' }}>
                {new Set(LOGIN_HISTORY.map((item) => item.ipAddress)).size}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Unique Devices
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Card>

      {/* Login History Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table sx={{ 
              '& .MuiTableCell-root': {
                borderBottom: 'none',
                paddingTop: 2,
                paddingBottom: 2,
              },
              '& .MuiTableRow-root': {
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '&:not(:last-child)': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                },
              },
            }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Device</TableCell>
                  <TableCell>Browser & OS</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Stack alignItems="center" spacing={2}>
                        <Iconify icon="solar:history-bold" width={64} sx={{ color: 'text.disabled' }} />
                        <Typography variant="h6" sx={{ color: 'text.disabled' }}>
                          {searchQuery ? 'No matching login history found' : 'No login history available'}
                        </Typography>
                        {searchQuery && (
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setSearchQuery('');
                              setFilteredHistory(LOGIN_HISTORY);
                            }}
                          >
                            Clear Search
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((login) => (
                    <TableRow key={login.id} hover>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {fDate(login.date)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {fTime(login.date)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Iconify icon={getDeviceIcon(login.device)} width={24} />
                          <Typography variant="body2">{login.device}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack>
                          <Typography variant="body2">{login.browser}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {login.os}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{login.location}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {login.ipAddress}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={login.status.charAt(0).toUpperCase() + login.status.slice(1)}
                          color={getStatusColor(login.status)}
                          size="small"
                          variant="soft"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            toast.info(`Login details: ${login.device} from ${login.location}`);
                          }}
                        >
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>

      {/* Security Tips */}
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'info.main', bgcolor: 'info.lighter' }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="flex-start" spacing={2}>
            <Iconify icon="solar:shield-check-bold" sx={{ color: 'info.main', mt: 0.5 }} />
            <Stack>
              <Typography variant="subtitle2" sx={{ color: 'info.dark' }}>
                Security Tips
              </Typography>
              <Typography variant="body2" sx={{ color: 'info.dark', mt: 1 }}>
                Keep your account secure by monitoring login activities:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2, color: 'info.dark' }}>
                <li>Review login history regularly for suspicious activities</li>
                <li>Log out from unfamiliar devices immediately</li>
                <li>Use strong, unique passwords and enable 2FA when available</li>
                <li>Report any suspicious login attempts to support</li>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Card>
    </Stack>
  );
}
