import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { fCurrencyPHPSymbol } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function InvoiceAnalytic({ title, total, percent, price, icon, color }) {
  // Define colors statically to avoid theme circular references
  const getIconColor = () => {
    switch (color) {
      case 'info': return '#00B8D9';
      case 'success': return '#22C55E';
      case 'warning': return '#FFAB00';
      case 'error': return '#FF5630';
      default: return '#919EAB'; // Static grey color
    }
  };

  const getBgColor = () => {
    switch (color) {
      case 'info': return 'rgba(0, 184, 217, 0.08)';
      case 'success': return 'rgba(34, 197, 94, 0.08)';
      case 'warning': return 'rgba(255, 171, 0, 0.08)';
      case 'error': return 'rgba(255, 86, 48, 0.08)';
      default: return 'rgba(145, 158, 171, 0.08)'; // Static grey alpha
    }
  };

  return (
    <Box sx={{ py: 3, px: 3, flex: 1, minWidth: 200 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: getBgColor(),
            color: getIconColor(),
          }}
        >
          <Iconify icon={icon} width={28} />
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ typography: 'h6', color: 'text.primary', fontWeight: 600 }}>
            {title}
          </Box>

          <Box sx={{ typography: 'caption', color: 'text.secondary', mt: 0.5 }}>
            {total} invoices
          </Box>

          <Box sx={{ typography: 'body1', color: 'text.primary', fontWeight: 600, mt: 1 }}>
            {fCurrencyPHPSymbol(price, '₱', 2, '.', ',')}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}

InvoiceAnalytic.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  percent: PropTypes.number,
  price: PropTypes.number,
  title: PropTypes.string,
  total: PropTypes.number,
};
