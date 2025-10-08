import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
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
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';

import { fDate, fTime } from 'src/utils/format-time';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useAuthContext } from 'src/auth/hooks';

import accountHistoryService from 'src/services/accountHistoryService';

// ----------------------------------------------------------------------

export function AccountHistory() {
  // Authentication
  const { user, loading: authLoading } = useAuthContext();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    content: '',
    onConfirm: null
  });

  // Load login history on component mount and when user is authenticated
  useEffect(() => {
    console.log('Account History: Auth state changed:', { authLoading, user: user ? { id: user.id, email: user.email } : null });
    if (!authLoading && user) {
      loadLoginHistory();
    }
  }, [currentPage, user, authLoading]);

  // Filter history when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHistory(history);
    } else {
      const filtered = accountHistoryService.searchHistory(history, searchQuery);
      setFilteredHistory(filtered);
    }
  }, [searchQuery, history]);

  // Load login history from API
  const loadLoginHistory = useCallback(async () => {
    try {
      console.log('Account History: Loading login history with user:', user);
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await accountHistoryService.getLoginHistory({
        limit: itemsPerPage,
        offset,
        search: searchQuery || undefined
      });

      const formattedData = accountHistoryService.formatHistoryData(response.data);
      setHistory(formattedData);
      setFilteredHistory(formattedData);
      setTotalCount(response.pagination?.total || 0);
      setTotalPages(Math.ceil((response.pagination?.total || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error loading login history:', error);
      toast.error(error.message || 'Failed to load login history');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  // Handle search input
  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Show confirmation dialog
  const showConfirmDialog = useCallback((title, content, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      content,
      onConfirm
    });
  }, []);

  // Close confirmation dialog
  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog({
      open: false,
      title: '',
      content: '',
      onConfirm: null
    });
  }, []);

  // Handle clear history with confirmation
  const handleClearHistory = useCallback(() => {
    showConfirmDialog(
      'Clear Login History',
      'Are you sure you want to clear all your login history? This action cannot be undone.',
      async () => {
        try {
          setClearing(true);
          await accountHistoryService.clearHistory();
          toast.success('Login history cleared successfully!');
          await loadLoginHistory(); // Reload data
        } catch (error) {
          console.error('Error clearing history:', error);
          toast.error(error.message || 'Failed to clear login history');
        } finally {
          setClearing(false);
          closeConfirmDialog();
        }
      }
    );
  }, [showConfirmDialog, closeConfirmDialog, loadLoginHistory]);

  // Handle export history
  const handleExportHistory = useCallback(async () => {
    try {
      setExporting(true);
      await accountHistoryService.exportHistory();
      toast.success('Login history exported successfully!');
    } catch (error) {
      console.error('Error exporting history:', error);
      toast.error(error.message || 'Failed to export login history');
    } finally {
      setExporting(false);
    }
  }, []);

  // Handle delete specific entry
  const handleDeleteEntry = useCallback((entryId) => {
    showConfirmDialog(
      'Delete Entry',
      'Are you sure you want to delete this login entry? This action cannot be undone.',
      async () => {
        try {
          await accountHistoryService.deleteHistoryEntry(entryId);
          toast.success('Login entry deleted successfully!');
          await loadLoginHistory(); // Reload data
        } catch (error) {
          console.error('Error deleting entry:', error);
          toast.error(error.message || 'Failed to delete login entry');
        } finally {
          closeConfirmDialog();
        }
      }
    );
  }, [showConfirmDialog, closeConfirmDialog, loadLoginHistory]);

  // Handle page change
  const handlePageChange = useCallback((event, page) => {
    setCurrentPage(page);
  }, []);

  const getStatusColor = (status) => {
    return accountHistoryService.getStatusColor(status);
  };

  const getDeviceIcon = (device) => {
    return accountHistoryService.getDeviceIcon(device);
  };

  // Show loading state while authentication is loading
  if (authLoading) {
    return (
      <Stack spacing={3}>
        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading account history...
              </Typography>
            </Stack>
          </Box>
        </Card>
      </Stack>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <Stack spacing={3}>
        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <Stack spacing={2} alignItems="center">
              <Iconify icon="mdi:account-alert" width={48} sx={{ color: 'warning.main' }} />
              <Typography variant="h6" color="text.secondary">
                Please sign in to view your account history
              </Typography>
            </Stack>
          </Box>
        </Card>
      </Stack>
    );
  }

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
                startIcon={exporting ? <CircularProgress size={16} /> : <Iconify icon="solar:download-bold" />}
                onClick={handleExportHistory}
                disabled={filteredHistory.length === 0 || exporting}
              >
                {exporting ? 'Exporting...' : 'Export'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={clearing ? <CircularProgress size={16} /> : <Iconify icon="solar:trash-bin-trash-bold" />}
                onClick={handleClearHistory}
                disabled={filteredHistory.length === 0 || clearing}
              >
                {clearing ? 'Clearing...' : 'Clear History'}
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
                {filteredHistory.filter((item) => item.status === 'successful').length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Successful Logins
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h4" sx={{ color: 'error.main' }}>
                {filteredHistory.filter((item) => item.status === 'failed').length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Failed Attempts
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h4" sx={{ color: 'warning.main' }}>
                {filteredHistory.filter((item) => item.status === 'suspicious').length}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Suspicious Activities
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h4" sx={{ color: 'info.main' }}>
                {new Set(filteredHistory.map((item) => item.ipAddress)).size}
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Stack alignItems="center" spacing={2}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Loading login history...
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
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
                              setCurrentPage(1);
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
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              toast.info(`Login details: ${login.device} from ${login.location}`);
                            }}
                            title="View Details"
                          >
                            <Iconify icon="solar:eye-bold" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteEntry(login.id)}
                            title="Delete Entry"
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Card>

      {/* Security Tips */}
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: 'none', 
        border: '1px solid', 
        borderColor: 'success.main',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.04) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
          zIndex: 0
        }} />
        
        <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{
                p: 1.5,
                borderRadius: '50%',
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}>
                <Iconify icon="solar:shield-check-bold" sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Stack>
                <Typography variant="h6" sx={{ color: 'success.darker', fontWeight: 600 }}>
                  🔒 Security Tips
                </Typography>
                <Typography variant="body2" sx={{ color: 'success.dark', opacity: 0.8 }}>
                  Keep your account secure with these best practices
                </Typography>
              </Stack>
            </Stack>

            {/* Tips Grid */}
            <Grid container spacing={2}>
              {[
                {
                  icon: 'solar:eye-bold',
                  title: 'Monitor Regularly',
                  description: 'Review login history for suspicious activities'
                },
                {
                  icon: 'solar:logout-2-bold',
                  title: 'Log Out Safely',
                  description: 'Sign out from unfamiliar devices immediately'
                },
                {
                  icon: 'solar:key-bold',
                  title: 'Strong Passwords',
                  description: 'Use unique passwords and enable 2FA'
                },
                {
                  icon: 'solar:bug-bold',
                  title: 'Report Issues',
                  description: 'Report suspicious attempts to support'
                }
              ].map((tip, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'success.light',
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)'
                    }
                  }}>
                    <Stack direction="row" alignItems="flex-start" spacing={2}>
                      <Box sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: 'success.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Iconify icon={tip.icon} sx={{ color: 'success.main', fontSize: 16 }} />
                      </Box>
                      <Stack>
                        <Typography variant="subtitle2" sx={{ color: 'success.darker', fontWeight: 600 }}>
                          {tip.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'success.dark', opacity: 0.8, lineHeight: 1.4 }}>
                          {tip.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Footer CTA */}
            <Box sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid',
              borderColor: 'success.light'
            }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="solar:info-circle-bold" sx={{ color: 'success.main', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 500 }}>
                  Need help? Contact our security team for immediate assistance with any concerns.
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        title={confirmDialog.title}
        content={confirmDialog.content}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (confirmDialog.onConfirm) {
                confirmDialog.onConfirm();
              }
            }}
          >
            Confirm
          </Button>
        }
      />
    </Stack>
  );
}
