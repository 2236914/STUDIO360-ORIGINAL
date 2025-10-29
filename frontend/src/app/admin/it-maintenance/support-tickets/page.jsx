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
  TablePagination,
  Stack,
  Button,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextareaAutosize,
  CircularProgress,
  Alert,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import supportApi from 'src/services/support';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['all', 'open', 'in-progress', 'closed'];
const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent'];

const STATUS_COLORS = {
  open: 'warning',
  'in-progress': 'info',
  closed: 'success',
};

const PRIORITY_COLORS = {
  low: 'default',
  normal: 'info',
  high: 'warning',
  urgent: 'error',
};

export default function SupportTicketsPage() {
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await supportApi.listAllTickets();
      setTickets(data || []);
    } catch (err) {
      console.error('Error loading tickets:', err);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (ticketId) => {
    try {
      const data = await supportApi.getTicketDetails(ticketId);
      setSelectedTicket(data);
      setDialogOpen(true);
    } catch (err) {
      console.error('Error loading ticket details:', err);
      toast.error('Failed to load ticket details');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    
    try {
      await supportApi.replyToTicketAsAdmin(selectedTicket.id, { body: replyText });
      toast.success('Reply sent successfully');
      setReplyText('');
      // Reload ticket details
      const data = await supportApi.getTicketDetails(selectedTicket.id);
      setSelectedTicket(data);
    } catch (err) {
      console.error('Error sending reply:', err);
      toast.error('Failed to send reply');
    }
  };

  const handleUpdateStatus = async (ticketId, status, priority) => {
    try {
      await supportApi.updateTicketStatus(ticketId, status, priority);
      toast.success('Ticket updated successfully');
      loadTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        const data = await supportApi.getTicketDetails(ticketId);
        setSelectedTicket(data);
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
      toast.error('Failed to update ticket');
    }
  };

  useEffect(() => {
    document.title = 'Support Tickets | IT Maintenance';
    loadTickets();

    // Auto-refresh every 5 seconds
    const interval = setInterval(loadTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  const paginatedTickets = filteredTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        links={[
          { name: 'IT Maintenance', href: '/admin/it-maintenance' },
          { name: 'Support Tickets' },
        ]}
        sx={{ mb: 5 }}
      />

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Filter by Status"
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Chip 
            label={`${filteredTickets.length} tickets`} 
            color="primary" 
            variant="outlined" 
          />
        </Stack>
      </Card>

      {/* Tickets Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No tickets found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {ticket.id.slice(0, 8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {ticket.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status}
                        color={STATUS_COLORS[ticket.status] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.priority}
                        color={PRIORITY_COLORS[ticket.priority] || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewTicket(ticket.id)}
                      >
                        <Iconify icon="eva:eye-fill" />
                      </IconButton>
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
          count={filteredTickets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{selectedTicket?.subject}</Typography>
            <IconButton onClick={() => setDialogOpen(false)}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Stack spacing={3}>
              {/* Ticket Info */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Ticket Information</Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip label={`Status: ${selectedTicket.status}`} color={STATUS_COLORS[selectedTicket.status]} />
                  <Chip label={`Priority: ${selectedTicket.priority}`} color={PRIORITY_COLORS[selectedTicket.priority]} variant="outlined" />
                  <Chip label={selectedTicket.category} />
                </Stack>
              </Box>

              {/* Status Update Controls */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Update Status</Typography>
                <Stack direction="row" spacing={2}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value, selectedTicket.priority)}
                      label="Status"
                    >
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="in-progress">In Progress</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={selectedTicket.priority}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id, selectedTicket.status, e.target.value)}
                      label="Priority"
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>

              {/* Conversation Thread */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Conversation</Typography>
                <Stack spacing={2}>
                  {selectedTicket.messages?.map((msg) => (
                    <Card key={msg.id} sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(msg.created_at).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {msg.body}
                      </Typography>
                    </Card>
                  ))}
                </Stack>
              </Box>

              {/* Reply Section */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Reply</Typography>
                <TextareaAutosize
                  minRows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  style={{ width: '100%', padding: '8px', fontFamily: 'inherit' }}
                />
              </Box>

              {/* Attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Attachments</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedTicket.attachments.map((att) => (
                      <Button
                        key={att.id}
                        variant="outlined"
                        size="small"
                        href={att.cloudinary_url}
                        target="_blank"
                        startIcon={<Iconify icon="eva:paperclip-fill" />}
                      >
                        Attachment
                      </Button>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={handleReply}
            disabled={!replyText.trim()}
          >
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

