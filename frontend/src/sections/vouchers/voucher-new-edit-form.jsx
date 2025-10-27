'use client';

import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { vouchersApi } from 'src/services/vouchersService';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, RHFSelect, RHFTextField } from 'src/components/hook-form';

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
];

const APPLICABLE_TO_OPTIONS = [
  { value: 'all', label: 'All Products' },
  { value: 'products', label: 'Specific Products' },
  { value: 'categories', label: 'Product Categories' },
];

// ----------------------------------------------------------------------

const voucherSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().optional(),
  type: z.enum(['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'], {
    required_error: 'Type is required',
  }),
  value: z.number().min(0, 'Value must be non-negative'),
  minOrderAmount: z.number().min(0, 'Minimum order amount must be non-negative').optional(),
  maxDiscount: z.number().min(0, 'Maximum discount must be non-negative').optional(),
  usageLimit: z.number().min(1, 'Usage limit must be at least 1').optional(),
  validFrom: z.date(),
  validUntil: z.date().optional(),
  applicableTo: z.enum(['all', 'products', 'categories']).default('all'),
  applicableIds: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

// ----------------------------------------------------------------------

export function VoucherNewEditForm({ currentVoucher, isModal = false, onSuccess, onCancel }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = {
    name: currentVoucher?.name || '',
    description: currentVoucher?.description || '',
    type: currentVoucher?.type || 'percentage',
    value: currentVoucher?.value || 0,
    minOrderAmount: currentVoucher?.minOrderAmount || 0,
    maxDiscount: currentVoucher?.maxDiscount || '',
    usageLimit: currentVoucher?.usageLimit || '',
    validFrom: currentVoucher?.validFrom ? new Date(currentVoucher.validFrom) : new Date(),
    validUntil: currentVoucher?.validUntil ? new Date(currentVoucher.validUntil) : undefined,
    applicableTo: currentVoucher?.applicableTo || 'all',
    applicableIds: currentVoucher?.applicableIds || [],
    status: currentVoucher?.status || 'active',
  };

  const methods = useForm({
    resolver: zodResolver(voucherSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting: formSubmitting },
  } = methods;

  const values = watch();

  // Reset form when currentVoucher changes
  useEffect(() => {
    if (currentVoucher) {
      reset(defaultValues);
    }
  }, [currentVoucher, reset]);

  // Update value validation based on type
  useEffect(() => {
    if (values.type === 'percentage') {
      if (values.value > 100) {
        setValue('value', 100);
      }
    }
  }, [values.type, values.value, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);

      // Generate voucher code if not provided (for new vouchers)
      const voucherCode = currentVoucher?.code || 
        `${data.type.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Prepare data for API
      const voucherData = {
        name: data.name,
        code: voucherCode,
        description: data.description || '',
        type: data.type,
        discount_value: data.value,
        min_purchase_amount: data.minOrderAmount || 0,
        max_discount_amount: data.maxDiscount || null,
        usage_limit: data.usageLimit || null,
        usage_limit_per_user: 1,
        start_date: data.validFrom.toISOString(),
        end_date: data.validUntil ? data.validUntil.toISOString() : null,
        status: data.status,
        is_active: data.status === 'active',
        // Store applicable info in JSONB fields
        applicable_product_ids: data.applicableTo === 'products' ? data.applicableIds : null,
        applicable_category_ids: data.applicableTo === 'categories' ? data.applicableIds : null,
      };

      if (currentVoucher) {
        // Update existing voucher
        await vouchersApi.updateVoucher(currentVoucher.id, voucherData);
        toast.success('Voucher updated successfully!');
      } else {
        // Create new voucher
        await vouchersApi.createVoucher(voucherData);
        toast.success(`Voucher created successfully! Code: ${voucherCode}`);
      }

      if (isModal && onSuccess) {
        onSuccess();
      } else {
        router.push(paths.dashboard.vouchers.root);
      }
    } catch (error) {
      console.error('Error saving voucher:', error);
      toast.error(error.message || 'Failed to save voucher. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  });

  const renderTypeSpecificFields = () => {
    if (values.type === 'percentage') {
      return (
        <>
          <RHFTextField
            name="value"
            label="Discount Percentage"
            type="number"
            InputProps={{
              endAdornment: '%',
            }}
            helperText="Maximum 100%"
          />
          <RHFTextField
            name="maxDiscount"
            label="Maximum Discount Amount"
            type="number"
            InputProps={{
              startAdornment: '₱',
            }}
            helperText="Maximum discount amount in pesos"
          />
        </>
      );
    }

    if (values.type === 'fixed_amount') {
      return (
        <RHFTextField
          name="value"
          label="Discount Amount"
          type="number"
          InputProps={{
            startAdornment: '₱',
          }}
          helperText="Fixed discount amount in pesos"
        />
      );
    }

    if (values.type === 'free_shipping') {
      return (
        <Typography variant="body2" color="text.secondary">
          This voucher will provide free shipping on eligible orders.
        </Typography>
      );
    }

    if (values.type === 'buy_x_get_y') {
      return (
        <Typography variant="body2" color="text.secondary">
          Buy X Get Y vouchers require additional configuration. This feature is coming soon.
        </Typography>
      );
    }

    return null;
  };

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Basic Information
            </Typography>

            <Stack spacing={3}>
              <RHFTextField
                name="name"
                label="Voucher Name"
                helperText="Enter a descriptive name for this voucher"
              />

              <RHFTextField
                name="description"
                label="Description"
                multiline
                rows={3}
                helperText="Optional description for this voucher"
              />

              <RHFSelect
                name="type"
                label="Voucher Type"
                options={VOUCHER_TYPE_OPTIONS}
              />

              {renderTypeSpecificFields()}
            </Stack>
          </Card>

          <Card sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Usage Rules
            </Typography>

            <Stack spacing={3}>
              <RHFTextField
                name="minOrderAmount"
                label="Minimum Order Amount"
                type="number"
                InputProps={{
                  startAdornment: '₱',
                }}
                helperText="Minimum order amount required to use this voucher"
              />

              <RHFTextField
                name="usageLimit"
                label="Usage Limit"
                type="number"
                helperText="Maximum number of times this voucher can be used (leave empty for unlimited)"
              />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Validity Period
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="validFrom"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="date"
                        label="Valid From"
                        value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        error={!!error}
                        helperText={error?.message}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: 1 }}
                      />
                    )}
                  />
                  <Controller
                    name="validUntil"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="date"
                        label="Valid Until"
                        value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        error={!!error}
                        helperText={error?.message}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: 1 }}
                      />
                    )}
                  />
                </Stack>
              </Box>
            </Stack>
          </Card>

          <Card sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Applicability
            </Typography>

            <Stack spacing={3}>
              <RHFSelect
                name="applicableTo"
                label="Applicable To"
                options={APPLICABLE_TO_OPTIONS}
              />

              {values.applicableTo !== 'all' && (
                <Typography variant="body2" color="text.secondary">
                  Product/category selection will be available in the next update.
                </Typography>
              )}
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Status & Settings
            </Typography>

            <Stack spacing={3}>
              <FormControl>
                <InputLabel>Status</InputLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Status">
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Preview
                </Typography>
                
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium' }}>
                    {values.name || 'Voucher Name'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {values.description || 'No description'}
                  </Typography>
                  
                  <Box sx={{ mt: 1 }}>
                    {values.type === 'percentage' && (
                      <Typography variant="body2">
                        {values.value}% off
                        {values.maxDiscount && ` (max ₱${values.maxDiscount})`}
                      </Typography>
                    )}
                    {values.type === 'fixed_amount' && (
                      <Typography variant="body2">
                        ₱{values.value} off
                      </Typography>
                    )}
                    {values.type === 'free_shipping' && (
                      <Typography variant="body2">
                        Free Shipping
                      </Typography>
                    )}
                  </Box>

                  {values.minOrderAmount > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Min order: ₱{values.minOrderAmount}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Stack>
          </Card>

          <Card sx={{ p: 3, mt: 3 }}>
            <Stack spacing={2}>
              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                loading={isSubmitting}
                startIcon={<Iconify icon="eva:checkmark-fill" />}
              >
                {currentVoucher ? 'Update Voucher' : 'Create Voucher'}
              </LoadingButton>

              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  if (isModal && onCancel) {
                    onCancel();
                  } else {
                    router.push(paths.dashboard.vouchers.root);
                  }
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
