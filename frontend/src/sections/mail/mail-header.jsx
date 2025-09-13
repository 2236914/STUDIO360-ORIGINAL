import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function MailHeader({ onOpenNav, onOpenMail, sx, ...other }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        pl: 1,
        pr: 2,
        py: 1,
        bgcolor: 'background.neutral',
        ...sx,
      }}
      {...other}
    >
      <IconButton onClick={onOpenNav}>
        <Iconify icon="solar:hamburger-menu-bold" />
      </IconButton>

      <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
        Mail & Support
      </Typography>

      {onOpenMail && (
        <IconButton onClick={onOpenMail}>
          <Iconify icon="solar:letter-bold" />
        </IconButton>
      )}
    </Stack>
  );
}
