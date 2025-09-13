'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Editor } from 'src/components/editor';

// ----------------------------------------------------------------------

export function MailCompose({ onCloseCompose, ...other }) {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
    priority: 'normal'
  });

  const fullScreen = useBoolean(false);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSend = () => {
    // Create new support ticket
    const newTicket = {
      id: `MANUAL_${Date.now()}`,
      from: 'Support Team',
      email: 'support@kitschstudio.com',
      subject: formData.subject,
      message: formData.message,
      timestamp: new Date(),
      isRead: true,
      isStarred: false,
      labels: ['sent'],
      storeId: 'kitschstudio',
      source: 'manual',
      priority: formData.priority,
      to: formData.to
    };

    // Add to sent items in localStorage
    const existingTickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
    existingTickets.push(newTicket);
    localStorage.setItem('support_tickets', JSON.stringify(existingTickets));

    // Close compose dialog
    onCloseCompose();
    
    // Show success message
    alert('Email sent successfully!');
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open
      onClose={onCloseCompose}
      PaperProps={{
        sx: {
          height: fullScreen.value ? '100vh' : '80vh',
          borderRadius: fullScreen.value ? 0 : 2,
        },
      }}
      {...other}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">New Message</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={fullScreen.onToggle}>
              <Iconify icon={fullScreen.value ? "eva:collapse-fill" : "eva:expand-fill"} />
            </IconButton>
            <IconButton onClick={onCloseCompose}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Stack sx={{ height: '100%' }}>
          {/* Header Fields */}
          <Stack spacing={2} sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              fullWidth
              label="To"
              value={formData.to}
              onChange={handleChange('to')}
              placeholder="customer@email.com"
            />
            
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={handleChange('subject')}
                placeholder="Support Response"
              />
              
              <TextField
                select
                label="Priority"
                value={formData.priority}
                onChange={handleChange('priority')}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </TextField>
            </Stack>
          </Stack>

          {/* Message Editor */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <Editor
              simple
              id="compose-editor"
              value={formData.message}
              onChange={(value) => setFormData(prev => ({ ...prev, message: value }))}
              placeholder="Write your message..."
              sx={{
                border: 'none',
                height: '100%',
                '& .ql-editor': {
                  minHeight: 200,
                  maxHeight: 400,
                  fontSize: '14px',
                  lineHeight: 1.6,
                },
                '& .ql-toolbar': {
                  borderTop: '1px solid',
                  borderColor: 'divider',
                },
              }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          <IconButton>
            <Iconify icon="eva:attach-2-fill" />
          </IconButton>
          <IconButton>
            <Iconify icon="eva:image-fill" />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button onClick={onCloseCompose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            startIcon={<Iconify icon="eva:paper-plane-fill" />}
            disabled={!formData.to || !formData.subject}
          >
            Send
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
