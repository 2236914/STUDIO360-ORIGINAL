import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export function InvoiceNewEditStatusDate({ methods }) {
  const { watch } = useFormContext();

  const values = watch();

  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ p: 3, bgcolor: 'background.neutral' }}
    >
      <TextField
        disabled
        fullWidth
        name="invoiceNumber"
        label="Invoice number"
        value={values.invoiceNumber}
        placeholder="Auto-generated on save"
      />

      <TextField
        fullWidth
        select
        name="status"
        label="Status"
        value={values.status}
        onChange={(e) => methods.setValue('status', e.target.value)}
      >
        {['paid', 'pending', 'overdue', 'draft'].map((option) => (
          <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        type="date"
        name="createDate"
        label="Date create"
        value={values.createDate ? new Date(values.createDate).toISOString().slice(0, 10) : ''}
        onChange={(e) => methods.setValue('createDate', new Date(e.target.value))}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        fullWidth
        type="date"
        name="dueDate"
        label="Due date"
        value={values.dueDate ? new Date(values.dueDate).toISOString().slice(0, 10) : ''}
        onChange={(e) => methods.setValue('dueDate', new Date(e.target.value))}
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  );
}

InvoiceNewEditStatusDate.propTypes = {
  methods: PropTypes.shape({
    watch: PropTypes.func,
  }),
};
