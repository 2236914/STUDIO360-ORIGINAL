'use client';

import { useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const VOUCHER_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage Discount' },
  { value: 'fixed_amount', label: 'Fixed Amount' },
  { value: 'free_shipping', label: 'Free Shipping' },
  { value: 'buy_x_get_y', label: 'Buy X Get Y' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'expired', label: 'Expired' },
  { value: 'used', label: 'Used' },
];

// ----------------------------------------------------------------------

export function VoucherTableToolbar({ filters, onFilters, canReset, onResetFilters }) {
  const [open, setOpen] = useState(false);

  const handleFilters = (name, value) => {
    onFilters(name, value);
  };

  const handleResetFilters = () => {
    onResetFilters();
  };

  return (
    <Stack
      spacing={2.5}
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        p: 2.5,
        pr: { xs: 2.5, md: 1 },
      }}
    >
      <TextField
        fullWidth
        value={filters.search}
        onChange={(event) => handleFilters('search', event.target.value)}
        placeholder="Search vouchers..."
        InputProps={{
          startAdornment: (
            <IconButton>
              <Iconify icon="eva:search-fill" />
            </IconButton>
          ),
        }}
      />

      {open && (
        <Stack
          spacing={2}
          direction={{ xs: 'column', md: 'row' }}
          sx={{
            width: { xs: 1, md: 'auto' },
            minWidth: { xs: 1, md: 320 },
          }}
        >
          <TextField
            fullWidth
            select
            label="Status"
            value={filters.status}
            onChange={(event) => handleFilters('status', event.target.value)}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              },
            }}
            sx={{
              maxWidth: { md: 180 },
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Type"
            value={filters.type}
            onChange={(event) => handleFilters('type', event.target.value)}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: { maxHeight: 240 },
                },
              },
            }}
            sx={{
              maxWidth: { md: 180 },
            }}
          >
            {VOUCHER_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      )}

      <Stack direction="row" spacing={1} flexShrink={0} sx={{ width: { xs: 1, md: 'auto' } }}>
        <Tooltip title={open ? 'Hide filters' : 'Show filters'}>
          <IconButton onClick={() => setOpen(!open)}>
            <Iconify icon={open ? 'eva:close-fill' : 'eva:options-2-fill'} />
          </IconButton>
        </Tooltip>

        {canReset && (
          <Tooltip title="Reset">
            <IconButton onClick={handleResetFilters}>
              <Iconify icon="solar:restart-bold" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
}
