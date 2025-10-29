'use client';


import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function WholesalePricing() {
  const { control, watch, setValue } = useFormContext();

  const { fields: priceTiers, append: appendTier, remove: removeTier } = useFieldArray({
    control,
    name: 'wholesalePricing',
  });

  const handleAddPriceTier = () => {
    appendTier({
      minQuantity: 0,
      price: 0,
      discount: 0
    });
  };

  const handleRemovePriceTier = (index) => {
    removeTier(index);
  };

  return (
    <Card>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack>
          <Typography variant="h6">Wholesale</Typography>
          <Typography variant="body2" color="text.secondary">
            Wholesale will be hidden when product is under Add-on Deal & Bundle Deal.
          </Typography>
        </Stack>

        <Divider />

        {/* Price Tiers */}
        <Stack spacing={2}>
          {priceTiers.map((tier, index) => (
            <Box key={tier.id}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <TextField
                  size="small"
                  label="Min Quantity"
                  type="number"
                  placeholder="0"
                  value={tier.minQuantity || ''}
                  onChange={(e) => setValue(`wholesalePricing.${index}.minQuantity`, parseInt(e.target.value, 10) || 0)}
                  sx={{ width: 120 }}
                />

                <TextField
                  size="small"
                  label="Price"
                  type="number"
                  placeholder="0.00"
                  value={tier.price || ''}
                  onChange={(e) => setValue(`wholesalePricing.${index}.price`, parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                  sx={{ width: 120 }}
                />

                <TextField
                  size="small"
                  label="Discount %"
                  type="number"
                  placeholder="0"
                  value={tier.discount || ''}
                  onChange={(e) => setValue(`wholesalePricing.${index}.discount`, parseFloat(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  sx={{ width: 120 }}
                />

                <IconButton 
                  color="error" 
                  onClick={() => handleRemovePriceTier(index)}
                  size="small"
                >
                  <Iconify icon="eva:close-fill" />
                </IconButton>
              </Stack>
            </Box>
          ))}

          {/* Add Price Tier Button */}
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleAddPriceTier}
            sx={{ alignSelf: 'flex-start' }}
            size="small"
          >
            Add Price Tier
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
