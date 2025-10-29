'use client';

import { useState, useEffect } from 'react';

import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Dialog,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { eventsApi } from 'src/services/storePagesService';

export default function StoreEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    title: '',
    event_date: '',
    event_time: '',
    location: '',
    description: '',
    link: '',
    seller: '',
    booth: '',
    focus: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    document.title = 'Events | STUDIO360';
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await eventsApi.getEvents();
      setEvents(data || []);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm({
      title: '',
      event_date: '',
      event_time: '',
      location: '',
      description: '',
      link: '',
      seller: '',
      booth: '',
      focus: '',
      is_active: true,
      display_order: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (event) => {
    setEditingId(event.id);
    setForm({
      title: event.title || '',
      event_date: event.event_date || '',
      event_time: event.event_time || '',
      location: event.location || '',
      description: event.description || '',
      link: event.link || '',
      seller: event.seller || '',
      booth: event.booth || '',
      focus: event.focus || '',
      is_active: event.is_active !== undefined ? event.is_active : true,
      display_order: event.display_order || 0,
    });
    setDialogOpen(true);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const saveEvent = async () => {
    if (!form.title || !form.event_date) {
      showSnackbar('Title and date are required', 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingId) {
        await eventsApi.updateEvent(editingId, form);
        showSnackbar('Event updated successfully', 'success');
      } else {
        await eventsApi.createEvent(form);
        showSnackbar('Event created successfully', 'success');
      }

      await loadEvents();
      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving event:', err);
      showSnackbar('Failed to save event: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await eventsApi.deleteEvent(eventId);
      showSnackbar('Event deleted successfully', 'success');
      await loadEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      showSnackbar('Failed to delete event: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Events"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Store', href: paths.dashboard.store.root },
          { name: 'Events' },
        ]}
        action={
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={openNew}>
            New Event
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">Loading events...</Typography>
              </Box>
            ) : events.length === 0 ? (
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">No events yet. Click "New Event" to add your upcoming market or pop-up.</Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {events.map((ev) => (
                  <Card key={ev.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{ev.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {ev.event_date} {ev.event_time ? `• ${ev.event_time}` : ''} {ev.location ? `• ${ev.location}` : ''}
                        </Typography>
                        {ev.description ? (
                          <Typography variant="body2" sx={{ mt: 1 }}>{ev.description}</Typography>
                        ) : null}
                        {ev.link ? (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            Link: <a href={ev.link} target="_blank" rel="noreferrer">{ev.link}</a>
                          </Typography>
                        ) : null}
                        {(ev.seller || ev.booth || ev.focus) && (
                          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic' }}>
                            {ev.seller && `Seller: ${ev.seller}`} {ev.booth && `• Booth: ${ev.booth}`} {ev.focus && `• Focus: ${ev.focus}`}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <IconButton color="primary" onClick={() => openEdit(ev)}>
                          <Iconify icon="eva:edit-2-fill" />
                        </IconButton>
                        <IconButton color="error" onClick={() => deleteEvent(ev.id)}>
                          <Iconify icon="eva:trash-2-fill" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Event' : 'New Event'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField 
                type="date" 
                label="Date *" 
                InputLabelProps={{ shrink: true }} 
                value={form.event_date} 
                onChange={(e) => setForm({ ...form, event_date: e.target.value })} 
                sx={{ flex: 1 }} 
              />
              <TextField 
                type="time" 
                label="Time" 
                InputLabelProps={{ shrink: true }} 
                value={form.event_time} 
                onChange={(e) => setForm({ ...form, event_time: e.target.value })} 
                sx={{ flex: 1 }} 
              />
            </Stack>
            <TextField label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} fullWidth />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={3} />
            <TextField label="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} fullWidth />
            
            {/* Seller Information Section */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
              Seller Information (Optional)
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField 
                label="Seller" 
                value={form.seller} 
                onChange={(e) => setForm({ ...form, seller: e.target.value })} 
                fullWidth 
              />
              <TextField 
                label="Booth" 
                value={form.booth} 
                onChange={(e) => setForm({ ...form, booth: e.target.value })} 
                fullWidth 
              />
              <TextField 
                label="Focus" 
                value={form.focus} 
                onChange={(e) => setForm({ ...form, focus: e.target.value })} 
                fullWidth 
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEvent} startIcon={<Iconify icon="eva:save-fill" />} disabled={loading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}


