import PropTypes from 'prop-types';
import { useEffect, useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { inputBaseClasses } from '@mui/material/InputBase';

import { fCurrencyPHPSymbol } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function InvoiceNewEditDetails({ methods, serviceOptions }) {
  const { control, setValue, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const values = watch();

  const totalOnRow = values.items.map((item) => item.quantity * item.price);

  const subtotal = totalOnRow.reduce((acc, num) => acc + num, 0);

  const totalAmount = subtotal - values.discount - values.shipping + values.taxes;

  useEffect(() => {
    setValue('totalAmount', totalAmount);
  }, [setValue, totalAmount]);

  const handleAdd = () => {
    append({
      title: '',
      description: '',
      service: '',
      quantity: 1,
      price: 0,
      total: 0,
    });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  const handleClearService = useCallback(
    (index) => {
      setValue(`items[${index}].quantity`, 1);
      setValue(`items[${index}].price`, 0);
      setValue(`items[${index}].total`, 0);
    },
    [setValue]
  );

  const handleSelectService = useCallback(
    (index, option) => {
      const selectedService = serviceOptions.find((service) => service.name === option);
      setValue(`items[${index}].price`, selectedService?.price || 0);
      setValue(
        `items[${index}].total`,
        (selectedService?.price || 0) * values.items[index].quantity
      );
    },
    [setValue, serviceOptions, values.items]
  );

  const handleChangeQuantity = useCallback(
    (event, index) => {
      const quantity = Number(event.target.value);
      setValue(`items[${index}].quantity`, quantity);
      setValue(`items[${index}].total`, quantity * values.items[index].price);
    },
    [setValue, values.items]
  );

  const handleChangePrice = useCallback(
    (event, index) => {
      const price = Number(event.target.value);
      setValue(`items[${index}].price`, price);
      setValue(`items[${index}].total`, price * values.items[index].quantity);
    },
    [setValue, values.items]
  );

  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ mt: 3, textAlign: 'right', typography: 'body2' }}
    >
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Subtotal</Box>
                    <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrencyPHPSymbol(subtotal, '₱', 2, '.', ',') || '-'}</Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Shipping</Box>
        <Box sx={{ width: 160, ...(values.shipping && { color: 'error.main' }) }}>
                      {values.shipping ? `- ${fCurrencyPHPSymbol(values.shipping, '₱', 2, '.', ',')}` : '-'}
        </Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Discount</Box>
        <Box sx={{ width: 160, ...(values.discount && { color: 'error.main' }) }}>
                      {values.discount ? `- ${fCurrencyPHPSymbol(values.discount, '₱', 2, '.', ',')}` : '-'}
        </Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Taxes</Box>
                  <Box sx={{ width: 160 }}>{values.taxes ? fCurrencyPHPSymbol(values.taxes, '₱', 2, '.', ',') : '-'}</Box>
      </Stack>

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <div>Total</div>
        <Box sx={{ width: 160 }}>{fCurrencyPHPSymbol(totalAmount, '₱', 2, '.', ',') || '-'}</Box>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Details:
      </Typography>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
              <TextField
                size="small"
                name={`items[${index}].title`}
                label="Title"
                value={values.items[index].title}
                onChange={(e) => setValue(`items[${index}].title`, e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                size="small"
                name={`items[${index}].description`}
                label="Description"
                value={values.items[index].description}
                onChange={(e) => setValue(`items[${index}].description`, e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                select
                size="small"
                name={`items[${index}].service`}
                label="Service"
                value={values.items[index].service}
                onChange={(e) => handleSelectService(index, e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: { md: 160 } }}
              >
                <MenuItem
                  value=""
                  onClick={() => handleClearService(index)}
                  sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                >
                  None
                </MenuItem>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {serviceOptions.map((service) => (
                  <MenuItem key={service.id} value={service.name}>
                    {service.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                type="number"
                name={`items[${index}].quantity`}
                label="Quantity"
                placeholder="0"
                value={values.items[index].quantity}
                onChange={(event) => handleChangeQuantity(event, index)}
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: { md: 96 } }}
              />

              <TextField
                size="small"
                type="number"
                name={`items[${index}].price`}
                label="Price"
                placeholder="0.00"
                value={values.items[index].price}
                onChange={(event) => handleChangePrice(event, index)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>₱</Box>
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: { md: 96 } }}
              />

              <TextField
                disabled
                size="small"
                type="number"
                name={`items[${index}].total`}
                label="Total"
                placeholder="0.00"
                value={values.items[index].total === 0 ? '' : values.items[index].total.toFixed(2)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>$</Box>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  maxWidth: { md: 104 },
                  [`& .${inputBaseClasses.input}`]: {
                    textAlign: { md: 'right' },
                  },
                }}
              />
            </Stack>

            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => handleRemove(index)}
            >
              Remove
            </Button>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-end', md: 'center' }}
      >
        <Button
          size="small"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAdd}
          sx={{ flexShrink: 0 }}
        >
          Add Item
        </Button>

        <Stack
          spacing={2}
          justifyContent="flex-end"
          direction={{ xs: 'column', md: 'row' }}
          sx={{ width: 1 }}
        >
          <TextField
            size="small"
            label="Shipping($)"
            name="shipping"
            type="number"
            value={values.shipping}
            onChange={(e) => setValue('shipping', Number(e.target.value))}
            sx={{ maxWidth: { md: 120 } }}
          />

          <TextField
            size="small"
            label="Discount($)"
            name="discount"
            type="number"
            value={values.discount}
            onChange={(e) => setValue('discount', Number(e.target.value))}
            sx={{ maxWidth: { md: 120 } }}
          />

          <TextField
            size="small"
            label="Taxes(%)"
            name="taxes"
            type="number"
            value={values.taxes}
            onChange={(e) => setValue('taxes', Number(e.target.value))}
            sx={{ maxWidth: { md: 120 } }}
          />
        </Stack>
      </Stack>

      {renderTotal}
    </Box>
  );
}

InvoiceNewEditDetails.propTypes = {
  methods: PropTypes.object,
  serviceOptions: PropTypes.array,
};
