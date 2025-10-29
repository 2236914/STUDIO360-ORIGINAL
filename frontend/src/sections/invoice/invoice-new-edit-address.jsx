import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { Iconify } from 'src/components/iconify';

import { AddressListDialog, AddressNewForm } from '../address';

// ----------------------------------------------------------------------

export function InvoiceNewEditAddress({ methods, addressBooks }) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const mdUp = useResponsive('up', 'md');

  const values = watch();

  const { invoiceFrom, invoiceTo } = values;

  const from = useBoolean();
  const to = useBoolean();
  const newAddress = useBoolean();

  const handleCreateAddress = (addressData) => {
    // Create a properly formatted address object
    const newAddressWithId = {
      id: Date.now(), // Simple ID generation
      name: addressData.name,
      company: addressData.name, // Use name as company for now
      address: addressData.fullAddress,
      phone: addressData.phoneNumber,
      email: '', // Not collected in the form
      fullAddress: addressData.fullAddress,
      phoneNumber: addressData.phoneNumber,
      addressType: addressData.addressType,
      primary: addressData.primary,
    };
    
    // Set the address in the appropriate field
    if (from.value) {
      setValue('invoiceFrom', newAddressWithId);
      from.onFalse();
    } else if (to.value) {
      setValue('invoiceTo', newAddressWithId);
      to.onFalse();
    }
    
    newAddress.onFalse();
  };

  return (
    <>
      <Stack
        spacing={{ xs: 3, md: 5 }}
        direction={{ xs: 'column', md: 'row' }}
        divider={
          <Divider
            flexItem
            orientation={mdUp ? 'vertical' : 'horizontal'}
            sx={{ borderStyle: 'dashed' }}
          />
        }
        sx={{ p: 3 }}
      >
        <Stack sx={{ width: 1 }}>
          <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              From:
            </Typography>

            <IconButton onClick={from.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2">{invoiceFrom?.name}</Typography>
            <Typography variant="body2">{invoiceFrom?.fullAddress}</Typography>
            <Typography variant="body2">{invoiceFrom?.phoneNumber}</Typography>
          </Stack>
        </Stack>

        <Stack sx={{ width: 1 }}>
          <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', flexGrow: 1 }}>
              To:
            </Typography>

            <IconButton onClick={to.onTrue}>
              <Iconify icon={invoiceTo ? 'solar:pen-bold' : 'mingcute:add-line'} />
            </IconButton>
          </Stack>

          {invoiceTo ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">{invoiceTo?.name}</Typography>
              <Typography variant="body2">{invoiceTo?.fullAddress}</Typography>
              <Typography variant="body2">{invoiceTo?.phoneNumber}</Typography>
            </Stack>
          ) : (
            <Typography typography="caption" sx={{ color: 'error.main' }}>
              {errors.invoiceTo?.message}
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* Address selection dialogs */}
      <AddressListDialog
        list={addressBooks}
        open={from.value}
        onClose={from.onFalse}
        onSelect={(address) => {
          setValue('invoiceFrom', address);
          from.onFalse();
        }}
        selected={(id) => invoiceFrom?.id === id}
        title="Select From Address"
        action={
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => {
              newAddress.onTrue();
            }}
          >
            + New
          </Button>
        }
      />

      <AddressListDialog
        list={addressBooks}
        open={to.value}
        onClose={to.onFalse}
        onSelect={(address) => {
          setValue('invoiceTo', address);
          to.onFalse();
        }}
        selected={(id) => invoiceTo?.id === id}
        title="Select To Address"
        action={
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => {
              newAddress.onTrue();
            }}
          >
            + New
          </Button>
        }
      />

      {/* New Address Form */}
      <AddressNewForm
        open={newAddress.value}
        onClose={newAddress.onFalse}
        onCreate={handleCreateAddress}
      />
    </>
  );
}

InvoiceNewEditAddress.propTypes = {
  methods: PropTypes.shape({
    watch: PropTypes.func,
    setValue: PropTypes.func,
  }),
  addressBooks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    company: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
  })),
};
