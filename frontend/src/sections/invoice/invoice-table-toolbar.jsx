import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { CustomPopover, usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function InvoiceTableToolbar({
  filters,
  dateError,
  onResetPage,
  options,
}) {
  const popover = usePopover();

  const handleFilterName = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ name: event.target.value });
    },
    [filters, onResetPage]
  );

  const handleFilterService = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ service: event.target.value });
    },
    [filters, onResetPage]
  );

  const handleFilterStartDate = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ startDate: event });
    },
    [filters, onResetPage]
  );

  const handleFilterEndDate = useCallback(
    (event) => {
      onResetPage();
      filters.setState({ endDate: event });
    },
    [filters, onResetPage]
  );

  const handleResetFilters = useCallback(() => {
    onResetPage();
    filters.reset();
  }, [filters, onResetPage]);

  const renderFilterName = (
    <TextField
      fullWidth
      value={filters.state.name}
      onChange={handleFilterName}
      placeholder="Search customer or invoice number..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
    />
  );

  const renderFilterService = (
    <FormControl fullWidth>
      <InputLabel>Service</InputLabel>
      <Select
        multiple
        value={filters.state.service}
        onChange={handleFilterService}
        input={<OutlinedInput label="Service" />}
        renderValue={(selected) => selected.map((value) => value).join(', ')}
      >
        {options.services.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox disableRipple size="small" checked={filters.state.service.includes(option)} />
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderFilterDate = (
    <Stack direction="row" spacing={2}>
      <TextField
        fullWidth
        label="Start date"
        type="date"
        value={filters.state.startDate ? filters.state.startDate.toISOString().slice(0, 10) : ''}
        onChange={(event) => handleFilterStartDate(new Date(event.target.value))}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        fullWidth
        label="End date"
        type="date"
        value={filters.state.endDate ? filters.state.endDate.toISOString().slice(0, 10) : ''}
        onChange={(event) => handleFilterEndDate(new Date(event.target.value))}
        InputLabelProps={{ shrink: true }}
        error={dateError}
      />
    </Stack>
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          {renderFilterName}

          {renderFilterService}

          {renderFilterDate}
        </Stack>

        <Button
          color="error"
          onClick={handleResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>

        <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        arrow="top-right"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  );
}

InvoiceTableToolbar.propTypes = {
  dateError: PropTypes.bool,
  filters: PropTypes.object,
  onResetPage: PropTypes.func,
  options: PropTypes.object,
};
