import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function InventoryTableFiltersResult({ filters, totalResults, onResetFilters, sx, ...other }) {
  const handleRemoveStock = useCallback(
    (inputValue) => {
      const newValue = filters.state.stock.filter((item) => item !== inputValue);
      filters.setState({ stock: newValue });
    },
    [filters]
  );

  const handleRemoveStatus = useCallback(
    (inputValue) => {
      const newValue = filters.state.status.filter((item) => item !== inputValue);
      filters.setState({ status: newValue });
    },
    [filters]
  );

  const handleRemoveAll = useCallback(() => {
    filters.setState({
      stock: [],
      status: [],
    });
  }, [filters]);

  return (
    <Stack spacing={1.5} sx={{ ...sx }}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{totalResults}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {!!filters.state.stock.length && (
          <Block label="Stock:">
            {filters.state.stock.map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => handleRemoveStock(item)}
              />
            ))}
          </Block>
        )}

        {!!filters.state.status.length && (
          <Block label="Status:">
            {filters.state.status.map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => handleRemoveStatus(item)}
              />
            ))}
          </Block>
        )}

        <Button
          color="error"
          onClick={handleRemoveAll}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}