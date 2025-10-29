import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';

import { Label } from '../../components/label';
import { fTime, fDate } from '../../utils/format-time';
import { fCurrencyPHPSymbol } from '../../utils/format-number';

// ----------------------------------------------------------------------

export function RenderCellPrice({ params }) {
  // Use PHP-style currency formatting with peso symbol
  return fCurrencyPHPSymbol(params.row.price, '₱', 2, '.', ',');
}

// ----------------------------------------------------------------------

export function RenderCellStatus({ params }) {
  return (
    <Label variant="soft" color={(params.row.status === 'active' && 'success') || 'default'}>
      {params.row.status}
    </Label>
  );
}

export function RenderCellCreatedAt({ params }) {
  return (
    <Stack spacing={0.5}>
      <Box component="span">{fDate(params.row.createdAt)}</Box>
      <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
        {fTime(params.row.createdAt)}
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function RenderCellStock({ params }) {
  return (
    <Stack justifyContent="center" sx={{ typography: 'caption', color: 'text.secondary' }}>
      <LinearProgress
        value={(params.row.stock * 100) / Math.max(params.row.minStock, 1)}
        variant="determinate"
        color={
          (params.row.inventoryType === 'out of stock' && 'error') ||
          (params.row.inventoryType === 'low stock' && 'warning') ||
          'success'
        }
        sx={{ mb: 1, width: 1, height: 6, maxWidth: 80 }}
      />
      {!!params.row.stock && params.row.stock} {params.row.inventoryType}
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function RenderCellProduct({ params }) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 2 }}>
      <Avatar
        alt={params.row.name}
        src={params.row.coverUrl}
        variant="rounded"
        sx={{ width: 64, height: 64 }}
      />

      <ListItemText
        disableTypography
        primary={
          <Typography color="inherit" sx={{ fontWeight: 500 }}>
            {params.row.name}
          </Typography>
        }
        secondary={
          <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
            {params.row.category}
          </Box>
        }
        sx={{ display: 'flex', flexDirection: 'column' }}
      />
    </Stack>
  );
}
