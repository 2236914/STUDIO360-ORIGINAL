'use client';

import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { fCurrencyPHPSymbol } from 'src/utils/format-number';

// ----------------------------------------------------------------------

// Mock product data - would typically come from API
const PRODUCT_DATA = {
  1: {
    id: '1',
    name: 'Classic Leather Loafers',
    category: 'Shoes',
    manufacturer: 'Nike',
    serialNumber: '358607726380311',
    shipsFrom: 'United States',
    price: 97.14,
    originalPrice: 120.00,
    rating: 4.5,
    reviewCount: 9124,
    status: 'NEW',
    stock: 'IN STOCK',
    description: 'Featuring the original ripple design inspired by Japanese bullet trains, the Nike Air Max 97 lets you push your style full-speed ahead.',
    images: [
      '/assets/images/product/product_1.jpg',
      '/assets/images/product/product_2.jpg',
      '/assets/images/product/product_3.jpg',
      '/assets/images/product/product_4.jpg',
      '/assets/images/product/product_5.jpg',
    ],
    colors: ['#2196F3', '#FF4842'],
    sizes: ['9'],
    quantity: 1,
    availableQuantity: 72,
    specifications: {
      category: 'Shoes',
      manufacturer: 'Nike',
      serialNumber: '358607726380311',
      shipsFrom: 'United States',
    },
    productDetails: [
      'The foam sockliner feels soft and comfortable',
      'Pull tab',
      'Not intended for use as Personal Protective Equipment',
      'Colour Shown: White/Black/Oxygen Purple/Action Grape',
      'Style: 921826-109',
      'Country/Region of Origin: China'
    ],
    benefits: [
      'Mesh and synthetic materials on the upper keep the fluid look of the OG while adding comfortable durability.',
      'Originally designed for performance running, the full-length Max Air unit adds soft, comfortable cushioning underfoot.',
      'The foam midsole feels springy and soft.',
      'The rubber outsole adds traction and durability.'
    ],
    deliveryReturns: {
      freeDelivery: 'Your order of $200 or more gets free standard delivery.',
      standardDelivery: 'Standard delivered 4-5 Business Days',
      expressDelivery: 'Express delivered 2-4 Business Days',
      note: 'Orders are processed and delivered Monday-Friday (excluding public holidays)'
    }
  }
};

// ----------------------------------------------------------------------

export function InventoryDetailsView({ id }) {
  const router = useRouter();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('9');
  const [quantity, setQuantity] = useState(1);
  const [publishStatus, setPublishStatus] = useState('Published');
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);

  // Get product data (in real app, this would be from API)
  const product = PRODUCT_DATA[id] || PRODUCT_DATA['1'];

  // Set page title
  useEffect(() => {
    document.title = `${product.name} | Inventory - Kitsch Studio`;
  }, [product.name]);

  const handleBack = useCallback(() => {
    router.push(paths.dashboard.inventory.root);
  }, [router]);

  const handleTabChange = useCallback((event, newValue) => {
    setSelectedTab(newValue);
  }, []);

  const handleQuantityChange = useCallback((delta) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, product.availableQuantity)));
  }, [product.availableQuantity]);

  const handleStatusMenuOpen = useCallback((event) => {
    setStatusMenuAnchor(event.currentTarget);
  }, []);

  const handleStatusMenuClose = useCallback(() => {
    setStatusMenuAnchor(null);
  }, []);

  const handleStatusChange = useCallback((status) => {
    setPublishStatus(status);
    setStatusMenuAnchor(null);
  }, []);

  const renderProductImages = (
    <Grid item xs={12} md={6}>
      <Card sx={{ p: 3 }}>
        <Box sx={{ position: 'relative', mb: 2 }}>
          <img
            src={product.images[0]}
            alt={product.name}
            style={{
              width: '100%',
              height: 400,
              objectFit: 'cover',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 2,
              typography: 'caption'
            }}
          >
            3/8
          </Box>
        </Box>
        
        <Stack direction="row" spacing={1}>
          {product.images.slice(0, 5).map((image, index) => (
            <Avatar
              key={index}
              src={image}
              variant="rounded"
              sx={{ 
                width: 60, 
                height: 60, 
                cursor: 'pointer',
                border: index === 0 ? 2 : 0,
                borderColor: 'primary.main'
              }}
            />
          ))}
        </Stack>
      </Card>
    </Grid>
  );

  const renderProductInfo = (
    <Grid item xs={12} md={6}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack>
            <Chip 
              label={product.status} 
              color="success" 
              size="small" 
              sx={{ alignSelf: 'flex-start', mb: 1 }}
            />
            <Chip 
              label={product.stock} 
              color="info" 
              size="small" 
              sx={{ alignSelf: 'flex-start' }}
            />
          </Stack>
          
          {/* Status Dropdown */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={publishStatus === 'Published' ? "eva:cloud-upload-fill" : "eva:file-text-fill"} />}
              endIcon={<Iconify icon="eva:chevron-down-fill" />}
              onClick={handleStatusMenuOpen}
              sx={{ 
                bgcolor: 'grey.800',
                color: 'white',
                minWidth: 120,
                '&:hover': { bgcolor: 'grey.700' }
              }}
            >
              {publishStatus}
            </Button>
            <Menu
              anchorEl={statusMenuAnchor}
              open={Boolean(statusMenuAnchor)}
              onClose={handleStatusMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: { mt: 1, minWidth: 140 }
              }}
            >
              <MenuItem onClick={() => handleStatusChange('Published')}>
                <ListItemIcon>
                  <Iconify icon="eva:cloud-upload-fill" width={20} />
                </ListItemIcon>
                <ListItemText primary="Published" />
              </MenuItem>
              <MenuItem onClick={() => handleStatusChange('Draft')}>
                <ListItemIcon>
                  <Iconify icon="eva:file-text-fill" width={20} />
                </ListItemIcon>
                <ListItemText primary="Draft" />
              </MenuItem>
            </Menu>
            <IconButton>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Product Name & Rating */}
        <Stack spacing={1}>
          <Typography variant="h4">{product.name}</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Rating value={product.rating} readOnly size="small" />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ({product.reviewCount.toLocaleString()} reviews)
            </Typography>
          </Stack>
        </Stack>

        {/* Price */}
        <Typography variant="h5" sx={{ color: 'text.primary' }}>
          {fCurrencyPHPSymbol(product.price, '₱', 2, '.', ',')}
        </Typography>

        {/* Description */}
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {product.description}
        </Typography>

        <Divider />

        {/* Color Selection */}
        <Stack spacing={2}>
          <Typography variant="subtitle1">Color</Typography>
          <Stack direction="row" spacing={1}>
            {product.colors.map((color, index) => (
              <Box
                key={index}
                onClick={() => setSelectedColor(index)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: color,
                  cursor: 'pointer',
                  border: selectedColor === index ? 3 : 1,
                  borderColor: selectedColor === index ? 'primary.main' : 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {selectedColor === index && (
                  <Iconify icon="eva:checkmark-fill" sx={{ color: 'common.white', width: 16 }} />
                )}
              </Box>
            ))}
          </Stack>
        </Stack>

        {/* Size Selection */}
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1">Size</Typography>
            <Typography variant="body2" sx={{ color: 'primary.main', cursor: 'pointer' }}>
              Size chart
            </Typography>
          </Stack>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {product.sizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Quantity */}
        <Stack spacing={2}>
          <Typography variant="subtitle1">Quantity</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton 
              size="small" 
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Iconify icon="eva:minus-fill" />
            </IconButton>
            <Typography sx={{ minWidth: 40, textAlign: 'center' }}>
              {quantity}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.availableQuantity}
            >
              <Iconify icon="eva:plus-fill" />
            </IconButton>
            <Typography variant="body2" sx={{ color: 'text.secondary', ml: 2 }}>
              Available {product.availableQuantity}
            </Typography>
          </Stack>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Iconify icon="eva:shopping-cart-outline" />}
            sx={{ flex: 1 }}
          >
            Add to cart
          </Button>
          <Button variant="contained" size="large" sx={{ flex: 1 }}>
            Buy now
          </Button>
        </Stack>

        {/* Additional Actions */}
        <Stack direction="row" spacing={3} sx={{ justifyContent: 'center' }}>
          <Button
            variant="text"
            startIcon={<Iconify icon="eva:plus-outline" />}
            size="small"
          >
            Compare
          </Button>
          <Button
            variant="text"
            startIcon={<Iconify icon="eva:heart-outline" />}
            size="small"
          >
            Favorite
          </Button>
          <Button
            variant="text"
            startIcon={<Iconify icon="eva:share-outline" />}
            size="small"
          >
            Share
          </Button>
        </Stack>
      </Stack>
    </Grid>
  );

  const renderWarrantyBenefits = (
    <Grid item xs={12}>
      <Stack direction="row" spacing={4} sx={{ textAlign: 'center', py: 4 }}>
        <Stack flex={1} alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'success.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main', width: 32 }} />
          </Box>
          <Typography variant="h6">100% original</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Chocolate bar candy canes ice cream toffee cookie halvah.
          </Typography>
        </Stack>

        <Stack flex={1} alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'info.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify icon="eva:clock-fill" sx={{ color: 'info.main', width: 32 }} />
          </Box>
          <Typography variant="h6">10 days replacement</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Marshmallow biscuit donut dragée fruitcake wafer.
          </Typography>
        </Stack>

        <Stack flex={1} alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'warning.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify icon="eva:shield-fill" sx={{ color: 'warning.main', width: 32 }} />
          </Box>
          <Typography variant="h6">Year warranty</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Cotton candy gingerbread cake I love sugar sweet.
          </Typography>
        </Stack>
      </Stack>
    </Grid>
  );

  const renderTabs = (
    <Grid item xs={12}>
      <Card>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ px: 3 }}>
          <Tab label="Description" />
          <Tab label={`Reviews (${product.reviewCount.toLocaleString()})`} />
        </Tabs>
        
        <Divider />
        
        <Box sx={{ p: 3 }}>
          {selectedTab === 0 && (
            <Stack spacing={4}>
              {/* Specifications */}
              <Stack spacing={2}>
                <Typography variant="h6">Specifications</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Category
                    </Typography>
                    <Typography variant="body2">{product.specifications.category}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Manufacturer
                    </Typography>
                    <Typography variant="body2">{product.specifications.manufacturer}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Serial number
                    </Typography>
                    <Typography variant="body2">{product.specifications.serialNumber}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Ships from
                    </Typography>
                    <Typography variant="body2">{product.specifications.shipsFrom}</Typography>
                  </Grid>
                </Grid>
              </Stack>

              {/* Product Details */}
              <Stack spacing={2}>
                <Typography variant="h6">Product details</Typography>
                <Stack spacing={1}>
                  {product.productDetails.map((detail, index) => (
                    <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box component="span" sx={{ mr: 1 }}>•</Box>
                      {detail}
                    </Typography>
                  ))}
                </Stack>
              </Stack>

              {/* Benefits */}
              <Stack spacing={2}>
                <Typography variant="h6">Benefits</Typography>
                <Stack spacing={1}>
                  {product.benefits.map((benefit, index) => (
                    <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box component="span" sx={{ mr: 1 }}>•</Box>
                      {benefit}
                    </Typography>
                  ))}
                </Stack>
              </Stack>

              {/* Delivery and Returns */}
              <Stack spacing={2}>
                <Typography variant="h6">Delivery and returns</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {product.deliveryReturns.note}
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 'bold' }}>Standard delivered 4-5 Business Days</Box>
                  </Typography>
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 'bold' }}>Express delivered 2-4 Business Days</Box>
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {product.deliveryReturns.note}
                </Typography>
              </Stack>
            </Stack>
          )}
          
          {selectedTab === 1 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Reviews section would go here...
            </Typography>
          )}
        </Box>
      </Card>
    </Grid>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Product Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Inventory', href: paths.dashboard.inventory.root },
          { name: product.name },
        ]}
        action={
          <Button
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <Grid container spacing={3}>
        {renderProductImages}
        {renderProductInfo}
        {renderWarrantyBenefits}
        {renderTabs}
      </Grid>
    </DashboardContent>
  );
}
