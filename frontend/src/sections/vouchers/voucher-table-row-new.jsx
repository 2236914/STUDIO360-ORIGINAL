import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';

import { fDate } from 'src/utils/format-time';
import { fPercent, fCurrencyPHPSymbol } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

const formatDateMMDDYYYY = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

export function VoucherTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const { code, name, type, value, usageLimit, usedCount, status, validFrom, validUntil, createdAt } = row;

  const confirm = usePopover();

  const popover = usePopover();

  const handleDelete = useCallback(() => {
    onDeleteRow();
    confirm.onFalse();
  }, [onDeleteRow, confirm]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'expired': return 'error';
      case 'used': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'expired': return 'Expired';
      case 'used': return 'Used';
      default: return status;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'percentage': return 'Percentage';
      case 'fixed_amount': return 'Fixed Amount';
      case 'free_shipping': return 'Free Shipping';
      case 'buy_x_get_y': return 'Buy X Get Y';
      default: return type;
    }
  };

  const getUsagePercentage = () => {
    if (!usageLimit) return 0;
    return (usedCount / usageLimit) * 100;
  };

  const formatValue = () => {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'fixed_amount':
        return fCurrencyPHPSymbol(value, '₱', 2, '.', ',');
      case 'free_shipping':
        return 'Free';
      case 'buy_x_get_y':
        return 'BOGO';
      default:
        return value;
    }
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={name} src="" sx={{ mr: 2 }}>
            {name?.charAt(0).toUpperCase()}
          </Avatar>

          <Box>
            <Box component="div" variant="subtitle2" sx={{ maxWidth: 240, fontWeight: 600 }}>
              {code}
            </Box>

            <Box component="div" variant="body2" sx={{ color: 'text.secondary', maxWidth: 240 }}>
              {name}
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Box component="div" variant="body2">
            {fDate(createdAt)}
          </Box>
        </TableCell>

        <TableCell>
          <Box component="div" variant="body2">
            {formatDateMMDDYYYY(validFrom)} - {validUntil ? formatDateMMDDYYYY(validUntil) : 'No expiry'}
          </Box>
        </TableCell>

        <TableCell>
          <Box component="div" variant="body2" sx={{ fontWeight: 600 }}>
            {formatValue()}
          </Box>
        </TableCell>

        <TableCell align="center">
          <Box sx={{ minWidth: 120 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={getUsagePercentage()}
                  color={getUsagePercentage() >= 90 ? 'error' : getUsagePercentage() >= 70 ? 'warning' : 'success'}
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Box>
              <Box sx={{ ml: 1, typography: 'caption', color: 'text.secondary' }}>
                {fPercent(getUsagePercentage())}
              </Box>
            </Box>
            <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
              {usedCount}/{usageLimit || '∞'}
            </Box>
          </Box>
        </TableCell>

        <TableCell>
          <Label color={getStatusColor(status)} variant="soft">
            {getStatusLabel(status)}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>

          <CustomPopover
            open={popover.open}
            onClose={popover.onClose}
            arrow="right-top"
            anchorEl={popover.anchorEl}
            sx={{ width: 160 }}
          >
            <Button
              variant="text"
              color="inherit"
              onClick={() => {
                onViewRow();
                popover.onClose();
              }}
              startIcon={<Iconify icon="solar:eye-bold" />}
            >
              View
            </Button>

            <Button
              variant="text"
              color="inherit"
              onClick={() => {
                onEditRow();
                popover.onClose();
              }}
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Edit
            </Button>

            <Button
              variant="text"
              color="error"
              onClick={() => {
                confirm.onTrue();
                popover.onClose();
              }}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            >
              Delete
            </Button>
          </CustomPopover>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.open}
        onClose={confirm.onClose}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        }
      />
    </>
  );
}

VoucherTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
