import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const LABEL_ICONS = {
  inbox: 'solar:inbox-bold',
  sent: 'iconamoon:send-fill',
  pending: 'solar:clock-circle-bold',
  resolved: 'eva:checkmark-circle-2-fill',
  spam: 'solar:danger-bold',
  important: 'material-symbols:label-important-rounded',
  starred: 'eva:star-fill',
};

// ----------------------------------------------------------------------

export function MailNavItem({ selected, label, onClickNavItem, ...other }) {
  const labelIcon = LABEL_ICONS[label.id] || 'solar:folder-bold';

  return (
    <Box component="li" sx={{ display: 'flex' }}>
      <ListItemButton
        disableGutters
        onClick={onClickNavItem}
        sx={{
          pl: 1,
          pr: 1.5,
          gap: 2,
          borderRadius: 0.75,
          color: 'text.secondary',
          ...(selected && { color: 'text.primary' }),
        }}
        {...other}
      >
        <Iconify icon={labelIcon} width={22} sx={{ color: label.color }} />

        <Box
          component="span"
          sx={{
            flexGrow: 1,
            textTransform: 'capitalize',
            typography: selected ? 'subtitle2' : 'body2',
          }}
        >
          {label.name}
        </Box>

        {!!label.unreadCount && (
          <Box 
            component="span" 
            sx={{ 
              typography: 'caption',
              bgcolor: 'error.main',
              color: 'white',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem'
            }}
          >
            {label.unreadCount}
          </Box>
        )}
      </ListItemButton>
    </Box>
  );
}
