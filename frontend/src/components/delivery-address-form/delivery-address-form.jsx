import { z as zod } from 'zod';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

import { PROVINCES, getBarangaysByCity, getCitiesByProvince } from 'src/data/philippines-address';

import { Form, RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const DeliveryAddressSchema = zod.object({
  street: zod.string().min(1, 'Street address is required'),
  province: zod.string().min(1, 'Province is required'),
  city: zod.string().min(1, 'City/Municipality is required'),
  barangay: zod.string().min(1, 'Barangay is required'),
  zipCode: zod.string().min(4, 'ZIP code must be 4 digits').max(4, 'ZIP code must be 4 digits'),
  additionalInfo: zod.string().optional(),
});

// ----------------------------------------------------------------------

export function DeliveryAddressForm({ 
  onSubmit, 
  defaultValues = {}, 
  title = "Delivery Address",
  showTitle = true,
  sx,
  ...other 
}) {
  const [availableCities, setAvailableCities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);

  const formDefaultValues = {
    street: '',
    province: '',
    city: '',
    barangay: '',
    zipCode: '',
    additionalInfo: '',
    ...defaultValues,
  };

  const methods = useForm({
    resolver: zodResolver(DeliveryAddressSchema),
    defaultValues: formDefaultValues,
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = methods;

  // Watch for province and city changes
  const selectedProvince = useWatch({ control: methods.control, name: 'province' });
  const selectedCity = useWatch({ control: methods.control, name: 'city' });

  // Update cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      const cities = getCitiesByProvince(selectedProvince);
      setAvailableCities(cities);
      // Reset city and barangay when province changes
      if (methods.getValues('city') && !cities.includes(methods.getValues('city'))) {
        setValue('city', '');
        setValue('barangay', '');
        setAvailableBarangays([]);
      }
    } else {
      setAvailableCities([]);
      setAvailableBarangays([]);
    }
  }, [selectedProvince, setValue, methods]);

  // Update barangays when city changes  
  useEffect(() => {
    if (selectedProvince && selectedCity) {
      const barangays = getBarangaysByCity(selectedProvince, selectedCity);
      setAvailableBarangays(barangays);
      // Reset barangay when city changes
      if (methods.getValues('barangay') && !barangays.includes(methods.getValues('barangay'))) {
        setValue('barangay', '');
      }
    } else {
      setAvailableBarangays([]);
    }
  }, [selectedProvince, selectedCity, setValue, methods]);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit?.(data);
    } catch (error) {
      console.error('Error submitting delivery address:', error);
    }
  });

  return (
    <Card 
      sx={{ 
        borderRadius: 2,
        boxShadow: 1,
        ...sx 
      }}
      {...other}
    >
      {showTitle && (
        <CardHeader 
          title={title}
          sx={{ 
            pb: 0,
            '& .MuiCardHeader-title': {
              typography: 'h6',
              fontWeight: 600
            }
          }}
        />
      )}
      
      <Box sx={{ p: { xs: 2, sm: 3 }, pt: showTitle ? 2 : { xs: 2, sm: 3 } }}>
        <Form methods={methods} onSubmit={handleFormSubmit}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Street Address */}
            <Grid xs={12}>
              <RHFTextField
                name="street"
                label="Street Address"
                placeholder="House number, street name, subdivision"
                helperText="Include house/building number, street name, and subdivision if applicable"
              />
            </Grid>

            {/* Province > City > Barangay Row */}
            <Grid xs={12} sm={4}>
              <RHFSelect
                name="province"
                label="Province"
                placeholder="Select Province"
                options={[
                  { value: '', label: 'Select Province' },
                  ...PROVINCES.map((province) => ({ 
                    value: province, 
                    label: province 
                  }))
                ]}
              />
            </Grid>

            <Grid xs={12} sm={4}>
              <RHFSelect
                name="city"
                label="City/Municipality"
                placeholder="Select City"
                disabled={!selectedProvince}
                options={[
                  { value: '', label: selectedProvince ? 'Select City' : 'Select Province first' },
                  ...availableCities.map((city) => ({ 
                    value: city, 
                    label: city 
                  }))
                ]}
                helperText={!selectedProvince ? 'Please select a province first' : ''}
              />
            </Grid>

            <Grid xs={12} sm={4}>
              <RHFSelect
                name="barangay"
                label="Barangay"
                placeholder="Select Barangay"
                disabled={!selectedCity}
                options={[
                  { value: '', label: selectedCity ? 'Select Barangay' : 'Select City first' },
                  ...availableBarangays.map((barangay) => ({ 
                    value: barangay, 
                    label: barangay 
                  }))
                ]}
                helperText={!selectedCity ? 'Please select a city first' : ''}
              />
            </Grid>

            {/* ZIP Code and Additional Info Row */}
            <Grid xs={12} sm={6}>
              <RHFTextField
                name="zipCode"
                label="ZIP Code"
                placeholder="e.g. 4217"
                inputProps={{ 
                  maxLength: 4,
                  pattern: '[0-9]*',
                  inputMode: 'numeric'
                }}
                helperText="4-digit postal code"
              />
            </Grid>

            <Grid xs={12} sm={6}>
              <RHFTextField
                name="additionalInfo"
                label="Additional Info / Landmark"
                placeholder="e.g. Near SM Mall, Beside Church"
                helperText="Optional: Landmarks or additional directions"
              />
            </Grid>

            {/* Address Summary */}
            {selectedProvince && selectedCity && (
              <Grid xs={12}>
                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: (theme) => theme.vars?.palette?.grey?.[50] || '#F9FAFB',
                    borderRadius: 1,
                    border: (theme) => `1px solid ${theme.vars?.palette?.grey?.[200] || '#E5E7EB'}`
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                    Address Preview:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {methods.watch('street') && `${methods.watch('street')}, `}
                    {methods.watch('barangay') && `${methods.watch('barangay')}, `}
                    {selectedCity}, {selectedProvince}
                    {methods.watch('zipCode') && ` ${methods.watch('zipCode')}`}
                  </Typography>
                  {methods.watch('additionalInfo') && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Landmark: {methods.watch('additionalInfo')}
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </Form>
      </Box>
    </Card>
  );
}

DeliveryAddressForm.propTypes = {
  onSubmit: PropTypes.func,
  defaultValues: PropTypes.object,
  title: PropTypes.string,
  showTitle: PropTypes.bool,
  sx: PropTypes.object,
};
