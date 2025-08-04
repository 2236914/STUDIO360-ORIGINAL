import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function NavUserCard() {
  const { user } = useAuthContext();

  return (
    <Box
      sx={{
        mx: 2,
        mb: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          alt={user?.displayName}
          src={user?.photoURL}
          sx={{
            width: 40,
            height: 40,
            mr: 2,
          }}
        >
          {user?.displayName?.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.displayName}
          </Typography>

          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
            {user?.role || 'admin'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
} 