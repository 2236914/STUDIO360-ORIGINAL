'use client';

import { useEffect, useState } from 'react';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';

import supportApi from 'src/services/support';

export default function SupportPopover({ anchorEl, open, onClose, onOpenTicket }) {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      supportApi
        .listRecentMessages()
        .then((data) => setMessages(Array.isArray(data) ? data : data?.data || []))
        .catch(() => setMessages([]))
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { width: 360, maxWidth: '100%' } } }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="subtitle1">Recent support messages</Typography>
      </Box>
      <Divider />
      {loading ? (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={22} />
        </Box>
      ) : (
        <List dense sx={{ py: 0 }}>
          {messages.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">No messages yet</Typography>
            </Box>
          )}
          {messages.map((m) => (
            <ListItem key={m.id} button onClick={() => onOpenTicket?.(m.ticket_id)}>
              <ListItemText
                primary={m.subject || m.body?.slice(0, 48) || 'Message'}
                secondary={new Date(m.created_at).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      )}
      <Divider />
      <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button size="small" onClick={onClose}>Close</Button>
        <Button size="small" variant="contained" onClick={() => onOpenTicket?.(null)}>New ticket</Button>
      </Box>
    </Popover>
  );
}


