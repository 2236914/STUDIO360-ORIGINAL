import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { fDate } from 'src/utils/format-time';
import { fCurrencyPHPSymbol } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export function InvoiceTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const { invoiceNumber, createDate, dueDate, invoiceTo, totalAmount, status, sent } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  const handleDelete = useCallback(() => {
    onDeleteRow();
    confirm.onFalse();
  }, [onDeleteRow, confirm]);

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={invoiceTo.name} sx={{ mr: 2 }}>
            {invoiceTo.name.charAt(0).toUpperCase()}
          </Avatar>

          <ListItemText
            primary={invoiceTo.name}
            secondary={invoiceNumber}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell sx={{ typography: 'body2' }}>
          <ListItemText
            primary={fDate(createDate)}
            secondary={fDate(createDate, 'HH:mm')}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell sx={{ typography: 'body2' }}>
          <ListItemText
            primary={fDate(dueDate)}
            secondary={fDate(dueDate, 'HH:mm')}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell sx={{ typography: 'body2' }}>{fCurrencyPHPSymbol(totalAmount, '₱', 2, '.', ',')}</TableCell>

        <TableCell align="center" sx={{ typography: 'body2' }}>
          {sent}
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'paid' && 'success') ||
              (status === 'pending' && 'warning') ||
              (status === 'overdue' && 'error') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton color={popover.open ? 'primary' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        arrow="top-right"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
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

InvoiceTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.shape({
    id: PropTypes.string,
    invoiceNumber: PropTypes.string,
    createDate: PropTypes.string,
    dueDate: PropTypes.string,
    invoiceTo: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }),
    totalAmount: PropTypes.number,
    status: PropTypes.string,
    sent: PropTypes.number,
  }),
  selected: PropTypes.bool,
};
