'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Stack,
  Button,
  Typography,
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
  Chip,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import announcementsApi from 'src/services/announcements';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const TYPE_OPTIONS = ['info', 'warning', 'maintenance', 'security'];
const TYPE_COLORS = {
  info: 'info',
  warning: 'warning',
  maintenance: 'warning',
  security: 'error',
};

export default function SystemAnnouncementsPage() {

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info',
    isActive: true,
    expiresAt: null, // dayjs or null
  });

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementsApi.listAllAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error loading announcements:', err);
      // Only show error toast for non-rate-limit errors
      if (!err.message?.includes('429') && !err.message?.includes('rate limit')) {
        toast.error('Failed to load announcements');
      }
      // For rate limits, silently fail and retry on next interval
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (announcement = null) => {
    if (announcement) {
      setEditingId(announcement.id);
      setForm({
        title: announcement.title,
        message: announcement.message,
        type: announcement.type,
        isActive: announcement.is_active,
        expiresAt: announcement.expires_at ? dayjs(announcement.expires_at) : null,
      });
    } else {
      setEditingId(null);
      setForm({
        title: '',
        message: '',
        type: 'info',
        isActive: true,
        expiresAt: null,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm({
      title: '',
      message: '',
      type: 'info',
      isActive: true,
      expiresAt: null,
    });
  };

  const handleSave = async () => {
    try {
      if (!form.title || !form.message) {
        toast.error('Title and message are required');
        return;
      }

      if (editingId) {
        await announcementsApi.updateSystemAnnouncement(editingId, {
          title: form.title,
          message: form.message,
          type: form.type,
          isActive: form.isActive,
          expiresAt: form.expiresAt ? form.expiresAt.toISOString() : null,
        });
        toast.success('Announcement updated successfully');
      } else {
        await announcementsApi.createSystemAnnouncement({
          title: form.title,
          message: form.message,
          type: form.type,
          isActive: form.isActive,
          expiresAt: form.expiresAt ? form.expiresAt.toISOString() : null,
        });
        toast.success('Announcement created successfully');
      }

      handleCloseDialog();
      loadAnnouncements();
    } catch (err) {
      console.error('Error saving announcement:', err);
      toast.error('Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await announcementsApi.deleteSystemAnnouncement(id);
      toast.success('Announcement deleted successfully');
      loadAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
      toast.error('Failed to delete announcement');
    }
  };

  useEffect(() => {
    document.title = 'System Announcements | IT Maintenance';
    loadAnnouncements();

    // Auto-refresh every 30 seconds (reduced from 5s to avoid rate limiting)
    const interval = setInterval(() => {
      loadAnnouncements();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        links={[
          { name: 'IT Maintenance', href: '/admin/it-maintenance' },
          { name: 'System Announcements' },
        ]}
        sx={{ mb: 5 }}
      />

      {/* Create Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => handleOpenDialog()}
        >
          Create Announcement
        </Button>
      </Box>

      {/* Announcements List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : announcements.length === 0 ? (
        <Alert severity="info">No announcements created yet.</Alert>
      ) : (
        <Stack spacing={2}>
          {announcements.map((announcement) => (
            <Card key={announcement.id} sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="h6">{announcement.title}</Typography>
                      <Chip
                        label={announcement.type}
                        color={TYPE_COLORS[announcement.type] || 'default'}
                        size="small"
                      />
                      {announcement.is_active ? (
                        <Chip label="Active" color="success" size="small" />
                      ) : (
                        <Chip label="Inactive" color="default" size="small" />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {announcement.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Created: {new Date(announcement.created_at).toLocaleString()}
                      {announcement.expires_at && (
                        <span> • Expires: {new Date(announcement.expires_at).toLocaleString()}</span>
                      )}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(announcement)}
                    >
                      <Iconify icon="eva:edit-fill" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Iconify icon="eva:trash-2-fill" />
                    </IconButton>
                  </Stack>
                </Box>

                {/* Preview */}
                <Alert
                  severity={TYPE_COLORS[announcement.type] || 'info'}
                  icon={<Iconify icon="eva:bell-fill" />}
                >
                  <Typography variant="subtitle2">{announcement.title}</Typography>
                  <Typography variant="body2">{announcement.message}</Typography>
                </Alert>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Announcement' : 'Create New Announcement'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <TextField
              label="Message"
              fullWidth
              multiline
              minRows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                label="Type"
              >
                {TYPE_OPTIONS.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Expiration Date (Optional)"
                value={form.expiresAt}
                onChange={(newValue) => setForm({ ...form, expiresAt: newValue })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

