import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

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

export function MailDetails({ mail, empty, loading }) {
  const theme = useTheme();

  if (loading) {
    return <LoadingScreen />;
  }

  if (empty || !mail) {
    return (
      <EmptyContent
        title="No ticket selected"
        description="Select a support ticket to read"
        imgUrl="/assets/icons/empty/ic-email-selected.svg"
      />
    );
  }

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ p: 3, pb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
        <IconButton>
          <Iconify icon="eva:arrow-back-fill" />
        </IconButton>

        <Stack direction="row" spacing={1}>
          <IconButton>
            <Iconify icon="eva:archive-fill" />
          </IconButton>
          <IconButton>
            <Iconify icon="eva:trash-2-fill" />
          </IconButton>
          <IconButton>
            <Iconify icon={mail.isStarred ? "eva:star-fill" : "eva:star-outline"} />
          </IconButton>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1}>
        <IconButton>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>
    </Stack>
  );

  const renderContent = (
    <Scrollbar sx={{ flex: '1 1 auto' }}>
      <Stack sx={{ p: 3, pt: 0 }}>
        {/* Ticket Header */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={mail.from} src="">
              {mail.from.charAt(0).toUpperCase()}
            </Avatar>
            
            <Stack sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle1">{mail.from}</Typography>
                <Chip
                  size="small"
                  label={mail.priority}
                  color={PRIORITY_COLORS[mail.priority]}
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
                <Iconify 
                  icon={SOURCE_ICONS[mail.source] || 'eva:message-circle-fill'} 
                  width={18} 
                  sx={{ color: 'text.disabled' }}
                />
              </Stack>
              
              <Typography variant="body2" color="text.secondary">
                {mail.email}
              </Typography>
              
              <Typography variant="caption" color="text.disabled">
                {fDateTime(mail.timestamp)} • Store: {mail.storeId}
              </Typography>
            </Stack>
          </Stack>

          <Typography variant="h6" sx={{ mt: 1 }}>
            {mail.subject}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Ticket Content */}
        <Stack spacing={3}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {mail.message}
          </Typography>

          {/* Ticket Metadata */}
          <Box sx={{ 
            p: 2, 
            bgcolor: 'background.neutral', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Ticket Information
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Ticket ID:</Typography>
                <Typography variant="body2" fontFamily="monospace">{mail.id}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Source:</Typography>
                <Typography variant="body2">{mail.source}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Priority:</Typography>
                <Typography variant="body2">{mail.priority}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Store:</Typography>
                <Typography variant="body2">{mail.storeId}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Scrollbar>
  );

  const renderActions = (
    <Stack 
      direction="row" 
      spacing={2} 
      sx={{ 
        p: 3, 
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Button
        variant="contained"
        startIcon={<Iconify icon="eva:email-fill" />}
        sx={{ flex: 1 }}
      >
        Reply
      </Button>
      <Button
        variant="outlined"
        startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
        color="success"
      >
        Resolve
      </Button>
      <IconButton color="primary">
        <Iconify icon="eva:more-horizontal-fill" />
      </IconButton>
    </Stack>
  );

  return (
    <Stack sx={{ flex: '1 1 auto', minHeight: 0 }}>
      {renderHead}
      {renderContent}
      {renderActions}
    </Stack>
  );
}
