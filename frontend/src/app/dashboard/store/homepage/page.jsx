'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Stack,
  Typography,
  Grid,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  IconButton,
  Tooltip,
  Paper,
  RadioGroup,
  Radio,
  FormLabel,
} from '@mui/material';

import { useForm } from 'react-hook-form';
import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Upload } from 'src/components/upload';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export default function HomepageEditorPage() {
  useEffect(() => {
    document.title = 'Homepage | STUDIO360';
  }, []);

  // State for homepage sections
  const [heroSection, setHeroSection] = useState({
    image: null,
    title: 'Handcrafted jewelry that tells your story',
  });

  const [featuredProducts, setFeaturedProducts] = useState({
    title: 'Featured Products',
    description: 'Discover our most popular pieces',
    selectedProducts: [],
    maxProducts: 5,
  });

  // CTA section removed per requirements

  // Categories manager state
  const [categories, setCategories] = useState([
    { id: 1, name: 'Vinyl Stickers', image: null, type: 'Physical' },
    { id: 2, name: 'Art Prints', image: null, type: 'Physical' },
  ]);
  const productTypes = ['Physical', 'Digital', 'Service'];

  // Split Feature (Text + Image)
  const [splitFeature, setSplitFeature] = useState({
    title: 'Uplifting stationery that motivates you to love yourself and practice self care!',
    description: '',
    image: null,
  });

  // Coupon/Signup
  const [coupon, setCoupon] = useState({
    enabled: true,
    headline: "Get 10% off your 1st order!",
    subtext: 'Reveal coupon code by entering your email.',
    buttonText: 'Reveal coupon',
  });

  // Events block
  const [eventsBlock, setEventsBlock] = useState({
    title: 'Upcoming Events & Markets',
    seeAllText: 'See all events',
    seeAllLink: '/dashboard/store/events',
  });

  // Platforms section
  const [platforms, setPlatforms] = useState([
    { id: 1, name: 'Shopee', url: '', icon: 'simple-icons:shopee' },
    { id: 2, name: 'TikTok Shop', url: '', icon: 'simple-icons:tiktok' },
  ]);

  // Mock product data (simulating a large catalog)
  const generateMockProducts = () => {
    const categories = ['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Pendants', 'Watches', 'Chains'];
    const materials = ['Silver', 'Gold', 'Rose Gold', 'Platinum', 'Crystal', 'Pearl', 'Diamond'];
    const styles = ['Classic', 'Modern', 'Vintage', 'Minimalist', 'Statement', 'Delicate', 'Bold'];
    
    const products = [];
    for (let i = 1; i <= 150; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const style = styles[Math.floor(Math.random() * styles.length)];
      
      products.push({
        id: i,
        name: `${material} ${style} ${category.slice(0, -1)}`,
        price: Math.floor(Math.random() * 500) + 50,
        category,
        material,
        style,
        inStock: Math.random() > 0.1, // 90% in stock
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0 rating
        sales: Math.floor(Math.random() * 100),
        image: '/placeholder.jpg'
      });
    }
    return products;
  };

  const availableProducts = generateMockProducts();

  const [expanded, setExpanded] = useState('announcement');
  const [saveStatus, setSaveStatus] = useState('');
  
  // Product selector state
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productMaterial, setProductMaterial] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Available icons for announcement banner
  const announcementIcons = [
    { name: 'megaphone', icon: 'eva:megaphone-fill', label: 'Megaphone' },
    { name: 'gift', icon: 'eva:gift-fill', label: 'Gift' },
    { name: 'star', icon: 'eva:star-fill', label: 'Star' },
    { name: 'fire', icon: 'eva:flash-fill', label: 'Fire' },
    { name: 'heart', icon: 'eva:heart-fill', label: 'Heart' },
    { name: 'bell', icon: 'eva:bell-fill', label: 'Bell' },
    { name: 'tag', icon: 'eva:pricetags-fill', label: 'Tag' },
    { name: 'shield', icon: 'eva:shield-fill', label: 'Shield' },
    { name: 'truck', icon: 'eva:car-fill', label: 'Delivery' },
    { name: 'percent', icon: 'eva:percent-fill', label: 'Percent' },
    { name: 'calendar', icon: 'eva:calendar-fill', label: 'Calendar' },
    { name: 'trophy', icon: 'eva:award-fill', label: 'Trophy' },
  ];

  // Predefined color schemes
  const colorSchemes = [
    { name: 'blue', bg: '#E3F2FD', text: '#1565C0', label: 'Blue' },
    { name: 'green', bg: '#E8F5E8', text: '#2E7D32', label: 'Green' },
    { name: 'orange', bg: '#FFF3E0', text: '#F57C00', label: 'Orange' },
    { name: 'red', bg: '#FFEBEE', text: '#C62828', label: 'Red' },
    { name: 'purple', bg: '#F3E5F5', text: '#7B1FA2', label: 'Purple' },
    { name: 'indigo', bg: '#E8EAF6', text: '#303F9F', label: 'Indigo' },
    { name: 'teal', bg: '#E0F2F1', text: '#00695C', label: 'Teal' },
    { name: 'pink', bg: '#FCE4EC', text: '#C2185B', label: 'Pink' },
  ];

  // Announcement Banner Form
  const announcementMethods = useForm({
    defaultValues: {
      announcementText: 'Spend ₱1,500 and get FREE tracked nationwide shipping!',
      announcementEnabled: true,
      announcementIcon: 'megaphone',
      backgroundColor: '#E3F2FD',
      textColor: '#1565C0',
      colorScheme: 'blue',
    },
  });

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    // Simulate save API call
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 1000);
  };

  const handleSaveAnnouncement = async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Announcement banner updated successfully!');
      console.info('Announcement Data:', data);
    } catch (error) {
      toast.error('Failed to update announcement banner');
      console.error('Save error:', error);
    }
  };

  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = availableProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = !productCategory || product.category === productCategory;
      const matchesMaterial = !productMaterial || product.material === productMaterial;
      return matchesSearch && matchesCategory && matchesMaterial;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'sales':
          return b.sales - a.sales;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleProductSelection = (productId) => {
    const isSelected = featuredProducts.selectedProducts.includes(productId);
    let newSelection;
    
    if (isSelected) {
      newSelection = featuredProducts.selectedProducts.filter(id => id !== productId);
    } else {
      if (featuredProducts.selectedProducts.length < featuredProducts.maxProducts) {
        newSelection = [...featuredProducts.selectedProducts, productId];
      } else {
        return; // Don't add if max reached
      }
    }
    
    setFeaturedProducts(prev => ({ ...prev, selectedProducts: newSelection }));
  };

  const resetFilters = () => {
    setProductSearch('');
    setProductCategory('');
    setProductMaterial('');
    setSortBy('name');
    setCurrentPage(1);
  };

  const getSelectedProductsData = () => {
    return featuredProducts.selectedProducts.map(id => 
      availableProducts.find(product => product.id === id)
    ).filter(Boolean);
  };

  // Handle color scheme change
  const handleColorSchemeChange = (schemeName) => {
    const scheme = colorSchemes.find(s => s.name === schemeName);
    if (scheme) {
      announcementMethods.setValue('colorScheme', schemeName);
      announcementMethods.setValue('backgroundColor', scheme.bg);
      announcementMethods.setValue('textColor', scheme.text);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Homepage"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Store', href: paths.dashboard.store.root },
          { name: 'Homepage' },
        ]}
        action={
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:external-link-fill" />}
              onClick={() => window.open('/stores/your-store-id', '_blank')}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:save-fill" />}
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Save Status Alert */}
      {saveStatus === 'saved' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Homepage changes saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Editor Panel */}
        <Grid item xs={12} md={8}>
          {/* Announcement Banner Section */}
          <Accordion 
            expanded={expanded === 'announcement'} 
            onChange={handleAccordionChange('announcement')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:bell-fill" width={24} sx={{ color: 'info.main' }} />
                <Typography variant="h6">Announcement Banner</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Form methods={announcementMethods} onSubmit={announcementMethods.handleSubmit(handleSaveAnnouncement)}>
                <Stack spacing={3}>
                  <Field.Switch
                    name="announcementEnabled"
                    label="Enable Announcement Banner"
                    helperText="Show promotional banner at the top of your store page"
                  />
                  
                  <Field.Text
                    name="announcementText"
                    label="Announcement Text"
                    placeholder="e.g., Spend ₱1,500 and get FREE tracked nationwide shipping!"
                    disabled={!announcementMethods.watch('announcementEnabled')}
                    multiline
                    rows={2}
                    inputProps={{ maxLength: 200 }}
                    helperText="Maximum 200 characters"
                    sx={{ mt: 2 }}
                  />

                  {/* Icon Selection */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Banner Icon
                    </Typography>
                    <Grid container spacing={1}>
                      {announcementIcons.map((iconOption) => (
                        <Grid item key={iconOption.name}>
                          <Tooltip title={iconOption.label}>
                            <IconButton
                              onClick={() => announcementMethods.setValue('announcementIcon', iconOption.name)}
                              sx={{
                                width: 48,
                                height: 48,
                                border: '2px solid',
                                borderColor: announcementMethods.watch('announcementIcon') === iconOption.name 
                                  ? 'primary.main' 
                                  : 'divider',
                                borderRadius: 1,
                                bgcolor: announcementMethods.watch('announcementIcon') === iconOption.name 
                                  ? 'primary.lighter' 
                                  : 'transparent',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  bgcolor: 'primary.lighter',
                                },
                              }}
                              disabled={!announcementMethods.watch('announcementEnabled')}
                            >
                              <Iconify 
                                icon={iconOption.icon} 
                                sx={{ 
                                  color: announcementMethods.watch('announcementIcon') === iconOption.name 
                                    ? 'primary.main' 
                                    : 'text.secondary' 
                                }} 
                              />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* Color Scheme Selection */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Color Scheme
                    </Typography>
                    <Grid container spacing={1}>
                      {colorSchemes.map((scheme) => (
                        <Grid item key={scheme.name}>
                          <Tooltip title={scheme.label}>
                            <Paper
                              onClick={() => handleColorSchemeChange(scheme.name)}
                              sx={{
                                width: 48,
                                height: 48,
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: announcementMethods.watch('colorScheme') === scheme.name 
                                  ? 'primary.main' 
                                  : 'divider',
                                borderRadius: 1,
                                bgcolor: scheme.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  bgcolor: scheme.text,
                                }}
                              />
                            </Paper>
                          </Tooltip>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* Custom Colors */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Custom Colors
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Background Color
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                bgcolor: announcementMethods.watch('backgroundColor'),
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            />
                            <TextField
                              size="small"
                              value={announcementMethods.watch('backgroundColor')}
                              onChange={(e) => announcementMethods.setValue('backgroundColor', e.target.value)}
                              placeholder="#E3F2FD"
                              disabled={!announcementMethods.watch('announcementEnabled')}
                              sx={{ flex: 1 }}
                            />
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Text Color
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                bgcolor: announcementMethods.watch('textColor'),
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            />
                            <TextField
                              size="small"
                              value={announcementMethods.watch('textColor')}
                              onChange={(e) => announcementMethods.setValue('textColor', e.target.value)}
                              placeholder="#1565C0"
                              disabled={!announcementMethods.watch('announcementEnabled')}
                              sx={{ flex: 1 }}
                            />
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Preview */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Banner Preview
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: announcementMethods.watch('backgroundColor'),
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        opacity: announcementMethods.watch('announcementEnabled') ? 1 : 0.5,
                      }}
                    >
                      <Iconify 
                        icon={announcementIcons.find(i => i.name === announcementMethods.watch('announcementIcon'))?.icon || 'eva:megaphone-fill'}
                        sx={{ color: announcementMethods.watch('textColor') }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ color: announcementMethods.watch('textColor'), fontWeight: 500 }}
                      >
                        {announcementMethods.watch('announcementText') || 'Your announcement text here...'}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                    <Button type="submit" variant="outlined" size="small">
                      Save Announcement
                    </Button>
                  </Stack>
                </Stack>
              </Form>
            </AccordionDetails>
          </Accordion>

          {/* Section 1: Hero Banner */}
          <Accordion 
            expanded={expanded === 'hero'} 
            onChange={handleAccordionChange('hero')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:image-fill" width={24} sx={{ color: 'primary.main' }} />
                <Typography variant="h6">Hero Banner Section</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                {/* Hero Image Upload */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Hero Image
                  </Typography>
                  <Stack spacing={1.5}>
                    <Upload
                      value={heroSection.image}
                      onDrop={(acceptedFiles) => {
                        const file = acceptedFiles[0];
                        if (file) {
                          setHeroSection(prev => ({ ...prev, image: file }));
                        }
                      }}
                      sx={{ 
                        minHeight: 200,
                        '& > div': {
                          minHeight: 200,
                        }
                      }}
                    />
                    <Stack direction="row" spacing={1}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Or paste image URL"
                        placeholder="https://example.com/hero.jpg"
                        value={typeof heroSection.image === 'string' ? heroSection.image : ''}
                        onChange={(e) => setHeroSection(prev => ({ ...prev, image: e.target.value }))}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          // noop; binding above already sets state
                        }}
                      >
                        Use URL
                      </Button>
                    </Stack>
                  </Stack>
                </Box>

                {/* Title */}
                <TextField
                  fullWidth
                  label="Hero Title"
                  value={heroSection.title}
                  onChange={(e) => setHeroSection(prev => ({ ...prev, title: e.target.value }))}
                  multiline
                  rows={2}
                  sx={{ mt: 2 }}
                />
                {/* No subtitle or CTA for Hero Section 1 per requirements */}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Section 2: Featured Products */}
          <Accordion 
            expanded={expanded === 'featured'} 
            onChange={handleAccordionChange('featured')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:star-fill" width={24} sx={{ color: 'warning.main' }} />
                <Typography variant="h6">Featured Products Section</Typography>
                <Chip 
                  label={`${featuredProducts.selectedProducts.length}/${featuredProducts.maxProducts}`} 
                  size="small" 
                  color="primary" 
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={3}>
                {/* Section Title and Description */}
                <TextField
                  fullWidth
                  label="Section Title"
                  value={featuredProducts.title}
                  onChange={(e) => setFeaturedProducts(prev => ({ ...prev, title: e.target.value }))}
                />

                <TextField
                  fullWidth
                  label="Section Description"
                  value={featuredProducts.description}
                  onChange={(e) => setFeaturedProducts(prev => ({ ...prev, description: e.target.value }))}
                  multiline
                  rows={2}
                />

                {/* Max Products Selector */}
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Maximum Products to Display</InputLabel>
                  <Select
                    value={featuredProducts.maxProducts}
                    label="Maximum Products to Display"
                    onChange={(e) => setFeaturedProducts(prev => ({ ...prev, maxProducts: e.target.value }))}
                  >
                    <MenuItem value={3}>3 Products</MenuItem>
                    <MenuItem value={4}>4 Products</MenuItem>
                    <MenuItem value={5}>5 Products</MenuItem>
                    <MenuItem value={6}>6 Products</MenuItem>
                  </Select>
                </FormControl>

                {/* Product Selection */}
                <Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                    Select Products to Feature
                  </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Iconify icon="eva:plus-fill" />}
                      onClick={() => setProductSelectorOpen(true)}
                    >
                      Browse Products ({availableProducts.length} available)
                    </Button>
                  </Stack>

                  {/* Selected Products Display */}
                  {getSelectedProductsData().length > 0 ? (
                  <Grid container spacing={2}>
                      {getSelectedProductsData().map((product) => (
                        <Grid item xs={12} sm={6} md={4} key={product.id}>
                          <Card sx={{ p: 2, border: '2px solid', borderColor: 'primary.main' }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                  bgcolor: 'primary.lighter',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                                <Iconify icon="eva:image-fill" sx={{ color: 'primary.main' }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2">{product.name}</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  ${product.price} • {product.category}
                              </Typography>
                            </Box>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleProductSelection(product.id)}
                                sx={{ minWidth: 32, width: 32, height: 32, p: 0 }}
                              >
                                <Iconify icon="eva:close-fill" />
                              </Button>
                          </Stack>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.neutral',
                      }}
                    >
                      <Iconify icon="eva:cube-outline" sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No products selected. Click "Browse Products" to add featured products.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Section 2.5: Shop Categories */}
          <Accordion 
            expanded={expanded === 'categories'} 
            onChange={handleAccordionChange('categories')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:folder-add-fill" width={24} sx={{ color: 'secondary.main' }} />
                <Typography variant="h6">Shop Categories</Typography>
                <Chip label={categories.length} size="small" color="secondary" />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  onClick={() => setCategories((prev) => [...prev, { id: Date.now(), name: '', image: null, type: 'Physical' }])}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Category
                </Button>

                <Grid container spacing={2}>
                  {categories.map((cat, idx) => (
                    <Grid item xs={12} md={6} key={cat.id}>
                      <Card sx={{ p: 2 }}>
                        <Stack spacing={2}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2">Category #{idx + 1}</Typography>
                            <Button color="error" size="small" onClick={() => setCategories((prev) => prev.filter((c) => c.id !== cat.id))}>
                              Remove
                            </Button>
                          </Stack>
                          <TextField
                            label="Category Name"
                            value={cat.name}
                            onChange={(e) => setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, name: e.target.value } : c)))}
                            fullWidth
                          />
                          <FormControl>
                            <InputLabel>Product Type</InputLabel>
                            <Select
                              label="Product Type"
                              value={cat.type}
                              onChange={(e) => setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, type: e.target.value } : c)))}
                            >
                              {productTypes.map((t) => (
                                <MenuItem key={t} value={t}>{t}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Box>
                            <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
                              Category Picture
                            </Typography>
                            <Upload
                              file={cat.image}
                              onDrop={(acceptedFiles) => {
                                const file = acceptedFiles[0];
                                if (!file) return;
                                setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, image: file } : c)));
                              }}
                              sx={{ minHeight: 140, '& > div': { minHeight: 140 } }}
                            />
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <TextField
                                size="small"
                                fullWidth
                                label="Or paste image URL"
                                placeholder="https://example.com/category.jpg"
                                value={typeof cat.image === 'string' ? cat.image : ''}
                                onChange={(e) =>
                                  setCategories((prev) =>
                                    prev.map((c) => (c.id === cat.id ? { ...c, image: e.target.value } : c))
                                  )
                                }
                              />
                              <Button variant="outlined" size="small">Use URL</Button>
                            </Stack>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* CTA Section removed per requirements */}

          {/* Section 4: Split Feature (Text + Image) */}
          <Accordion 
            expanded={expanded === 'splitFeature'} 
            onChange={handleAccordionChange('splitFeature')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:file-text-fill" width={24} sx={{ color: 'primary.main' }} />
                <Typography variant="h6">Split Feature Section</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Title / Headline"
                  value={splitFeature.title}
                  onChange={(e) => setSplitFeature((p) => ({ ...p, title: e.target.value }))}
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={splitFeature.description}
                  onChange={(e) => setSplitFeature((p) => ({ ...p, description: e.target.value }))}
                  multiline
                  rows={3}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Image</Typography>
                  <Stack spacing={1.5}>
                    <Upload
                      value={splitFeature.image}
                      onDrop={(files) => {
                        const file = files[0];
                        if (file) setSplitFeature((p) => ({ ...p, image: file }));
                      }}
                      sx={{ minHeight: 200, '& > div': { minHeight: 200 } }}
                    />
                    <Stack direction="row" spacing={1}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Or paste image URL"
                        placeholder="https://example.com/feature.jpg"
                        value={typeof splitFeature.image === 'string' ? splitFeature.image : ''}
                        onChange={(e) => setSplitFeature((p) => ({ ...p, image: e.target.value }))}
                      />
                      <Button variant="outlined" size="small">Use URL</Button>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Section 5: Coupon / Signup */}
          <Accordion 
            expanded={expanded === 'coupon'} 
            onChange={handleAccordionChange('coupon')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:gift-fill" width={24} sx={{ color: 'warning.main' }} />
                <Typography variant="h6">Signup Coupon Section</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControlLabel
                  control={<Switch checked={coupon.enabled} onChange={(e) => setCoupon((p) => ({ ...p, enabled: e.target.checked }))} />}
                  label="Enable coupon section"
                />
                <TextField label="Headline" value={coupon.headline} onChange={(e) => setCoupon((p) => ({ ...p, headline: e.target.value }))} fullWidth />
                <TextField label="Subtext" value={coupon.subtext} onChange={(e) => setCoupon((p) => ({ ...p, subtext: e.target.value }))} fullWidth />
                <TextField label="Button text" value={coupon.buttonText} onChange={(e) => setCoupon((p) => ({ ...p, buttonText: e.target.value }))} fullWidth />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Section 6: Events Block */}
          <Accordion 
            expanded={expanded === 'events'} 
            onChange={handleAccordionChange('events')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:calendar-fill" width={24} sx={{ color: 'info.main' }} />
                <Typography variant="h6">Events Block</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField label="Title" value={eventsBlock.title} onChange={(e) => setEventsBlock((p) => ({ ...p, title: e.target.value }))} fullWidth />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="See all label" value={eventsBlock.seeAllText} onChange={(e) => setEventsBlock((p) => ({ ...p, seeAllText: e.target.value }))} sx={{ flex: 1 }} />
                  <TextField label="See all link" value={eventsBlock.seeAllLink} onChange={(e) => setEventsBlock((p) => ({ ...p, seeAllLink: e.target.value }))} sx={{ flex: 1 }} />
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Manage your events in Dashboard → Store → Events.
                </Typography>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Section 7: Platforms */}
          <Accordion 
            expanded={expanded === 'platforms'} 
            onChange={handleAccordionChange('platforms')}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-down-fill" />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Iconify icon="eva:external-link-fill" width={24} sx={{ color: 'success.main' }} />
                <Typography variant="h6">External Platforms</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  onClick={() => setPlatforms((p) => [...p, { id: Date.now(), name: '', url: '', icon: '' }])}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Platform
                </Button>
                <Grid container spacing={2}>
                  {platforms.map((p) => (
                    <Grid item xs={12} md={6} key={p.id}>
                      <Card sx={{ p: 2 }}>
                        <Stack spacing={2}>
                          <TextField label="Name" value={p.name} onChange={(e) => setPlatforms((arr) => arr.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))} fullWidth />
                          <TextField label="URL" value={p.url} onChange={(e) => setPlatforms((arr) => arr.map((x) => (x.id === p.id ? { ...x, url: e.target.value } : x)))} fullWidth />
                          <TextField label="Icon (iconify name)" value={p.icon} onChange={(e) => setPlatforms((arr) => arr.map((x) => (x.id === p.id ? { ...x, icon: e.target.value } : x)))} fullWidth />
                          <Stack direction="row" spacing={1}>
                            <Button size="small" color="error" onClick={() => setPlatforms((arr) => arr.filter((x) => x.id !== p.id))}>Remove</Button>
                          </Stack>
                        </Stack>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Preview Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Live Preview
            </Typography>
            
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              {/* Announcement Banner Preview */}
              {announcementMethods.watch('announcementEnabled') && (
                <Box 
                  sx={{ 
                    p: 1, 
                    bgcolor: announcementMethods.watch('backgroundColor'),
                    textAlign: 'center', 
                    borderBottom: '1px solid', 
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                  }}
                >
                  <Iconify 
                    icon={announcementIcons.find(i => i.name === announcementMethods.watch('announcementIcon'))?.icon || 'eva:megaphone-fill'}
                    sx={{ color: announcementMethods.watch('textColor'), fontSize: 12 }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: announcementMethods.watch('textColor'), 
                      fontSize: 10,
                      fontWeight: 500 
                    }}
                  >
                    {announcementMethods.watch('announcementText')}
                  </Typography>
                </Box>
              )}
              
              {/* Hero Preview */}
              <Box sx={{ p: 2, bgcolor: 'primary.lighter', textAlign: 'center' }}>
                <Box
                  sx={{
                    height: 120,
                    bgcolor: 'background.neutral',
                    borderRadius: 1,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: typeof heroSection.image === 'string' ? `url(${heroSection.image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!heroSection.image && (
                    <Iconify icon="eva:image-fill" sx={{ color: 'text.disabled', fontSize: 24 }} />
                  )}
                </Box>
                <Typography variant="h6" sx={{ mb: 0, fontSize: 14 }}>
                  {heroSection.title}
                </Typography>
              </Box>

              <Divider />

              {/* Featured Products Preview */}
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 12 }}>
                  {featuredProducts.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                  {featuredProducts.description}
                </Typography>
                <Grid container spacing={1}>
                  {featuredProducts.selectedProducts.slice(0, 3).map((productId) => {
                    const product = availableProducts.find(p => p.id === productId);
                    return (
                      <Grid item xs={4} key={productId}>
                        <Box
                          sx={{
                            height: 60,
                            bgcolor: 'background.neutral',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Iconify icon="eva:image-fill" sx={{ color: 'text.disabled', fontSize: 16 }} />
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          {product?.name}
                        </Typography>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {/* CTA Preview removed per requirements */}

              {/* Split Feature Preview */}
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 12 }}>
                  Split Feature
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontSize: 12 }}>
                  {splitFeature.title}
                </Typography>
                <Box sx={{ height: 60, bgcolor: 'background.neutral', borderRadius: 1 }} />
              </Box>

              {coupon.enabled && (
                <>
                  <Divider />
                  {/* Coupon Preview */}
                  <Box sx={{ p: 2, bgcolor: 'primary.lighter', textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: 12 }}>{coupon.headline}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>{coupon.subtext}</Typography>
                    <Button size="small" variant="contained" sx={{ fontSize: 10 }}>{coupon.buttonText}</Button>
                  </Box>
                </>
              )}

              <Divider />

              {/* Events Block Preview */}
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 12 }}>{eventsBlock.title}</Typography>
                <Stack direction="row" spacing={1}>
                  <Box sx={{ flex: 1, height: 50, bgcolor: 'background.neutral', borderRadius: 1 }} />
                  <Box sx={{ flex: 1, height: 50, bgcolor: 'background.neutral', borderRadius: 1 }} />
                </Stack>
              </Box>

              <Divider />

              {/* Platforms Preview */}
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: 12 }}>Platforms</Typography>
                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                  {platforms.map((p) => (
                    <Button key={p.id} size="small" variant="outlined" startIcon={<Iconify icon={p.icon || 'eva:external-link-fill'} />}>{p.name || 'Platform'}</Button>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Product Selector Dialog */}
      <Dialog 
        open={productSelectorOpen} 
        onClose={() => setProductSelectorOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Select Products to Feature</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {featuredProducts.selectedProducts.length}/{featuredProducts.maxProducts} selected
            </Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          {/* Search and Filters */}
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={productCategory}
                    label="Category"
                    onChange={(e) => {
                      setProductCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="Necklaces">Necklaces</MenuItem>
                    <MenuItem value="Rings">Rings</MenuItem>
                    <MenuItem value="Earrings">Earrings</MenuItem>
                    <MenuItem value="Bracelets">Bracelets</MenuItem>
                    <MenuItem value="Pendants">Pendants</MenuItem>
                    <MenuItem value="Watches">Watches</MenuItem>
                    <MenuItem value="Chains">Chains</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Material</InputLabel>
                  <Select
                    value={productMaterial}
                    label="Material"
                    onChange={(e) => {
                      setProductMaterial(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <MenuItem value="">All Materials</MenuItem>
                    <MenuItem value="Silver">Silver</MenuItem>
                    <MenuItem value="Gold">Gold</MenuItem>
                    <MenuItem value="Rose Gold">Rose Gold</MenuItem>
                    <MenuItem value="Platinum">Platinum</MenuItem>
                    <MenuItem value="Crystal">Crystal</MenuItem>
                    <MenuItem value="Pearl">Pearl</MenuItem>
                    <MenuItem value="Diamond">Diamond</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="name">Name A-Z</MenuItem>
                    <MenuItem value="price_low">Price Low-High</MenuItem>
                    <MenuItem value="price_high">Price High-Low</MenuItem>
                    <MenuItem value="rating">Highest Rated</MenuItem>
                    <MenuItem value="sales">Best Selling</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={resetFilters}
                  startIcon={<Iconify icon="eva:refresh-fill" />}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
            
            {/* Results Summary */}
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </Typography>
          </Stack>

          {/* Products Grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {paginatedProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: featuredProducts.selectedProducts.includes(product.id)
                      ? '2px solid'
                      : '1px solid',
                    borderColor: featuredProducts.selectedProducts.includes(product.id)
                      ? 'primary.main'
                      : 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                    opacity: featuredProducts.selectedProducts.length >= featuredProducts.maxProducts && 
                             !featuredProducts.selectedProducts.includes(product.id) ? 0.5 : 1,
                  }}
                  onClick={() => {
                    if (featuredProducts.selectedProducts.length < featuredProducts.maxProducts || 
                        featuredProducts.selectedProducts.includes(product.id)) {
                      handleProductSelection(product.id);
                    }
                  }}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        height: 120,
                        bgcolor: 'background.neutral',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="eva:image-fill" sx={{ color: 'text.disabled', fontSize: 32 }} />
                    </Box>
                    
                    <Box>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontSize: 14 }}>
                          {product.name}
                        </Typography>
                        {featuredProducts.selectedProducts.includes(product.id) && (
                          <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'primary.main', fontSize: 20 }} />
                        )}
                      </Stack>
                      
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" sx={{ color: 'primary.main', fontSize: 16 }}>
                          ${product.price}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon="eva:star-fill" sx={{ color: 'warning.main', fontSize: 16 }} />
                          <Typography variant="caption">{product.rating}</Typography>
                        </Stack>
                      </Stack>
                      
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {product.category} • {product.material}
                      </Typography>
                      
                      {!product.inStock && (
                        <Chip label="Out of Stock" size="small" color="error" sx={{ mt: 1 }} />
                      )}
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setProductSelectorOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setProductSelectorOpen(false)}
            startIcon={<Iconify icon="eva:checkmark-fill" />}
          >
            Done ({featuredProducts.selectedProducts.length} selected)
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
