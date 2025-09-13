'use client';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CardHeader from '@mui/material/CardHeader';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ContentDiagnosis({ formData }) {
  const diagnosis = useMemo(() => {
    const tasks = [];
    let completedTasks = 0;

    // 1. Product Name Analysis (25-100 characters)
    const nameLength = formData.name?.length || 0;
    const nameTask = {
      id: 'name',
      title: 'Add characters for name to 25~100',
      completed: nameLength >= 25 && nameLength <= 100,
      icon: nameLength >= 25 && nameLength <= 100 ? 'eva:checkmark-circle-2-fill' : 'eva:close-circle-fill',
      color: nameLength >= 25 && nameLength <= 100 ? 'success.main' : 'error.main',
      description: `Current: ${nameLength} characters. Optimal: 25-100 characters.`
    };
    tasks.push(nameTask);
    if (nameTask.completed) completedTasks++;

    // 2. Description Analysis (at least 100 characters or 1 image)
    const descriptionLength = formData.description?.replace(/<[^>]*>/g, '').length || 0;
    const hasImages = formData.images?.length > 0;
    const descriptionTask = {
      id: 'description',
      title: 'Add at least 100 characters or 1 image for description',
      completed: descriptionLength >= 100 || hasImages,
      icon: (descriptionLength >= 100 || hasImages) ? 'eva:checkmark-circle-2-fill' : 'eva:close-circle-fill',
      color: (descriptionLength >= 100 || hasImages) ? 'success.main' : 'error.main',
      description: `Description: ${descriptionLength} chars. Images: ${formData.images?.length || 0}. Need 100+ chars OR 1+ image.`
    };
    tasks.push(descriptionTask);
    if (descriptionTask.completed) completedTasks++;

    // 3. Brand/Category Info
    const hasBrandInfo = formData.category?.length > 0;
    const brandTask = {
      id: 'brand',
      title: 'Add brand info',
      completed: hasBrandInfo,
      icon: hasBrandInfo ? 'eva:checkmark-circle-2-fill' : 'eva:close-circle-fill',
      color: hasBrandInfo ? 'success.main' : 'error.main',
      description: hasBrandInfo ? 'Category specified' : 'Add product category for better discoverability'
    };
    tasks.push(brandTask);
    if (brandTask.completed) completedTasks++;

    // 4. Product Images (at least 3-5 images)
    const imageCount = formData.images?.length || 0;
    const imageTask = {
      id: 'images',
      title: 'Add product images (3-5 recommended)',
      completed: imageCount >= 3,
      icon: imageCount >= 3 ? 'eva:checkmark-circle-2-fill' : 'eva:close-circle-fill',
      color: imageCount >= 3 ? 'success.main' : 'error.main',
      description: `${imageCount} images uploaded. Recommended: 3-5 high-quality images`
    };
    tasks.push(imageTask);
    if (imageTask.completed) completedTasks++;

    // 5. Pricing Information
    const hasPrice = formData.price > 0;
    const priceTask = {
      id: 'price',
      title: 'Add competitive pricing',
      completed: hasPrice,
      icon: hasPrice ? 'eva:checkmark-circle-2-fill' : 'eva:close-circle-fill',
      color: hasPrice ? 'success.main' : 'error.main',
      description: hasPrice ? 'Price set' : 'Add product price'
    };
    tasks.push(priceTask);
    if (priceTask.completed) completedTasks++;

    // 6. Product Variants (colors, sizes, or custom variations)
    const hasSimpleVariants = (formData.colors?.length > 0) || (formData.sizes?.length > 0);
    const hasCustomVariations = formData.variations?.length > 0 && formData.variationCombinations?.length > 0;
    const hasVariants = hasSimpleVariants || hasCustomVariations;
    const variantTask = {
      id: 'variants',
      title: 'Add product variants (colors/sizes or custom)',
      completed: hasVariants,
      icon: hasVariants ? 'eva:checkmark-circle-2-fill' : 'eva:close-circle-fill',
      color: hasVariants ? 'success.main' : 'error.main',
      description: hasVariants ? 'Variants available' : 'Add colors, sizes, or custom variations'
    };
    tasks.push(variantTask);
    if (variantTask.completed) completedTasks++;

    // 7. SEO Optimization (tags and keywords)
    const hasTags = formData.tags?.length > 0;
    const seoTask = {
      id: 'seo',
      title: 'Add SEO tags and keywords',
      completed: hasTags,
      icon: hasTags ? 'eva:checkmark-circle-2-fill' : 'eva:close-circle-fill',
      color: hasTags ? 'success.main' : 'error.main',
      description: hasTags ? `${formData.tags.length} tags added` : 'Add relevant tags for better searchability'
    };
    tasks.push(seoTask);
    if (seoTask.completed) completedTasks++;

    // 8. Inventory Management
    const hasStock = formData.quantity > 0;
    const stockTask = {
      id: 'stock',
      title: 'Set inventory quantity',
      completed: hasStock,
      icon: hasStock ? 'eva:checkmark-circle-2-fill' : 'eva:close-circle-fill',
      color: hasStock ? 'success.main' : 'error.main',
      description: hasStock ? `${formData.quantity} units in stock` : 'Set available quantity'
    };
    tasks.push(stockTask);
    if (stockTask.completed) completedTasks++;

    // Calculate overall score
    const totalTasks = tasks.length;
    const score = Math.round((completedTasks / totalTasks) * 100);
    
    // Determine quality level
    let quality = 'Poor';
    let qualityColor = 'error';
    if (score >= 90) {
      quality = 'Excellent';
      qualityColor = 'success';
    } else if (score >= 70) {
      quality = 'Good';
      qualityColor = 'warning';
    } else if (score >= 50) {
      quality = 'Fair';
      qualityColor = 'info';
    }

    return {
      tasks,
      completedTasks,
      totalTasks,
      score,
      quality,
      qualityColor
    };
  }, [formData]);

  return (
    <Card>
      <CardHeader 
        title="Content Diagnosis (Optional)" 
        subheader="Check your listing quality - you can skip this to complete your product"
        sx={{ 
          mb: 0,
          pb: 2,
          '& .MuiCardHeader-title': {
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
            fontWeight: 600
          },
          '& .MuiCardHeader-subheader': {
            fontSize: { xs: '0.875rem', sm: '0.875rem' }
          }
        }} 
      />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        {/* Overall Score */}
        <Box>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            alignItems={{ xs: 'flex-start', sm: 'center' }} 
            justifyContent="space-between" 
            sx={{ mb: 2, gap: { xs: 1, sm: 0 } }}
          >
            <Typography variant="h6" color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
              Content Quality
            </Typography>
            <Chip 
              label={diagnosis.quality}
              color={diagnosis.qualityColor}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
          
          <Box sx={{ mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={diagnosis.score}
              color={diagnosis.qualityColor}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }}
            />
          </Box>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ gap: { xs: 0.5, sm: 0 } }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {diagnosis.completedTasks} of {diagnosis.totalTasks} tasks completed
            </Typography>
            <Typography variant="h6" color={`${diagnosis.qualityColor}.main`} sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
              {diagnosis.score}%
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Task List */}
        <Box>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1.5, 
              color: 'text.primary',
              fontSize: '0.875rem'
            }}
          >
            Tasks to be Excellent:
          </Typography>
          
          <List sx={{ p: 0 }}>
            {diagnosis.tasks.map((task, index) => (
              <ListItem 
                key={task.id}
                sx={{ 
                  px: 0,
                  py: 0.5,
                  minHeight: 32,
                  ...(index < diagnosis.tasks.length - 1 && {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  })
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Iconify 
                    icon={task.icon}
                    width={16}
                    sx={{ color: task.color }}
                  />
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: task.completed ? 'text.secondary' : 'text.primary',
                        textDecoration: task.completed ? 'line-through' : 'none',
                        fontSize: '0.75rem',
                        lineHeight: 1.3
                      }}
                    >
                      {task.title}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Success Message */}
        {diagnosis.score === 100 && (
          <>
            <Divider sx={{ borderStyle: 'dashed' }} />
            <Box sx={{ 
              p: 2, 
              bgcolor: 'success.lighter', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'success.light'
            }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Iconify icon="eva:checkmark-circle-2-fill" width={16} sx={{ color: 'success.main', mt: 0.5 }} />
                <Typography variant="subtitle2" color="success.main">
                  Excellent! Your listing is optimized
                </Typography>
              </Stack>
              <Typography variant="body2" color="success.dark">
                Your product listing meets all quality standards and is ready to attract customers!
              </Typography>
            </Box>
          </>
        )}


        {/* Quick Stats */}
        <Divider sx={{ borderStyle: 'dashed' }} />
        <Box>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1.5, 
              color: 'text.primary',
              fontSize: '0.875rem'
            }}
          >
            Quick Stats:
          </Typography>
          <Stack spacing={0.75}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Name:
              </Typography>
              <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: '0.7rem' }}>
                {formData.name?.length || 0} chars
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Description:
              </Typography>
              <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: '0.7rem' }}>
                {formData.description?.replace(/<[^>]*>/g, '').length || 0} chars
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Images:
              </Typography>
              <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: '0.7rem' }}>
                {formData.images?.length || 0} files
              </Typography>
            </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Variants:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: '0.7rem' }}>
                    {(formData.colors?.length || 0) + (formData.sizes?.length || 0) + (formData.variationCombinations?.length || 0)} options
                  </Typography>
                </Stack>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
