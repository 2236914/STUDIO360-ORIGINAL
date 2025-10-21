'use client';

import { useMemo, useState, useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// VariationBuilder component - moved outside to avoid render-time definition
const VariationBuilder = ({ variation, variationIndex, onAddOption, onRemoveOption, onRemoveVariation, onUpdateVariationName }) => {
  const [newOption, setNewOption] = useState('');

  const handleAddNewOption = () => {
    if (newOption.trim()) {
      onAddOption(variationIndex, newOption);
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
            onChange={(e) => onUpdateVariationName(variationIndex, e.target.value)}
            sx={{ flexGrow: 1, mr: 2 }}
          />
          <IconButton
            color="error"
            onClick={() => onRemoveVariation(variationIndex)}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              bgcolor: 'error.lighter',
              '&:hover': { bgcolor: 'error.light' }
            }}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>

        {/* Options List */}
        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Options:
          </Typography>
          <Stack direction="row" flexWrap="wrap" spacing={1}>
            {(variation.options || []).map((option, optionIndex) => (
              <Chip
                key={optionIndex}
                label={option}
                onDelete={() => onRemoveOption(variationIndex, optionIndex)}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </Stack>
        </Stack>

        {/* Add New Option */}
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Add new option..."
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddNewOption()}
            sx={{ flexGrow: 1 }}
          />
          <Button
            size="small"
            variant="outlined"
            onClick={handleAddNewOption}
            disabled={!newOption.trim()}
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            Add
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};

// VariationCombinationsTable component - moved outside to avoid render-time definition
const VariationCombinationsTable = ({ enableVariations, variationCombinations, onUpdateCombination, onRemoveCombination }) => {
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 2,
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 1,
          mb: 2,
          minWidth: '600px'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Combination
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Price
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Stock
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            SKU
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Actions
          </Typography>
        </Box>

        {/* Rows */}
        <Stack spacing={1}>
          {variationCombinations.map((combination, index) => (
            <Box
              key={combination.id || index}
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 2,
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                alignItems: 'center',
                minWidth: '600px'
              }}
            >
              {/* Combination */}
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {combination.combination?.map(c => c.optionValue).join(', ') || 'N/A'}
              </Typography>

              {/* Price */}
              <TextField
                size="small"
                type="number"
                placeholder="0.00"
                value={combination.price || ''}
                onChange={(e) => onUpdateCombination(index, 'price', parseFloat(e.target.value) || 0)}
                sx={{ width: 100 }}
              />

              {/* Stock */}
              <TextField
                size="small"
                type="number"
                placeholder="0"
                value={combination.stock || ''}
                onChange={(e) => onUpdateCombination(index, 'stock', parseInt(e.target.value, 10) || 0)}
                sx={{ width: 80 }}
              />

              {/* SKU */}
              <TextField
                size="small"
                placeholder="SKU"
                value={combination.sku || ''}
                onChange={(e) => onUpdateCombination(index, 'sku', e.target.value)}
                sx={{ width: 120 }}
              />

              {/* Actions */}
              <IconButton
                color="error"
                size="small"
                onClick={() => onRemoveCombination(index)}
              >
                <Iconify icon="eva:trash-2-outline" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </Box>
    </Card>
  );
};

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

  const watchedVariationsValue = watch('variations');
  const watchedVariations = useMemo(() => watchedVariationsValue || [], [watchedVariationsValue]);

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

    // Generate all possible combinations
    const combinations = [];
    const generateCombinationsRecursive = (currentCombination, remainingVariations) => {
      if (remainingVariations.length === 0) {
        combinations.push(currentCombination);
        return;
      }

      const currentVariation = remainingVariations[0];
      const remaining = remainingVariations.slice(1);

      currentVariation.options.forEach((option) => {
        const newCombination = [
          ...currentCombination,
          {
            variationName: currentVariation.name,
            optionValue: option,
          },
        ];
        generateCombinationsRecursive(newCombination, remaining);
      });
    };

    generateCombinationsRecursive([], validVariations);

    // Convert to the format expected by the form
    const formattedCombinations = combinations.map((combination, index) => ({
      id: `combination-${index}`,
      combination,
      price: 0,
      stock: 0,
      sku: '',
    }));

    replaceCombinations(formattedCombinations);
  }, [enableVariations, watchedVariations, replaceCombinations]);

  const handleEnableVariations = useCallback((enabled) => {
    setEnableVariations(enabled);
    if (!enabled) {
      replaceCombinations([]);
    } else {
      generateCombinations();
    }
  }, [replaceCombinations, generateCombinations]);

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
    if (variation && variation.options) {
      const updatedOptions = variation.options.filter((_, index) => index !== optionIndex);
      setValue(`variations.${variationIndex}.options`, updatedOptions);
      generateCombinations();
    }
  }, [watch, setValue, generateCombinations]);

  const handleUpdateVariationName = useCallback((variationIndex, name) => {
    setValue(`variations.${variationIndex}.name`, name);
  }, [setValue]);

  const handleUpdateCombination = useCallback((index, field, value) => {
    setValue(`variationCombinations.${index}.${field}`, value);
  }, [setValue]);

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
                  onAddOption={handleAddOption}
                  onRemoveOption={handleRemoveOption}
                  onRemoveVariation={handleRemoveVariation}
                  onUpdateVariationName={handleUpdateVariationName}
                />
              ))}

              {/* Add Variation Button */}
              <Button
                variant="outlined"
                onClick={handleAddVariation}
                startIcon={<Iconify icon="eva:plus-fill" />}
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
      <VariationCombinationsTable 
        enableVariations={enableVariations}
        variationCombinations={variationCombinations}
        onUpdateCombination={handleUpdateCombination}
        onRemoveCombination={removeCombination}
      />
    </Card>
  );
}