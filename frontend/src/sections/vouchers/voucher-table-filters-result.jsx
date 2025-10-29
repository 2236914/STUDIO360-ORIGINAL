'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function VoucherTableFiltersResult({ filters, onFilters, canReset, onResetFilters, results }) {
  const handleRemoveStatus = () => {
    onFilters('status', []);
  };

  const handleRemoveType = () => {
    onFilters('type', []);
  };

  const handleRemoveSearch = () => {
    onFilters('search', '');
  };

  return (
    <Stack spacing={1.5} sx={{ p: 3 }}>
      <Stack flexWrap="wrap" spacing={1} direction={{ xs: 'column', sm: 'row' }}>
        {!!filters.search && (
          <Chip
            label={`Search: "${filters.search}"`}
            size="small"
            onDelete={handleRemoveSearch}
          />
        )}

        {!!filters.status.length && (
          <Chip
            label={`Status: ${filters.status.length}`}
            size="small"
            onDelete={handleRemoveStatus}
          />
        )}

        {!!filters.type.length && (
          <Chip
            label={`Type: ${filters.type.length}`}
            size="small"
            onDelete={handleRemoveType}
          />
        )}

        {canReset && (
          <Button
            color="error"
            onClick={onResetFilters}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          >
            Clear
          </Button>
        )}
      </Stack>

      <Stack sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Stack>
    </Stack>
  );
}
