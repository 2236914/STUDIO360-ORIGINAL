'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import supportApi from 'src/services/support';

const CATEGORIES = ['General', 'Billing', 'Technical', 'Maintenance'];

export default function SupportModal({ open, onClose, ticketId = null, onSubmitted }) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      let created = null;
      if (!ticketId) {
        created = await supportApi.createTicket({ subject, category, body: message });
      }
      const tid = ticketId || created?.id;
      if (message && ticketId) {
        await supportApi.replyToTicket(tid, { body: message });
      }
      for (const f of files) {
        await supportApi.uploadAttachment(tid, f);
      }
      if (imageUrl && imageUrl.startsWith('http')) {
        await supportApi.uploadAttachmentUrl(tid, imageUrl.trim());
      }
      onSubmitted?.(tid);
      onClose?.();
      setSubject('');
      setCategory(CATEGORIES[0]);
      setMessage('');
      setFiles([]);
      setImageUrl('');
    } catch (_) {
      // surface via UI later
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{ticketId ? 'Reply to ticket' : 'New support ticket'}</DialogTitle>
      <DialogContent dividers>
        {!ticketId && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth />
            <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
        <TextField
          sx={{ mt: 2 }}
          label={ticketId ? 'Reply message' : 'Describe your issue'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          multiline
          minRows={4}
        />
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Typography variant="caption">Attachments (images/docs)</Typography>
          <input type="file" multiple onChange={handleFileChange} />
          <TextField
            label="Or paste image URL"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting || (!ticketId && !subject)}>
          {ticketId ? 'Send reply' : 'Submit ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


