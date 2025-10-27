'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useBoolean } from 'src/hooks/use-boolean';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function MailCompose({ onCloseCompose, onSendMail, replyMail, ...other }) {
  const [formData, setFormData] = useState({
    to: replyMail?.from || '',
    toEmail: replyMail?.email || '',
    subject: replyMail?.subject ? `Re: ${replyMail.subject}` : '',
    message: '',
    priority: replyMail?.priority || 'normal'
  });
  const [sending, setSending] = useState(false);

  const fullScreen = useBoolean(false);

  // Update form when replyMail changes
  useEffect(() => {
    if (replyMail) {
      setFormData({
        to: replyMail.from || '',
        toEmail: replyMail.email || '',
        subject: replyMail.subject ? `Re: ${replyMail.subject}` : '',
        message: '',
        priority: replyMail.priority || 'normal'
      });
    } else {
      // Reset to empty for new mail
      setFormData({
        to: '',
        toEmail: '',
        subject: '',
        message: '',
        priority: 'normal'
      });
    }
  }, [replyMail]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSend = async () => {
    if (!formData.subject || !formData.message || !formData.toEmail) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      
      // Prepare mail data for API
      const mailData = {
        from_name: 'Support Team',
        from_email: 'support@studio360.com',
        to_name: formData.to || formData.toEmail,
        to_email: formData.toEmail,
        subject: formData.subject,
        message: formData.message,
        type: 'sent',
        source: 'manual',
        priority: formData.priority,
        labels: ['sent'],
        is_read: true, // Sent messages are marked as read
        sent_at: new Date().toISOString(),
      };

      // Call parent handler to save to database
      if (onSendMail) {
        await onSendMail(mailData);
      }

      // Close compose dialog
      onCloseCompose();
    } catch (error) {
      console.error('Error sending mail:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
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
          <Typography variant="h6">
            {replyMail ? 'Reply' : 'New Message'}
          </Typography>
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
              required
              label="To (Email)"
              value={formData.toEmail}
              onChange={handleChange('toEmail')}
              placeholder="customer@email.com"
              type="email"
            />
            
            <TextField
              fullWidth
              label="To (Name)"
              value={formData.to}
              onChange={handleChange('to')}
              placeholder="Customer Name"
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
          <Button onClick={onCloseCompose} disabled={sending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            startIcon={<Iconify icon="eva:paper-plane-fill" />}
            disabled={!formData.toEmail || !formData.subject || sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
