'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function VariationManager() {
  const { control, watch, setValue } = useFormContext();
  const [enableVariations, setEnableVariations] = useState(false);

  const { fields: variations, append: appendVariation, remove: removeVariation } = useFieldArray({
    control,
    name: 'variations',
  });

  const { fields: variationCombinations, append: appendCombination, remove: removeCombination, replace: replaceCombinations } = useFieldArray({
    control,
    name: 'variationCombinations',
  });

  const watchedVariations = watch('variations') || [];

  // Generate all possible combinations when variations change
  const generateCombinations = useCallback(() => {
    if (!enableVariations || watchedVariations.length === 0) {
      replaceCombinations([]);
      return;
    }

    // Filter out empty variations
    const validVariations = watchedVariations.filter(
      (variation) => variation.name && variation.options && variation.options.length > 0
    );

    if (validVariations.length === 0) {
      replaceCombinations([]);
      return;
    }

    // Generate cartesian product of all variation options
    const combinations = validVariations.reduce(
      (acc, variation) => {
        const newCombinations = [];
        variation.options.forEach((option) => {
          if (acc.length === 0) {
            newCombinations.push([{ variationName: variation.name, optionValue: option }]);
          } else {
            acc.forEach((combination) => {
              newCombinations.push([...combination, { variationName: variation.name, optionValue: option }]);
            });
          }
        });
        return newCombinations;
      },
      []
    );

    // Convert to our data structure
    const combinationData = combinations.map((combination, index) => {
      // Check if this combination already exists
      const existing = variationCombinations.find(existing => 
        existing.combination &&
        existing.combination.length === combination.length &&
        existing.combination.every(item => 
          combination.some(combItem => 
            combItem.variationName === item.variationName && 
            combItem.optionValue === item.optionValue
          )
        )
      );

      return {
        id: existing?.id || `combo-${Date.now()}-${index}`,
        combination,
        price: existing?.price || 0,
        stock: existing?.stock || 0,
        sku: existing?.sku || '',
        image: existing?.image || null
      };
    });

    replaceCombinations(combinationData);
  }, [enableVariations, watchedVariations, variationCombinations, replaceCombinations]);

  const handleEnableVariations = useCallback((enabled) => {
    setEnableVariations(enabled);
    if (!enabled) {
      setValue('variations', []);
      setValue('variationCombinations', []);
    } else {
      // Add first empty variation
      appendVariation({ name: '', options: [] });
    }
  }, [setValue, appendVariation]);

  const handleAddVariation = useCallback(() => {
    appendVariation({ name: '', options: [] });
  }, [appendVariation]);

  const handleRemoveVariation = useCallback((index) => {
    removeVariation(index);
    generateCombinations();
  }, [removeVariation, generateCombinations]);

  const handleAddOption = useCallback((variationIndex, option) => {
    const currentVariations = watch('variations');
    const variation = currentVariations[variationIndex];
    if (variation && option.trim() && !variation.options.includes(option.trim())) {
      const updatedOptions = [...variation.options, option.trim()];
      setValue(`variations.${variationIndex}.options`, updatedOptions);
      generateCombinations();
    }
  }, [watch, setValue, generateCombinations]);

  const handleRemoveOption = useCallback((variationIndex, optionIndex) => {
    const currentVariations = watch('variations');
    const variation = currentVariations[variationIndex];
    if (variation) {
      const updatedOptions = variation.options.filter((_, idx) => idx !== optionIndex);
      setValue(`variations.${variationIndex}.options`, updatedOptions);
      generateCombinations();
    }
  }, [watch, setValue, generateCombinations]);

  const VariationBuilder = ({ variation, variationIndex }) => {
    const [newOption, setNewOption] = useState('');

    const handleAddNewOption = () => {
      if (newOption.trim()) {
        handleAddOption(variationIndex, newOption);
        setNewOption('');
      }
    };

    return (
      <Card sx={{ p: 3, position: 'relative' }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <TextField
              size="small"
              label={`Variation ${variationIndex + 1}`}
              placeholder="e.g., Color, Size, Style..."
              value={variation.name || ''}
              onChange={(e) => setValue(`variations.${variationIndex}.name`, e.target.value)}
              sx={{ flexGrow: 1, mr: 2 }}
            />
            <IconButton 
              color="error" 
              onClick={() => handleRemoveVariation(variationIndex)}
              size="small"
            >
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Options
            </Typography>
            
            {/* Existing Options */}
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
              {variation.options?.map((option, optionIndex) => (
                <Chip
                  key={optionIndex}
                  label={option}
                  onDelete={() => handleRemoveOption(variationIndex, optionIndex)}
                  deleteIcon={<Iconify icon="eva:close-fill" width={16} />}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>

            {/* Add New Option */}
            <TextField
              size="small"
              placeholder="Add option..."
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNewOption();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={handleAddNewOption}
                      disabled={!newOption.trim()}
                    >
                      <Iconify icon="eva:plus-fill" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 300 }}
            />
          </Box>
        </Stack>
      </Card>
    );
  };

  const VariationCombinationsTable = () => {
    if (!enableVariations || variationCombinations.length === 0) {
      return null;
    }

    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Variation List
        </Typography>

        <Box sx={{ overflowX: 'auto' }}>
          {/* Header */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'auto 1fr auto auto auto',
            gap: 2,
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            minWidth: 600
          }}>
            <Typography variant="subtitle2">Image</Typography>
            <Typography variant="subtitle2">Combination</Typography>
            <Typography variant="subtitle2">Price</Typography>
            <Typography variant="subtitle2">Stock</Typography>
            <Typography variant="subtitle2">SKU</Typography>
          </Box>

          {/* Rows */}
          {variationCombinations.map((combination, index) => (
            <Box key={combination.id} sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'auto 1fr auto auto auto',
              gap: 2,
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              alignItems: 'center',
              minWidth: 600
            }}>
              {/* Image */}
              <Box sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: 'grey.100',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Iconify icon="eva:image-outline" width={20} sx={{ color: 'grey.400' }} />
              </Box>

              {/* Combination */}
              <Stack spacing={0.5}>
                {combination.combination?.map((item, itemIndex) => (
                  <Stack key={itemIndex} direction="row" spacing={1} alignItems="center">
                    <Chip 
                      label={item.variationName}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="body2">{item.optionValue}</Typography>
                  </Stack>
                ))}
              </Stack>

              {/* Price */}
              <TextField
                size="small"
                type="number"
                placeholder="0"
                value={combination.price || ''}
                onChange={(e) => setValue(`variationCombinations.${index}.price`, parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                sx={{ width: 120 }}
              />

              {/* Stock */}
              <TextField
                size="small"
                type="number"
                placeholder="0"
                value={combination.stock || ''}
                onChange={(e) => setValue(`variationCombinations.${index}.stock`, parseInt(e.target.value) || 0)}
                sx={{ width: 80 }}
              />

              {/* SKU */}
              <TextField
                size="small"
                placeholder="SKU"
                value={combination.sku || ''}
                onChange={(e) => setValue(`variationCombinations.${index}.sku`, e.target.value)}
                sx={{ width: 120 }}
              />
            </Box>
          ))}
        </Box>

        {/* Apply to All Button */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            size="small"
            startIcon={<Iconify icon="eva:copy-fill" />}
          >
            Apply to All
          </Button>
        </Stack>
      </Card>
    );
  };

  return (
    <Card>
      <Stack spacing={3} sx={{ p: 3 }}>
        {/* Enable Variations Toggle */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack>
            <Typography variant="h6">Variations</Typography>
            <Typography variant="body2" color="text.secondary">
              Add different options like colors, sizes, or styles for this product
            </Typography>
          </Stack>
          <FormControlLabel
            control={
              <Switch
                checked={enableVariations}
                onChange={(e) => handleEnableVariations(e.target.checked)}
              />
            }
            label="Enable Variations"
          />
        </Stack>

        {enableVariations && (
          <>
            <Divider />

            {/* Variation Builders */}
            <Stack spacing={3}>
              {variations.map((variation, index) => (
                <VariationBuilder
                  key={variation.id}
                  variation={variation}
                  variationIndex={index}
                />
              ))}

              {/* Add Variation Button */}
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={handleAddVariation}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Variation
              </Button>
            </Stack>

            {/* Generate Combinations Button */}
            {watchedVariations.length > 0 && (
              <Stack direction="row" justifyContent="center">
                <Button
                  variant="contained"
                  onClick={generateCombinations}
                  startIcon={<Iconify icon="eva:refresh-fill" />}
                >
                  Generate Combinations
                </Button>
              </Stack>
            )}
          </>
        )}
      </Stack>

      {/* Variation Combinations Table */}
      <VariationCombinationsTable />
    </Card>
  );
}
