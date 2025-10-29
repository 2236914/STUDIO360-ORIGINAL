import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';

import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function InventoryTableToolbar({ filters, options }) {
  const popover = usePopover();

  const handleFilterStock = useCallback(
    (newValue) => {
      const checked = filters.state.stock.includes(newValue)
        ? filters.state.stock.filter((value) => value !== newValue)
        : [...filters.state.stock, newValue];

      filters.setState({ stock: checked });
    },
    [filters]
  );

  const handleFilterStatus = useCallback(
    (newValue) => {
      const checked = filters.state.status.includes(newValue)
        ? filters.state.status.filter((value) => value !== newValue)
        : [...filters.state.status, newValue];

      filters.setState({ status: checked });
    },
    [filters]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
      >
        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel>Stock</InputLabel>

          <Select
            multiple
            value={filters.state.stock}
            onChange={(event) => filters.setState({ stock: event.target.value })}
            input={<OutlinedInput label="Stock" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            sx={{ textTransform: 'capitalize' }}
          >
            {options.stocks.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.state.stock.includes(option.value)}
                />
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel>Status</InputLabel>

          <Select
            multiple
            value={filters.state.status}
            onChange={(event) => filters.setState({ status: event.target.value })}
            input={<OutlinedInput label="Status" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            sx={{ textTransform: 'capitalize' }}
          >
            {options.status.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={filters.state.status.includes(option.value)}
                />
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'top-left' } }}
      >
        <MenuList>
          {options.stocks.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => {
                handleFilterStock(option.value);
              }}
            >
              <Checkbox
                disableRipple
                size="small"
                checked={filters.state.stock.includes(option.value)}
              />
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>
    </>
  );
}