'use client';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';
import { fPercent, fCurrency } from 'src/utils/format-number';


// ----------------------------------------------------------------------

export function RenderCellVoucherCode({ params, onViewRow }) {
  return (
    <Link
      color="inherit"
      underline="hover"
      onClick={onViewRow}
      sx={{
        cursor: 'pointer',
        display: 'block',
        fontWeight: 'fontWeightMedium',
      }}
    >
      {params.row.code}
    </Link>
  );
}

export function RenderCellVoucherType({ params }) {
  const getTypeConfig = (type) => {
    const configs = {
      percentage: { label: 'Percentage', color: 'primary' },
      fixed_amount: { label: 'Fixed Amount', color: 'secondary' },
      free_shipping: { label: 'Free Shipping', color: 'info' },
      buy_x_get_y: { label: 'Buy X Get Y', color: 'warning' },
    };
    return configs[type] || { label: type, color: 'default' };
  };

  const config = getTypeConfig(params.row.type);

  return (
    <Chip
      variant="soft"
      label={config.label}
      color={config.color}
      size="small"
    />
  );
}

export function RenderCellVoucherValue({ params }) {
  const { type, value } = params.row;

  if (type === 'percentage') {
    return (
      <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
        {fPercent(value)}
      </Typography>
    );
  }

  if (type === 'fixed_amount') {
    return (
      <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
        {fCurrency(value)}
      </Typography>
    );
  }

  if (type === 'free_shipping') {
    return (
      <Chip
        variant="soft"
        label="Free"
        color="success"
        size="small"
      />
    );
  }

  return (
    <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
      {value}
    </Typography>
  );
}

export function RenderCellVoucherStatus({ params }) {
  const { status } = params.row;

  const getStatusConfig = (status) => {
    const configs = {
      active: { label: 'Active', color: 'success' },
      inactive: { label: 'Inactive', color: 'default' },
      expired: { label: 'Expired', color: 'error' },
      used: { label: 'Used', color: 'warning' },
    };
    return configs[status] || { label: status, color: 'default' };
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      variant="soft"
      label={config.label}
      color={config.color}
      size="small"
    />
  );
}

export function RenderCellVoucherUsage({ params }) {
  const { usedCount, usageLimit } = params.row;

  if (!usageLimit) {
    return (
      <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
        {usedCount}
      </Typography>
    );
  }

  const percentage = (usedCount / usageLimit) * 100;

  return (
    <Tooltip title={`${usedCount} of ${usageLimit} used`}>
      <Stack spacing={1} sx={{ minWidth: 60 }}>
        <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
          {usedCount}/{usageLimit}
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            height: 4,
            bgcolor: 'grey.300',
            borderRadius: 0.5,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${percentage}%`,
              bgcolor: percentage >= 90 ? 'error.main' : percentage >= 70 ? 'warning.main' : 'success.main',
            }}
          />
        </Stack>
      </Stack>
    </Tooltip>
  );
}

export function RenderCellVoucherValidity({ params }) {
  const { validFrom, validUntil, status } = params.row;
  const now = new Date();

  // Check if voucher is expired
  if (validUntil && new Date(validUntil) < now) {
    return (
      <Chip
        variant="soft"
        label="Expired"
        color="error"
        size="small"
      />
    );
  }

  // Check if voucher is not yet valid
  if (validFrom && new Date(validFrom) > now) {
    return (
      <Chip
        variant="soft"
        label="Not Started"
        color="warning"
        size="small"
      />
    );
  }

  // Show validity period
  if (validUntil) {
    return (
      <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
        Until {fDate(validUntil)}
      </Typography>
    );
  }

  return (
    <Chip
      variant="soft"
      label="No Expiry"
      color="info"
      size="small"
    />
  );
}

export function RenderCellCreatedAt({ params }) {
  return (
    <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
      {fDate(params.row.createdAt)}
    </Typography>
  );
}
