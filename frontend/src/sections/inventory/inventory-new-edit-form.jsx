'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { fCurrencyPHPSymbol } from 'src/utils/format-number';

import { ContentDiagnosis } from './content-diagnosis';
import { VariationManager } from './variation-manager';
import { WholesalePricing } from './wholesale-pricing';

// ----------------------------------------------------------------------

import { getSellerCategories, addNewCategory, getSellerThemes, addNewTheme } from 'src/utils/seller-categories';

const PRODUCT_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const PRODUCT_COLOR_OPTIONS = [
  'Red',
  'Blue',
  'Green',
  'Black',
  'White',
  'Yellow',
  'Purple',
  'Orange',
];

const PRODUCT_GENDER_OPTIONS = ['Men', 'Women', 'Kids'];

const PRODUCT_TAG_OPTIONS = [
  'New',
  'Popular',
  'Best Seller',
  'Limited Edition',
  'Sale',
  'Trending',
  'Featured',
  'Recommended',
];

// ----------------------------------------------------------------------

export const NewInventorySchema = zod.object({
  name: zod.string().min(1, { message: 'Product name is required!' }),
  subDescription: zod.string().min(1, { message: 'Sub description is required!' }),
  description: schemaHelper.editor({ message: { required_error: 'Description is required!' } }),
  images: schemaHelper.files({ message: { required_error: 'Images is required!' } }),
  code: zod.string().min(1, { message: 'Product code is required!' }),
  sku: zod.string().min(1, { message: 'Product SKU is required!' }),
  quantity: zod.number().min(1, { message: 'Quantity is required!' }),
  category: zod.string().min(1, { message: 'Category is required!' }),
  theme: zod.string().min(1, { message: 'Theme is required!' }),
  colors: zod.string().array().min(1, { message: 'Choose at least one color!' }),
  sizes: zod.string().array().min(1, { message: 'Choose at least one size!' }),
  tags: zod.string().array().min(1, { message: 'Choose at least one tag!' }),
  gender: zod.string().array().min(1, { message: 'Choose at least one gender!' }),
  price: zod.number().min(0.01, { message: 'Price should be greater than ₱0.00' }),
  // Variation fields
  variations: zod.array(zod.object({
    name: zod.string(),
    options: zod.array(zod.string())
  })).optional(),
  variationCombinations: zod.array(zod.object({
    id: zod.string(),
    combination: zod.array(zod.object({
      variationName: zod.string(),
      optionValue: zod.string()
    })),
    price: zod.number(),
    stock: zod.number(),
    sku: zod.string(),
    image: zod.any().optional()
  })).optional(),
  wholesalePricing: zod.array(zod.object({
    minQuantity: zod.number(),
    price: zod.number(),
    discount: zod.number()
  })).optional(),
  // Optional fields
  priceSale: zod.number().optional(),
  taxes: zod.number().optional(),
  saleLabel: zod.object({ enabled: zod.boolean(), content: zod.string() }).optional(),
  newLabel: zod.object({ enabled: zod.boolean(), content: zod.string() }).optional(),
});

// ----------------------------------------------------------------------

export function InventoryNewEditForm({ currentProduct }) {
  const router = useRouter();

  const [includeTaxes, setIncludeTaxes] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableThemes, setAvailableThemes] = useState([]);

  const defaultValues = useMemo(
    () => ({
      name: currentProduct?.name || '',
      subDescription: currentProduct?.subDescription || '',
      description: currentProduct?.description || '',
      images: currentProduct?.images || [],
      code: currentProduct?.code || '',
      sku: currentProduct?.sku || '',
      price: currentProduct?.price || 0,
      quantity: currentProduct?.quantity || 0,
      priceSale: currentProduct?.priceSale || 0,
      tags: currentProduct?.tags || [],
      taxes: currentProduct?.taxes || 0,
      gender: currentProduct?.gender || [],
      category: currentProduct?.category || '',
      theme: currentProduct?.theme || '',
      colors: currentProduct?.colors || [],
      sizes: currentProduct?.sizes || [],
      variations: currentProduct?.variations || [],
      variationCombinations: currentProduct?.variationCombinations || [],
      wholesalePricing: currentProduct?.wholesalePricing || [],
      newLabel: currentProduct?.newLabel || { enabled: false, content: '' },
      saleLabel: currentProduct?.saleLabel || { enabled: false, content: '' },
    }),
    [currentProduct]
  );

  const methods = useForm({
    resolver: zodResolver(NewInventorySchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  // Load seller categories and themes on component mount
  useEffect(() => {
    setAvailableCategories(getSellerCategories());
    setAvailableThemes(getSellerThemes());
  }, []);

  useEffect(() => {
    if (includeTaxes) {
      setValue('taxes', 0);
    } else {
      setValue('taxes', currentProduct?.taxes || 0);
    }
  }, [currentProduct?.taxes, includeTaxes, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(currentProduct ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.inventory.root);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', [], { shouldValidate: true });
  }, [setValue]);

  const handleChangeIncludeTaxes = useCallback((event) => {
    setIncludeTaxes(event.target.checked);
  }, []);

  const handleCategoryChange = useCallback((event, newValue) => {
    if (typeof newValue === 'string') {
      // User typed a new category
      const newCategory = newValue.trim();
      if (newCategory && !availableCategories.includes(newCategory)) {
        const updatedCategories = addNewCategory(newCategory);
        setAvailableCategories(updatedCategories);
        toast.success(`Category "${newCategory}" added!`);
      }
      setValue('category', newCategory);
    } else {
      // User selected from dropdown
      setValue('category', newValue || '');
    }
  }, [availableCategories, setValue]);

  const handleThemeChange = useCallback((event, newValue) => {
    if (typeof newValue === 'string') {
      // User typed a new theme
      const newTheme = newValue.trim();
      if (newTheme && !availableThemes.includes(newTheme)) {
        const updatedThemes = addNewTheme(newTheme);
        setAvailableThemes(updatedThemes);
        toast.success(`Theme "${newTheme}" added!`);
      }
      setValue('theme', newTheme);
    } else {
      // User selected from dropdown
      setValue('theme', newValue || '');
    }
  }, [availableThemes, setValue]);

  const renderDetails = (
    <Card>
      <CardHeader title="Details" subheader="Title, short description, image..." sx={{ mb: 3 }} />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="name" label="Product name" />

        <Field.Text name="subDescription" label="Sub description" multiline rows={4} />

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Content</Typography>
          <Field.Editor name="description" sx={{ maxHeight: 480 }} />
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Images</Typography>
          <Field.Upload
            multiple
            thumbnail
            name="images"
            allowUrl
            maxSize={3145728}
            onRemove={handleRemoveFile}
            onRemoveAll={handleRemoveAllFiles}
            onUpload={() => console.info('ON UPLOAD')}
          />
        </Stack>
      </Stack>
    </Card>
  );

  const renderProperties = (
    <Card>
      <CardHeader
        title="Properties"
        subheader="Additional functions and attributes..."
        sx={{ mb: 3 }}
      />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Box
          columnGap={2}
          rowGap={3}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        >
          <Field.Text name="code" label="Product code" />
          <Field.Text name="sku" label="Product SKU" />
          <Field.Text name="quantity" label="Quantity" type="number" />
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Category</Typography>
            <Field.Autocomplete
              name="category"
              placeholder="Select or create category"
              freeSolo
              options={availableCategories}
              getOptionLabel={(option) => option}
              onChange={handleCategoryChange}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              renderInput={(params) => (
                <Field.Text
                  {...params}
                  name="category"
                  placeholder="Type to create new category..."
                  helperText="Select existing or type new category name"
                />
              )}
            />
          </Stack>
        </Box>

        <Box
          columnGap={2}
          rowGap={3}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(1, 1fr)' }}
        >
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Theme</Typography>
            <Field.Autocomplete
              name="theme"
              placeholder="Select or create theme"
              freeSolo
              options={availableThemes}
              getOptionLabel={(option) => option}
              onChange={handleThemeChange}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              renderInput={(params) => (
                <Field.Text
                  {...params}
                  name="theme"
                  placeholder="Type to create new theme..."
                  helperText="Select existing or type new theme name"
                />
              )}
            />
          </Stack>
        </Box>

        <Box
          columnGap={2}
          rowGap={3}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        >
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Colors</Typography>
            <Field.Autocomplete
              name="colors"
              placeholder="+ Add colors"
              multiple
              freeSolo
              options={PRODUCT_COLOR_OPTIONS}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    color="primary"
                    variant="soft"
                  />
                ))
              }
            />
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Sizes</Typography>
            <Field.Autocomplete
              name="sizes"
              placeholder="+ Add sizes"
              multiple
              freeSolo
              options={PRODUCT_SIZE_OPTIONS}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    color="secondary"
                    variant="soft"
                  />
                ))
              }
            />
          </Stack>
        </Box>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Tags</Typography>
          <Field.Autocomplete
            name="tags"
            placeholder="+ Tags"
            multiple
            freeSolo
            options={PRODUCT_TAG_OPTIONS}
            getOptionLabel={(option) => option}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {option}
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  color="info"
                  variant="soft"
                />
              ))
            }
          />
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Gender</Typography>
          <Field.Autocomplete
            name="gender"
            placeholder="+ Add gender"
            multiple
            freeSolo
            options={PRODUCT_GENDER_OPTIONS}
            getOptionLabel={(option) => option}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {option}
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  color="info"
                  variant="soft"
                />
              ))
            }
          />
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack spacing={3}>
          <FormControlLabel
            control={<Switch checked={values.saleLabel.enabled} />}
            label="Sale label"
            labelPlacement="start"
            sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            onChange={(event) =>
              setValue('saleLabel.enabled', event.target.checked, { shouldValidate: true })
            }
          />

          {values.saleLabel.enabled && (
            <Field.Text
              name="saleLabel.content"
              label="Sale label"
              fullWidth
              inputProps={{ maxLength: 50 }}
            />
          )}
        </Stack>

        <Stack spacing={3}>
          <FormControlLabel
            control={<Switch checked={values.newLabel.enabled} />}
            label="New label"
            labelPlacement="start"
            sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            onChange={(event) =>
              setValue('newLabel.enabled', event.target.checked, { shouldValidate: true })
            }
          />

          {values.newLabel.enabled && (
            <Field.Text
              name="newLabel.content"
              label="New label"
              fullWidth
              inputProps={{ maxLength: 50 }}
            />
          )}
        </Stack>
      </Stack>
    </Card>
  );

  const renderPricing = (
    <Card>
      <CardHeader title="Pricing" subheader="Price related inputs" sx={{ mb: 3 }} />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text
          name="price"
          label="Regular price"
          placeholder="0.00"
          type="number"
          inputProps={{
            min: 0,
            step: 0.01,
            pattern: '[0-9]*[.]?[0-9]+',
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
          }}
          helperText="Enter price (e.g., 29.99)"
        />

        <Field.Text
          name="priceSale"
          label="Sale price"
          placeholder="0.00"
          type="number"
          inputProps={{
            min: 0,
            step: 0.01,
            pattern: '[0-9]*[.]?[0-9]+',
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
          }}
          helperText="Optional sale price (e.g., 24.99)"
        />

        <FormControlLabel
          control={<Switch checked={includeTaxes} onChange={handleChangeIncludeTaxes} />}
          label="Price includes taxes"
          labelPlacement="start"
          sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
        />

        {!includeTaxes && (
          <Field.Text
            name="taxes"
            label="Tax (%)"
            placeholder="0.00"
            type="number"
            inputProps={{
              min: 0,
              max: 100,
              step: 0.01,
              pattern: '[0-9]*[.]?[0-9]+',
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start">%</InputAdornment>,
            }}
            helperText="Tax percentage (e.g., 8.25)"
          />
        )}

        {/* Price Summary */}
        {(watch('price') || watch('priceSale') || watch('taxes')) && (
          <Box sx={{ 
            p: 2, 
            bgcolor: 'background.neutral', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.primary' }}>
              Price Summary
            </Typography>
            <Stack spacing={1}>
              {watch('price') && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Regular Price:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {fCurrencyPHPSymbol(watch('price'), '₱', 2, '.', ',')}
                  </Typography>
                </Stack>
              )}
              {watch('priceSale') && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Sale Price:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" color="success.main">
                    {fCurrencyPHPSymbol(watch('priceSale'), '₱', 2, '.', ',')}
                  </Typography>
                </Stack>
              )}
              {watch('taxes') && !includeTaxes && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Tax Amount:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" color="warning.main">
                    {fCurrencyPHPSymbol((watch('price') || 0) * (watch('taxes') || 0) / 100, '₱', 2, '.', ',')}
                  </Typography>
                </Stack>
              )}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" fontWeight="bold" color="text.primary">
                  Final Price:
                </Typography>
                <Typography variant="body2" fontWeight="bold" fontFamily="monospace" color="primary.main">
                  {fCurrencyPHPSymbol(
                    (watch('priceSale') || watch('price') || 0) + 
                    ((watch('taxes') && !includeTaxes) ? (watch('price') || 0) * (watch('taxes') || 0) / 100 : 0), 
                    '₱', 2, '.', ','
                  )}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        )}
      </Stack>
    </Card>
  );

  const renderActions = (
    <Stack spacing={3} direction="row" alignItems="center" flexWrap="wrap">
      <FormControlLabel
        control={<Switch defaultChecked inputProps={{ id: 'publish-switch' }} />}
        label="Publish"
        sx={{ pl: 3, flexGrow: 1 }}
      />

      <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        {!currentProduct ? 'Create product' : 'Save changes'}
      </LoadingButton>
    </Stack>
  );

  const renderVariations = (
    <VariationManager />
  );

  const renderWholesale = (
    <WholesalePricing />
  );

  const renderContentDiagnosis = (
    <ContentDiagnosis formData={values} />
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderDetails}

        {renderProperties}

        {renderVariations}

        {renderPricing}

        {renderWholesale}

        {renderContentDiagnosis}

        {renderActions}
      </Stack>
    </Form>
  );
}