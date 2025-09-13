'use client';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import { PortalWrapper } from '../portal';

// ----------------------------------------------------------------------

export function LoadingScreen({ portal, sx, ...other }) {
  const content = (
    <Box
      sx={{
        px: 5,
        width: 1,
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
      {...other}
    >
      <LinearProgress color="inherit" sx={{ width: 1, maxWidth: 360 }} />
    </Box>
  );

  if (portal) {
    return <PortalWrapper>{content}</PortalWrapper>;
  }

  return content;
}
