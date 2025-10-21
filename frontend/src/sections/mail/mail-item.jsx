import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const PRIORITY_COLORS = {
  urgent: 'error',
  high: 'warning',
  normal: 'info',
  low: 'default'
};

const SOURCE_ICONS = {
  chatbot: 'eva:message-circle-fill',
  email: 'eva:email-fill',
  direct: 'eva:phone-fill'
};

export function MailItem({ mail, selected, sx, ...other }) {
  return (
    <Box component="li" sx={{ display: 'flex' }}>
      <ListItemButton
        disableGutters
        sx={{
          p: 1.5,
          gap: 2,
          borderRadius: 1,
          ...(selected && { bgcolor: 'action.selected' }),
          ...sx,
        }}
        {...other}
      >
        <Avatar alt={mail.from} src="">
          {mail.from.charAt(0).toUpperCase()}
        </Avatar>

        <Stack sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle2" noWrap>
              {mail.from}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {mail.priority !== 'normal' && (
                <Chip
                  size="small"
                  label={mail.priority}
                  color={PRIORITY_COLORS[mail.priority]}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              )}
              <Iconify 
                icon={SOURCE_ICONS[mail.source] || 'eva:message-circle-fill'} 
                width={16} 
                sx={{ color: 'text.disabled' }}
              />
            </Stack>
          </Stack>

          <Typography
            variant="body2"
            noWrap
            sx={{
              color: mail.isRead ? 'text.secondary' : 'text.primary',
              fontWeight: mail.isRead ? 400 : 600,
              mb: 0.5
            }}
          >
            {mail.subject}
          </Typography>

          <Typography
            variant="body2"
            noWrap
            sx={{ color: 'text.disabled', fontSize: '0.8rem' }}
          >
            {mail.message}
          </Typography>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.disabled' }}
            >
              {fToNow(mail.timestamp)}
            </Typography>
            
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {mail.isStarred && (
                <Iconify icon="eva:star-fill" width={16} sx={{ color: 'warning.main' }} />
              )}
              {!mail.isRead && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  }}
                />
              )}
            </Stack>
          </Stack>
        </Stack>
      </ListItemButton>
    </Box>
  );
}
