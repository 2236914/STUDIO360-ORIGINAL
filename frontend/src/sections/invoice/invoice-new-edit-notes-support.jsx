import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import { useFormContext } from 'react-hook-form';

// ----------------------------------------------------------------------

export function InvoiceNewEditNotesSupport({ methods }) {
  const { watch, setValue } = methods;

  const values = watch();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Notes & Support
      </Typography>

      <Stack spacing={3}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Notes"
          value={values.notes || ''}
          onChange={(e) => setValue('notes', e.target.value)}
          placeholder="We appreciate your business. Should you need us to add VAT or extra notes let us know!"
        />
        
        <TextField
          fullWidth
          label="Support Email"
          type="email"
          value={values.supportEmail || ''}
          onChange={(e) => setValue('supportEmail', e.target.value)}
          placeholder="support@abcapp.com"
        />
      </Stack>
    </Box>
  );
}

InvoiceNewEditNotesSupport.propTypes = {
  methods: PropTypes.shape({
    watch: PropTypes.func,
    setValue: PropTypes.func,
  }),
};
