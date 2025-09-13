import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function InvoiceTableFiltersResult({ filters, onResetPage, totalResults, sx, ...other }) {
  const handleRemoveKeyword = useCallback(() => {
    filters.setState({ name: '' });
    onResetPage();
  }, [filters, onResetPage]);

  const handleRemoveService = useCallback(
    (inputValue) => {
      const newValue = filters.state.service.filter((item) => item !== inputValue);
      filters.setState({ service: newValue });
      onResetPage();
    },
    [filters, onResetPage]
  );

  const handleRemoveDate = useCallback(() => {
    filters.setState({ startDate: null, endDate: null });
    onResetPage();
  }, [filters, onResetPage]);

  const hasFilter = !!(
    filters.state.name ||
    filters.state.service.length ||
    filters.state.startDate ||
    filters.state.endDate
  );

  if (!hasFilter) {
    return null;
  }

  return (
    <Stack spacing={1.5} sx={{ p: 2.5, ...sx }} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{totalResults}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
        {!!filters.state.name && (
          <Block label="Name:">
            <Chip size="small" label={filters.state.name} onDelete={handleRemoveKeyword} />
          </Block>
        )}

        {!!filters.state.service.length && (
          <Block label="Service:">
            {filters.state.service.map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => handleRemoveService(item)}
              />
            ))}
          </Block>
        )}

        {!!filters.state.startDate && !!filters.state.endDate && (
          <Block label="Date:">
            <Chip
              size="small"
              label={`${fDate(filters.state.startDate)} - ${fDate(filters.state.endDate)}`}
              onDelete={handleRemoveDate}
            />
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetPage}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

InvoiceTableFiltersResult.propTypes = {
  filters: PropTypes.object,
  onResetPage: PropTypes.func,
  totalResults: PropTypes.number,
  sx: PropTypes.object,
};

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

      <Stack spacing={0.5} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}

Block.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  sx: PropTypes.object,
};
