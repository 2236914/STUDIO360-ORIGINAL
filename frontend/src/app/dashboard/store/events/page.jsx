'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Stack,
  Grid,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';

export default function StoreEventsPage() {
  useEffect(() => {
    document.title = 'Events | STUDIO360';
  }, []);

  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    link: '',
  });

  const openNew = () => {
    setEditingIndex(-1);
    setForm({ title: '', date: '', time: '', location: '', description: '', link: '' });
    setDialogOpen(true);
  };

  const openEdit = (index) => {
    setEditingIndex(index);
    setForm(events[index]);
    setDialogOpen(true);
  };

  const saveEvent = () => {
    if (!form.title || !form.date) {
      return;
    }
    if (editingIndex >= 0) {
      const next = [...events];
      next[editingIndex] = form;
      setEvents(next);
    } else {
      setEvents((prev) => [{ ...form, id: Date.now() }, ...prev]);
    }
    setDialogOpen(false);
  };

  const deleteEvent = (index) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
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
            {events.length === 0 ? (
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">No events yet. Click "New Event" to add your upcoming market or pop-up.</Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {events.map((ev, index) => (
                  <Card key={ev.id || index} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{ev.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {ev.date} {ev.time ? `• ${ev.time}` : ''} {ev.location ? `• ${ev.location}` : ''}
                        </Typography>
                        {ev.description ? (
                          <Typography variant="body2" sx={{ mt: 1 }}>{ev.description}</Typography>
                        ) : null}
                        {ev.link ? (
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            Link: <a href={ev.link} target="_blank" rel="noreferrer">{ev.link}</a>
                          </Typography>
                        ) : null}
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <IconButton color="primary" onClick={() => openEdit(index)}>
                          <Iconify icon="eva:edit-2-fill" />
                        </IconButton>
                        <IconButton color="error" onClick={() => deleteEvent(index)}>
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
        <DialogTitle>{editingIndex >= 0 ? 'Edit Event' : 'New Event'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} sx={{ flex: 1 }} />
              <TextField type="time" label="Time" InputLabelProps={{ shrink: true }} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} sx={{ flex: 1 }} />
            </Stack>
            <TextField label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} fullWidth />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={3} />
            <TextField label="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEvent} startIcon={<Iconify icon="eva:save-fill" />}>Save</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}


