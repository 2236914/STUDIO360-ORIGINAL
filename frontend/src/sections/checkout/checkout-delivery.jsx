import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function CheckoutDelivery({ options, categorizedOptions, onApplyShipping, ...other }) {
  const { control } = useFormContext();

  // Use categorized options if available, otherwise fall back to regular options
  const shouldUseCategorized = categorizedOptions && categorizedOptions.length > 0;

  return (
    <Card 
      {...other}
      sx={{
        borderRadius: 2,
        boxShadow: 1,
        ...other.sx
      }}
    >
      <CardHeader 
        title="Delivery Options" 
        sx={{ 
          pb: 0,
          '& .MuiCardHeader-title': {
            typography: 'h6',
            fontWeight: 600
          }
        }}
      />

      <Controller
        name="delivery"
        control={control}
        render={({ field }) => (
          <Box sx={{ p: { xs: 2, sm: 3 }, pt: 2 }}>
            {shouldUseCategorized ? (
              // Categorized view by courier
              <Stack spacing={3}>
                {categorizedOptions.map((category, index) => (
                  <Box key={category.courier}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {category.courier}
                      </Typography>
                      <Chip 
                        label={`${category.totalOptions} option${category.totalOptions > 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                      {category.cheapestFee === 0 ? (
                        <Chip 
                          label="FREE"
                          size="small"
                          color="success"
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          From ₱{category.cheapestFee}
                        </Typography>
                      )}
                    </Stack>
                    
                    <Box
                      columnGap={2}
                      rowGap={2.5}
                      display="grid"
                      gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
                    >
                      {category.options.map((option) => (
                        <OptionItem
                          key={option.id || option.value || option.label}
                          option={{
                            ...option,
                            value: option.fee,
                            label: option.fee === 0 ? 'Free' : `₱${option.fee}`,
                            courierName: option.courierName
                          }}
                          selected={field.value === option.fee}
                          onClick={() => {
                            if (!option.disabled) {
                              field.onChange(option.fee);
                              onApplyShipping(option.fee);
                            }
                          }}
                        />
                      ))}
                    </Box>
                    
                    {index < categorizedOptions.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Stack>
            ) : (
              // Regular grid view
              <Box
                columnGap={2}
                rowGap={2.5}
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
              >
                {options.map((option) => (
                  <OptionItem
                    key={option.value || option.label}
                    option={option}
                    selected={field.value === option.value}
                    onClick={() => {
                      if (!option.disabled) {
                        field.onChange(option.value);
                        onApplyShipping(option.value);
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      />
    </Card>
  );
}

function OptionItem({ option, selected, ...other }) {
  const isFreeCourier = option.value === 0;
  const isGlobalFreeShipping = option.isGlobalFreeShipping || false;
  const courierName = option.courierName || (isFreeCourier ? 'Standard' : 'Express');
  const isDisabled = option.disabled || false;
  const isAvailable = option.available !== false;
  
  return (
    <Paper
      variant="outlined"
      onClick={isDisabled ? undefined : other.onClick}
      sx={{
        p: 2.5,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease-in-out',
        opacity: isDisabled ? 0.6 : 1,
        ...(selected && !isDisabled && {
          borderColor: 'primary.main',
          boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}20`,
          bgcolor: 'primary.lighter',
        }),
        ...(isDisabled && {
          borderColor: 'grey.300',
          bgcolor: 'grey.50',
          color: 'text.disabled'
        }),
        ...(!isDisabled && {
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 1,
          },
        }),
        ...other.sx,
      }}
      {...other}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        {/* Courier Icon */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: selected ? 'primary.main' : 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify 
            icon={isGlobalFreeShipping ? "solar:gift-bold" : isFreeCourier ? "solar:gift-bold" : "solar:delivery-bold"} 
            sx={{ 
              color: selected ? 'white' : isGlobalFreeShipping ? 'success.main' : 'grey.600',
              width: 20,
              height: 20 
            }} 
          />
        </Box>

        {/* Delivery Info */}
        <Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: isDisabled ? 'text.disabled' : 'text.primary'
              }}
            >
              {option.label}
            </Typography>
              {(option.courierName || isGlobalFreeShipping) && (
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 0.75,
                    bgcolor: isGlobalFreeShipping && !isDisabled 
                      ? 'success.main' 
                      : selected && !isDisabled 
                        ? 'primary.main' 
                        : isDisabled 
                          ? 'grey.300' 
                          : 'grey.200',
                    color: (isGlobalFreeShipping || selected) && !isDisabled ? 'white' : isDisabled ? 'grey.500' : 'grey.700',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {isGlobalFreeShipping ? '🎁 Location Independent' : courierName}
                </Box>
              )}
          </Stack>
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDisabled ? 'text.disabled' : 'text.secondary' 
            }}
          >
            {option.description}
          </Typography>
          {option.region && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Region: {option.region}
            </Typography>
          )}
          {isDisabled && option.minAmount && (
            <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 500 }}>
              Requires minimum order of ₱{option.minAmount}
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* Price */}
      <Stack alignItems="flex-end">
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700, 
            color: isDisabled ? 'text.disabled' : selected ? 'primary.main' : 'text.primary' 
          }}
        >
          {option.value === 0 ? 'FREE' : `₱${option.value}`}
        </Typography>
        {selected && !isDisabled && (
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 0.5,
            }}
          >
            <Iconify icon="eva:checkmark-fill" sx={{ color: 'white', width: 12, height: 12 }} />
          </Box>
        )}
        {isDisabled && (
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: 'grey.300',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 0.5,
            }}
          >
            <Iconify icon="eva:close-fill" sx={{ color: 'grey.500', width: 12, height: 12 }} />
          </Box>
        )}
      </Stack>
    </Paper>
  );
}