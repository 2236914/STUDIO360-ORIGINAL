'use client';

import { useMemo, useState, use, useCallback, useEffect } from 'react';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Badge from '@mui/material/Badge';
import { alpha, useTheme } from '@mui/material/styles';
import Rating from '@mui/material/Rating';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { varFade } from 'src/components/animate';
import { useCheckoutContext } from 'src/sections/checkout/context';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { m } from 'framer-motion';
import Modal from '@mui/material/Modal';

import { LandingHeader } from 'src/sections/landing/landing-header';
import { getFilteringCategories, getFilteringThemes } from 'src/utils/seller-categories';

// ----------------------------------------------------------------------

// Floating Cart Icon Component
function CartIcon({ totalItems, storeId }) {
  return (
    <Box
      component="a"
      href={`/stores/${storeId}/checkout`}
      sx={{
        right: 0,
        top: 112,
        zIndex: 999,
        display: 'flex',
        cursor: 'pointer',
        position: 'fixed',
        color: 'text.primary',
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
        bgcolor: 'background.paper',
        padding: (theme) => theme.spacing(1, 3, 1, 2),
        boxShadow: (theme) => theme.shadows[8],
        transition: (theme) => theme.transitions.create(['opacity']),
        '&:hover': { opacity: 0.72 },
      }}
    >
      <Badge showZero badgeContent={totalItems} color="error" max={99}>
        <Iconify icon="solar:cart-3-bold" width={24} />
      </Badge>
    </Box>
  );
}

// ----------------------------------------------------------------------

// Mock reviews data
const MOCK_REVIEWS = [
  {
    id: 1,
    customerName: 'Sarah M.',
    isAnonymous: false,
    rating: 5,
    date: '2 days ago',
    comment: 'Amazing quality products! The handmade items are beautiful and well-crafted. Will definitely shop here again.',
    product: 'Handmade Jewelry Set',
    images: ['https://images.unsplash.com/photo-1515562141207-7cf88c8735c5?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop']
  },
  {
    id: 2,
    customerName: 'J***n D.',
    isAnonymous: true,
    rating: 5,
    date: '1 week ago',
    comment: 'Great customer service and fast shipping. The products exceeded my expectations. Highly recommend!',
    product: 'Custom Tote Bag',
    images: ['https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=400&h=300&fit=crop']
  },
  {
    id: 3,
    customerName: 'M***a L.',
    isAnonymous: true,
    rating: 4,
    date: '2 weeks ago',
    comment: 'Beautiful items with unique designs. The only reason I gave 4 stars is because shipping took a bit longer than expected.',
    product: 'Artisan Soap Collection',
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop']
  },
  {
    id: 4,
    customerName: 'David K.',
    isAnonymous: false,
    rating: 5,
    date: '3 weeks ago',
    comment: 'Outstanding craftsmanship! Each piece tells a story. The attention to detail is incredible.',
    product: 'Handcrafted Wooden Box',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop']
  },
  {
    id: 5,
    customerName: 'A***e R.',
    isAnonymous: true,
    rating: 5,
    date: '1 month ago',
    comment: 'Perfect gift for my friend! She absolutely loved the handmade scarf. Will be back for more unique items.',
    product: 'Handmade Scarf',
    images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop']
  }
];

// Mock store data - in real app this would come from API
const STORE_DATA = {
  'kitschstudio': {
    id: 'kitschstudio',
    name: 'Kitsch Studio',
    category: 'Handmade Gift Shop',
    color: '#F39C12',
    rating: 5.0,
    description: 'Unique handmade gifts and accessories for every occasion',
    banner: 'SHOP BANNER',
    profileIcon: 'PROFILE'
  },
  'artisancraftsco': {
    id: 'artisancraftsco',
    name: 'Artisan Crafts Co.',
    category: 'Handmade Jewelry',
    color: '#FF6B6B',
    rating: 4.8,
    description: 'Beautiful handcrafted jewelry and accessories',
    banner: 'SHOP BANNER',
    profileIcon: 'PROFILE'
  },
  'digitaldreams': {
    id: 'digitaldreams',
    name: 'Digital Dreams',
    category: 'Web Design Services',
    color: '#4ECDC4',
    rating: 4.6,
    description: 'Professional web design and digital solutions',
    banner: 'SHOP BANNER',
    profileIcon: 'PROFILE'
  },
  'ecolivingstore': {
    id: 'ecolivingstore',
    name: 'Eco Living Store',
    category: 'Sustainable Products',
    color: '#45B7D1',
    rating: 4.7,
    description: 'Eco-friendly and sustainable living products',
    banner: 'SHOP BANNER',
    profileIcon: 'PROFILE'
  },
  'urbanthreads': {
    id: 'urbanthreads',
    name: 'Urban Threads',
    category: 'Apparel & Fashion',
    color: '#8E44AD',
    rating: 4.5,
    description: 'Trendy urban fashion and streetwear',
    banner: 'SHOP BANNER',
    profileIcon: 'PROFILE'
  },
  'greenkitchen': {
    id: 'greenkitchen',
    name: 'Green Kitchen',
    category: 'Organic Food',
    color: '#27AE60',
    rating: 4.4,
    description: 'Fresh organic ingredients and healthy food options',
    banner: 'SHOP BANNER',
    profileIcon: 'PROFILE'
  },
  'pixelforge': {
    id: 'pixelforge',
    name: 'Pixel Forge',
    category: 'Digital Products',
    color: '#3498DB',
    rating: 4.9,
    description: 'Creative digital products and digital art',
    banner: 'SHOP BANNER',
    profileIcon: 'PROFILE'
  }
};

// Mock products data - in real app this would come from API
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Chic Ballet Flats',
    image: '/api/placeholder/300/300',
    price: 25.18,
    originalPrice: 35.00,
    colors: ['#8E44AD'],
    available: true,
    sizes: ['7', '8', '9'],
    category: 'shoes',
    theme: 'ballet',
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: true, content: 'SALE' }
  },
  {
    id: 2,
    name: 'Cozy Winter Boots',
    image: '/api/placeholder/300/300',
    price: 76.24,
    originalPrice: 76.24,
    colors: ['#3498DB', '#F39C12'],
    available: true,
    sizes: ['8', '9', '10'],
    category: 'shoes',
    theme: 'winter',
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 3,
    name: 'Durable Work Boots',
    image: '/api/placeholder/300/300',
    price: 93.68,
    originalPrice: 93.68,
    colors: ['#8E44AD'],
    available: true,
    sizes: ['9', '10', '11'],
    category: 'shoes',
    theme: 'work',
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 4,
    name: 'Classic Leather Loafers',
    image: '/api/placeholder/300/300',
    price: 97.14,
    originalPrice: 97.14,
    colors: ['#3498DB', '#F39C12'],
    available: true,
    sizes: ['8', '9', '10'],
    category: 'shoes',
    theme: 'classic',
    newLabel: { enabled: true, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 5,
    name: 'Sophisticated Brogues',
    image: '/api/placeholder/300/300',
    price: 56.61,
    originalPrice: 56.61,
    colors: ['#F1C40F', '#F39C12'],
    available: true,
    sizes: ['8', '9', '10'],
    category: 'shoes',
    theme: 'formal',
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 6,
    name: 'Waterproof Hiking Boots',
    image: '/api/placeholder/300/300',
    price: 60.98,
    originalPrice: 60.98,
    colors: ['#8E44AD', '#F39C12'],
    available: true,
    sizes: ['9', '10', '11'],
    category: 'shoes',
    theme: 'outdoor',
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 7,
    name: 'Elegant Evening Pumps',
    image: '/api/placeholder/300/300',
    price: 89.99,
    originalPrice: 120.00,
    colors: ['#2C3E50', '#E74C3C'],
    available: true,
    sizes: ['8', '9', '10'],
    category: 'shoes',
    theme: 'elegant',
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: true, content: 'SALE' }
  },
  {
    id: 8,
    name: 'Comfortable Sneakers',
    image: '/api/placeholder/300/300',
    price: 45.50,
    originalPrice: 45.50,
    colors: ['#ECF0F1', '#3498DB', '#27AE60'],
    available: true,
    sizes: ['8', '9', '10'],
    category: 'shoes',
    theme: 'casual',
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 9,
    name: 'Vintage Oxford Shoes',
    image: '/api/placeholder/300/300',
    price: 78.25,
    originalPrice: 78.25,
    colors: ['#8B4513', '#2C3E50'],
    available: true,
    sizes: ['8', '9', '10'],
    category: 'shoes',
    theme: 'vintage',
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 10,
    name: 'Ocean Wave Stickers',
    image: '/api/placeholder/300/300',
    price: 32.99,
    originalPrice: 45.00,
    colors: ['#95A5A6', '#2C3E50'],
    available: true,
    sizes: ['8', '9', '10'],
    category: 'accessories',
    theme: 'ocean',
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: true, content: 'SALE' }
  },
  {
    id: 11,
    name: 'Ballet Theme Stickers',
    image: '/api/placeholder/300/300',
    price: 125.00,
    originalPrice: 125.00,
    colors: ['#2C3E50'],
    available: true,
    sizes: ['8', '9', '10'],
    category: 'accessories',
    theme: 'ballet',
    newLabel: { enabled: true, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 12,
    name: 'Sporty Running Shoes',
    image: '/api/placeholder/300/300',
    price: 67.89,
    originalPrice: 67.89,
    colors: ['#E74C3C', '#3498DB', '#F1C40F'],
    available: true,
    sizes: ['8', '9', '10'],
    category: 'shoes',
    theme: 'sporty',
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 13,
    name: 'Classic Moccasins',
    image: '/api/placeholder/300/300',
    price: 54.75,
    originalPrice: 54.75,
    colors: ['#D2B48C', '#8B4513'],
    available: true,
    sizes: ['8', '9', '10'],
    category: 'shoes',
    theme: 'classic',
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 14,
    name: 'Trendy Platform Shoes',
    image: '/api/placeholder/300/300',
    price: 82.50,
    originalPrice: 110.00,
    colors: ['#ECF0F1', '#E91E63'],
    available: true,
    sizes: ['8', '9', '10'],
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: true, content: 'SALE' }
  },
  {
    id: 15,
    name: 'Professional Derby Shoes',
    image: '/api/placeholder/300/300',
    price: 95.00,
    originalPrice: 95.00,
    colors: ['#2C3E50', '#8B4513'],
    available: true,
    sizes: ['8', '9', '10'],
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 16,
    name: 'Casual Canvas Shoes',
    image: '/api/placeholder/300/300',
    price: 28.99,
    originalPrice: 28.99,
    colors: ['#ECF0F1', '#3498DB', '#E74C3C'],
    available: true,
    sizes: ['8', '9', '10'],
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 17,
    name: 'Luxury Heeled Boots',
    image: '/api/placeholder/300/300',
    price: 145.00,
    originalPrice: 145.00,
    colors: ['#2C3E50', '#8B4513'],
    available: true,
    sizes: ['8', '9', '10'],
    newLabel: { enabled: true, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 18,
    name: 'Comfortable Sandals',
    image: '/api/placeholder/300/300',
    price: 39.99,
    originalPrice: 55.00,
    colors: ['#8B4513', '#D2B48C'],
    available: true,
    sizes: ['8', '9', '10'],
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: true, content: 'SALE' }
  },
  {
    id: 19,
    name: 'Stylish Ankle Boots',
    image: '/api/placeholder/300/300',
    price: 88.75,
    originalPrice: 88.75,
    colors: ['#2C3E50', '#95A5A6'],
    available: true,
    sizes: ['8', '9', '10'],
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  },
  {
    id: 20,
    name: 'Classic Wingtip Shoes',
    image: '/api/placeholder/300/300',
    price: 112.50,
    originalPrice: 112.50,
    colors: ['#8B4513', '#2C3E50'],
    available: true,
    sizes: ['8', '9', '10'],
    newLabel: { enabled: false, content: 'NEW' },
    saleLabel: { enabled: false, content: 'SALE' }
  }
];

// ----------------------------------------------------------------------

function ProductItem({ product, storeId }) {
  const checkout = useCheckoutContext();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const { id, name, image, price, colors, available, sizes, originalPrice, newLabel, saleLabel } = product;

  const handleQuickView = (product) => {
    setQuickViewOpen(true);
  };

  const handleAddCart = async () => {
    const newProduct = {
      id,
      name,
      coverUrl: image,
      available: 99, // Set proper stock quantity instead of boolean
      price,
      colors: [colors[0]],
      size: sizes[0],
      quantity: 1,
    };
    try {
      checkout.onAddToCart(newProduct);
    } catch (error) {
      console.error(error);
    }
  };

  const renderLabels = (newLabel.enabled || saleLabel.enabled) && (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        position: 'absolute',
        zIndex: 9,
        top: 16,
        left: 16,
      }}
    >
      {newLabel.enabled && (
        <Label variant="filled" color="info">
          {newLabel.content}
        </Label>
      )}
      {saleLabel.enabled && (
        <Label variant="filled" color="error">
          {saleLabel.content}
        </Label>
      )}
    </Stack>
  );

  const renderImg = (
    <Box sx={{ position: 'relative', p: 1 }}>
      {!!available && (
        <>
          {/* Eye icon at top right */}
          <Fab
            color="default"
            size="medium"
            className="view-btn"
            onClick={() => handleQuickView(product)}
            sx={{
              right: 16,
              top: 16,
              zIndex: 9,
              opacity: 0,
              position: 'absolute',
              backgroundColor: 'transparent',
              boxShadow: 'none',
              transition: (theme) => theme.transitions.create(['opacity', 'background-color', 'box-shadow', 'transform'], {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                backgroundColor: 'primary.main',
                boxShadow: 4,
                transform: 'scale(1.05)',
                '& .iconify': {
                  color: '#fff',
                },
              },
            }}
          >
            <Iconify icon="solar:eye-bold" width={24} className="iconify" />
          </Fab>
          {/* Cart icon at bottom right */}
          <Fab
            color="default"
            size="medium"
            className="add-cart-btn"
            onClick={handleAddCart}
            sx={{
              right: 16,
              bottom: 16,
              zIndex: 9,
              opacity: 0,
              position: 'absolute',
              backgroundColor: 'transparent',
              boxShadow: 'none',
              transition: (theme) => theme.transitions.create(['opacity', 'background-color', 'box-shadow', 'transform'], {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                backgroundColor: 'primary.main',
                boxShadow: 4,
                transform: 'scale(1.05)',
                '& .iconify': {
                  color: '#fff',
                },
              },
            }}
          >
            <Iconify icon="solar:cart-plus-bold" width={24} className="iconify" />
          </Fab>
        </>
      )}

      <Box
        sx={{
          position: 'relative',
          width: 260,
          height: 250,
          bgcolor: 'grey.100',
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <img
          src="/assets/placeholder.svg"
          alt={`${name} placeholder`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
    </Box>
  );

  const renderContent = (
    <Stack spacing={2.5} sx={{ p: 3, pt: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
        {name}
      </Typography>

      <Stack direction="row" alignItems="center" justifyContent="flex-end">
        <Stack direction="row" spacing={0.5} sx={{ typography: 'subtitle1' }}>
          {originalPrice !== price && (
            <Box component="span" sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>
              ₱{originalPrice.toFixed(2)}
            </Box>
          )}

          <Box component="span">₱{price.toFixed(2)}</Box>
        </Stack>
      </Stack>
    </Stack>
  );

  return (
    <>
      <Card sx={{
        '&:hover .add-cart-btn, &:hover .view-btn': { opacity: 1 },
        boxShadow: 'none',
        border: 'none',
        '&:hover': {
          boxShadow: 'none',
          transform: 'none'
        }
      }}>
        {renderLabels}
        {renderImg}
        {renderContent}
      </Card>
      {/* Quick View Modal */}
      <Modal
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        aria-labelledby="quick-view-modal"
        sx={{ zIndex: 1300 }}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95vw', sm: 900 },
          maxWidth: 900,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 0,
          borderRadius: 3,
          maxHeight: '95vh',
          overflow: 'auto',
          display: 'flex',
        }}>
          {/* Left: Product Image */}
          <Box sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            p: 3,
          }}>
            <Box sx={{
              width: '100%',
              maxWidth: 400,
              aspectRatio: '1/1',
              bgcolor: 'grey.100',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <img
                src="/assets/placeholder.svg"
                alt={`${name} placeholder`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Box>
          {/* Right: Product Details & Actions */}
          <Box sx={{
            flex: 1.2,
            minWidth: 0,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => setQuickViewOpen(false)}>
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>{name}</Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 2 }}>{product.description || 'Product description goes here.'}</Typography>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>₱{price.toFixed(2)}</Typography>
              {originalPrice !== price && (
                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>
                  ₱{originalPrice.toFixed(2)}
                </Typography>
              )}
            </Stack>
            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button 
                fullWidth 
                size="large" 
                variant="outlined" 
                color="primary" 
                onClick={handleAddCart} 
                startIcon={<Iconify icon="solar:cart-plus-bold" />}
                sx={{ flex: 1 }}
              >
                Add to Cart
              </Button>
              <Button 
                fullWidth 
                size="large" 
                variant="contained" 
                color="primary" 
                startIcon={<Iconify icon="solar:bag-heart-bold" />}
                sx={{ flex: 1 }}
              >
                Buy Now
              </Button>
            </Stack>
            {/* View Full Details Button */}
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 3, fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
              href={`/stores/${storeId}/${encodeURIComponent(name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'))}`}
            >
              View full details
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

// ----------------------------------------------------------------------

export default function StorePage({ params }) {
  const theme = useTheme();
  const { storeId } = use(params);
  const checkout = useCheckoutContext();

  // Set page title
  useEffect(() => {
    const store = STORE_DATA[storeId];
    if (store) {
      document.title = `${store.name} | STUDIO360`;
    } else {
      document.title = `Store | STUDIO360`;
    }
  }, [storeId]);

  // Handle scroll to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300); // Show after scrolling 300px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentTab, setCurrentTab] = useState('products');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [showPreChatForm, setShowPreChatForm] = useState(false);

  // Get dynamic categories and themes for this seller/store
  const availableCategories = useMemo(() => {
    return getFilteringCategories(storeId, MOCK_PRODUCTS);
  }, [storeId]);

  const availableThemes = useMemo(() => {
    return getFilteringThemes(storeId, MOCK_PRODUCTS);
  }, [storeId]);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', optIn: false });
  const [isAgentOnline, setIsAgentOnline] = useState(true); // Simulate agent availability
  const [showBackToTop, setShowBackToTop] = useState(false);

  const store = STORE_DATA[storeId];

  if (!store) {
    return (
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl" sx={{ textAlign: 'center' }}>
          <Typography variant="h4">Store not found</Typography>
        </Container>
      </Box>
    );
  }

  const filteredProducts = useMemo(() => {
    let filtered = MOCK_PRODUCTS;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Theme filter
    if (selectedTheme !== 'all') {
      filtered = filtered.filter(product => product.theme === selectedTheme);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'new') {
        filtered = filtered.filter(product => product.newLabel.enabled);
      } else if (selectedStatus === 'sale') {
        filtered = filtered.filter(product => product.saleLabel.enabled);
      }
    }

    // Sort filter
    switch (sortBy) {
      case 'featured':
        filtered = [...filtered].sort((a, b) => a.id - b.id);
        break;
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered = [...filtered].sort((a, b) => b.id - a.id);
        break;
      case 'name-asc':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'popularity':
        filtered = [...filtered].sort((a, b) => b.id - a.id); // Mock popularity
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, sortBy, selectedCategory, selectedTheme, selectedStatus]);

  const productsPerPage = 20;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Filter reviews based on selected rating
  const filteredReviews = useMemo(() => {
    if (selectedRating === 'all') {
      return MOCK_REVIEWS;
    }
    return MOCK_REVIEWS.filter(review => review.rating === parseInt(selectedRating));
  }, [selectedRating]);

  // Handle rating filter change
  const handleRatingFilter = (rating) => {
    setSelectedRating(rating);
  };

  // Handle image click to open modal
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  // Close image modal
  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Chatbot functions
  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
    if (!isChatbotOpen) {
      // Only show pre-chat form if user hasn't provided info yet
      if (!userInfo.name || !userInfo.email) {
        setShowPreChatForm(true);
        setChatMessages([]);
      } else {
        setShowPreChatForm(false);
        setChatMessages([
          {
            id: 1,
            type: 'bot',
            message: `Hi ${userInfo.name}! Welcome back to ${store.name}! 👋 How can I help you today?`,
            timestamp: new Date()
          }
        ]);
        setCurrentStep('welcome');
      }
    } else {
      setShowPreChatForm(false);
      setChatMessages([]);
      setCurrentStep('welcome');
    }
  };

  const handlePreChatSubmit = () => {
    if (userInfo.name && userInfo.email) {
      setShowPreChatForm(false);
      setChatMessages([
        {
          id: 1,
          type: 'bot',
          message: `Hi ${userInfo.name}! Welcome to ${store.name}! 👋 How can I help you today?`,
          timestamp: new Date()
        }
      ]);
      setCurrentStep('welcome');
    }
  };

  const handleChatMessage = (message, step) => {
    const newMessage = {
      id: Date.now(),
      type: 'user',
      message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = '';
      let nextStep = step;

      switch (step) {
        case 'welcome':
          botResponse = 'I can help you with:\n• Product information\n• Order status\n• Shipping details\n• Return policy\n• General questions\n\nWhat would you like to know?';
          nextStep = 'faq';
          break;
        case 'faq':
          if (message.toLowerCase().includes('shipping') || message.toLowerCase().includes('delivery')) {
            botResponse = '🚚 **Shipping Information:**\n\n• Standard delivery: 3-5 business days\n• Express delivery: 1-2 business days\n• Free shipping on orders over ₱1,000\n• We ship nationwide via LBC, J&T, and GrabExpress\n\nNeed more specific details?';
          } else if (message.toLowerCase().includes('return') || message.toLowerCase().includes('refund')) {
            botResponse = '🔄 **Return Policy:**\n\n• 7-day return window for unused items\n• Refund processed within 3-5 business days\n• Return shipping costs covered by customer\n• Contact us for return authorization\n\nWould you like to speak with a live agent?';
          } else if (message.toLowerCase().includes('payment') || message.toLowerCase().includes('pay')) {
            botResponse = '💳 **Payment Options:**\n\n• Cash on Delivery (COD)\n• Bank Transfer (BDO, BPI, GCash)\n• Credit/Debit Cards\n• PayPal\n• ShopeePay\n\nNeed help with payment?';
          } else if (message.toLowerCase().includes('product') || message.toLowerCase().includes('item')) {
            botResponse = '🛍️ **Product Information:**\n\n• All items are handmade with premium materials\n• Custom orders available (lead time: 1-2 weeks)\n• Size charts available for clothing items\n• Product photos show actual items\n\nWant to see our latest collection?';
          } else {
            botResponse = 'I understand you\'re asking about "' + message + '". Let me connect you with a live agent who can better assist you with this specific question.';
            nextStep = 'live_agent';
          }
          break;
        case 'live_agent':
          if (isAgentOnline) {
            botResponse = 'I\'m connecting you to a live agent via WhatsApp. They\'ll be with you shortly! 📱';
            nextStep = 'whatsapp_redirect';
          } else {
            botResponse = `Hi ${userInfo.name}, our live agents are currently offline. Please provide your question below and we'll respond via email at ${userInfo.email} within 24 hours. 📧`;
            nextStep = 'email_fallback';
          }
          break;
        case 'email_fallback':
          botResponse = 'Thank you for your message. We will respond to your email as soon as possible.';
          nextStep = 'welcome';
          break;
        default:
          botResponse = 'Thank you for chatting with us! Is there anything else I can help you with?';
          nextStep = 'welcome';
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: botResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
      setCurrentStep(nextStep);

      // Redirect to WhatsApp if needed
      if (nextStep === 'whatsapp_redirect') {
        setTimeout(() => {
          const whatsappUrl = `https://wa.me/639123456789?text=Hi! I need help with: ${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }, 2000);
      }
    }, 1000);
  };

  const handleFAQClick = (faqType) => {
    const faqMessages = {
      shipping: 'What are your shipping options and delivery times?',
      returns: 'What is your return and refund policy?',
      payment: 'What payment methods do you accept?',
      products: 'Tell me about your products and materials'
    };

    handleChatMessage(faqMessages[faqType], 'faq');
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Announcement Banner */}
      <Box sx={{ bgcolor: 'primary.lighter', py: 2, px: { xs: 1, md: 2 }, textAlign: 'center' }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <Iconify icon="eva:shopping-cart-fill" width={20} sx={{ color: 'primary.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Spend ₱1,500 and get FREE tracked nationwide shipping!
          </Typography>
        </Stack>
      </Box>

      {/* Standalone Back Button */}
      <IconButton
        onClick={() => window.history.back()}
        sx={{
          position: 'absolute',
          top: { xs: 60, md: 70 },
          left: 20,
          zIndex: 10,
            bgcolor: 'white',
          color: 'black',
          border: '1px solid',
          borderColor: 'grey.300',
          width: 40,
          height: 40,
          '&:hover': {
            bgcolor: 'primary.main',
            color: 'white',
            borderColor: 'primary.main',
            boxShadow: 2
          }
        }}
      >
        <Iconify icon="eva:chevron-left-fill" width={20} />
      </IconButton>


      {/* Shop Banner Area */}
      <Box sx={{ position: 'relative', bgcolor: 'primary.dark', minHeight: 400 }}>
        {/* Realistic Storefront Background Image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 1,
            }
          }}
        />

        {/* Circular Profile Placeholder - Centered, Overlapping Header */}
        <Box sx={{
          position: 'absolute',
          top: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3
        }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: 'grey.300',
              border: '4px solid white',
              boxShadow: 3
            }}
          >
            <Typography variant="h2" sx={{ color: 'grey.600', fontWeight: 700 }}>
              {store.name.charAt(0)}
            </Typography>
          </Avatar>
        </Box>

        {/* Shop Information Overlay - Below Profile Placeholder */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          textAlign: 'center',
          mt: 8
        }}>
          {/* Shop Name */}
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 1.5,
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
            }}
          >
            {store.name.toUpperCase()}
          </Typography>

          {/* Location with Icon */}
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            <Iconify
              icon="eva:pin-outline"
              width={16}
              sx={{
                color: 'white',
                filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.7))'
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                color: 'white',
                fontWeight: 500,
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
              }}
            >
              Lipa City, Batangas
            </Typography>
          </Stack>
        </Box>

        {/* Bottom Navigation Tabs */}
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          bgcolor: 'white',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          py: 2,
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <Stack direction="row" spacing={0} justifyContent="center">
            <Button
              variant="text"
              startIcon={<Iconify icon="solar:cart-3-bold" width={20} />}
              onClick={() => handleTabChange(null, 'products')}
              sx={{
                color: currentTab === 'products' ? 'primary.main' : 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                borderBottom: currentTab === 'products' ? '3px solid' : 'none',
                borderColor: 'primary.main',
                borderRadius: 0,
                pb: 1,
                px: 3,
                minWidth: 120,
                '& .MuiButton-startIcon': {
                  color: currentTab === 'products' ? 'primary.main' : 'text.secondary'
                }
              }}
            >
              PRODUCTS
            </Button>

            <Button
              variant="text"
              startIcon={<Iconify icon="solar:star-bold" width={20} />}
              onClick={() => handleTabChange(null, 'reviews')}
              sx={{
                color: currentTab === 'reviews' ? 'primary.main' : 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                borderBottom: currentTab === 'reviews' ? '3px solid' : 'none',
                borderColor: 'primary.main',
                borderRadius: 0,
                pb: 1,
                px: 3,
                minWidth: 120,
                '& .MuiButton-startIcon': {
                  color: currentTab === 'reviews' ? 'primary.main' : 'text.secondary'
                }
              }}
            >
              REVIEWS
            </Button>

            <Button
              variant="text"
              startIcon={<Iconify icon="solar:shop-bold" width={20} />}
              onClick={() => handleTabChange(null, 'shop-info')}
              sx={{
                color: currentTab === 'shop-info' ? 'primary.main' : 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                borderBottom: currentTab === 'shop-info' ? '3px solid' : 'none',
                borderColor: 'primary.main',
                borderRadius: 0,
                pb: 1,
                px: 3,
                minWidth: 120,
                '& .MuiButton-startIcon': {
                  color: currentTab === 'shop-info' ? 'primary.main' : 'text.secondary'
                }
              }}
            >
              SHOP INFO
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Floating Cart Icon - matches Next.js exactly */}
      <CartIcon totalItems={checkout.totalItems} storeId={storeId} />

      {/* Tab Content */}
      <Container sx={{ mb: 15, pt: 8 }}>
        {currentTab === 'products' && (
          <>
            {/* Search and Filters - matches Next.js layout */}
            <Box
              component={m.div}
              variants={varFade().inUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <Stack
                spacing={2.5}
                sx={{ 
                  mb: { xs: 3, md: 5 },
                  position: 'relative',
                  zIndex: 50
                }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
              >
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={{ xs: 1.5, sm: 1 }} 
                  flexShrink={0} 
                  sx={{ 
                    flexWrap: 'wrap', 
                    gap: { xs: 1.5, sm: 1 },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 }, width: { xs: '100%', sm: 'auto' } }}>
                    <InputLabel sx={{ fontSize: '0.85rem' }}>Category</InputLabel>
                    <Select
                      label="Category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      startAdornment={<Iconify icon="solar:category-linear" width={16} sx={{ mr: 1 }} />}
                  sx={{
                      borderRadius: 2,
                        fontSize: '0.9rem',
                        '& .MuiSelect-select': {
                          py: 0.75,
                          fontSize: '0.9rem'
                        }
                      }}
                    >
                      {availableCategories.map((category) => (
                        <MenuItem key={category} value={category} sx={{ fontSize: '0.9rem' }}>
                          {category === 'all' ? 'All' : category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 }, width: { xs: '100%', sm: 'auto' } }}>
                    <InputLabel sx={{ fontSize: '0.85rem' }}>Theme</InputLabel>
                    <Select
                      label="Theme"
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      startAdornment={<Iconify icon="solar:palette-linear" width={16} sx={{ mr: 1 }} />}
                  sx={{
                      borderRadius: 2,
                        fontSize: '0.9rem',
                        '& .MuiSelect-select': {
                          py: 0.75,
                          fontSize: '0.9rem'
                        }
                      }}
                    >
                      {availableThemes.map((theme) => (
                        <MenuItem key={theme} value={theme} sx={{ fontSize: '0.9rem' }}>
                          {theme === 'all' ? 'All' : theme}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 }, width: { xs: '100%', sm: 'auto' } }}>
                    <InputLabel sx={{ fontSize: '0.85rem' }}>Status</InputLabel>
                    <Select
                      label="Status"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      startAdornment={<Iconify icon="solar:tag-linear" width={16} sx={{ mr: 1 }} />}
                      sx={{ 
                        borderRadius: 2,
                        fontSize: '0.9rem',
                        '& .MuiSelect-select': {
                          py: 0.75,
                          fontSize: '0.9rem'
                        }
                      }}
                    >
                      <MenuItem value="all" sx={{ fontSize: '0.9rem' }}>All</MenuItem>
                      <MenuItem value="new" sx={{ fontSize: '0.9rem' }}>New Items</MenuItem>
                      <MenuItem value="sale" sx={{ fontSize: '0.9rem' }}>On Sale</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 }, width: { xs: '100%', sm: 'auto' } }}>
                    <InputLabel sx={{ fontSize: '0.85rem' }}>Sort by</InputLabel>
                    <Select
                      label="Sort by"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      startAdornment={<Iconify icon="solar:sort-linear" width={16} sx={{ mr: 1 }} />}
                      sx={{ 
                        borderRadius: 2,
                        fontSize: '0.9rem',
                        '& .MuiSelect-select': {
                          py: 0.75,
                          fontSize: '0.9rem'
                        }
                      }}
                    >
                      <MenuItem value="featured" sx={{ fontSize: '0.9rem' }}>Featured</MenuItem>
                      <MenuItem value="newest" sx={{ fontSize: '0.9rem' }}>Newest</MenuItem>
                      <MenuItem value="popularity" sx={{ fontSize: '0.9rem' }}>Most Popular</MenuItem>
                      <MenuItem value="price-low" sx={{ fontSize: '0.9rem' }}>Price: Low to High</MenuItem>
                      <MenuItem value="price-high" sx={{ fontSize: '0.9rem' }}>Price: High to Low</MenuItem>
                      <MenuItem value="name-asc" sx={{ fontSize: '0.9rem' }}>Name: A to Z</MenuItem>
                      <MenuItem value="name-desc" sx={{ fontSize: '0.9rem' }}>Name: Z to A</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <TextField
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:magnifer-linear" width={16} sx={{ mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: 280 },
                    fontSize: '0.9rem',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      py: 0.75,
                      fontSize: '0.9rem',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.9rem',
                    },
                  }}
                />
              </Stack>
            </Box>

            {/* Products Grid - matches Next.js exactly */}
            <Box
              gap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
            >
              {currentProducts.map((product, index) => (
                <Box
                  key={product.id}
                  component={m.div}
                  variants={varFade().inUp}
                  initial="initial"
                  animate={index < 4 ? "animate" : undefined}
                  whileInView={index >= 4 ? "animate" : undefined}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ 
                    duration: index < 4 ? 0.4 : 0.6, 
                    delay: index < 4 ? index * 0.05 : 0 
                  }}
                >
                  <ProductItem product={product} storeId={storeId} />
                </Box>
              ))}
            </Box>

            {/* Pagination - matches Next.js exactly */}
            {currentProducts.length > 8 && (
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                sx={{
                  mt: { xs: 5, md: 8 },
                  '& .MuiPagination-ul': { justifyContent: 'center' },
                }}
              />
            )}
          </>
        )}



        {currentTab === 'reviews' && (
          <Box sx={{ py: 3 }}>
            {/* Reviews Header */}
            <Box
              component={m.div}
              variants={varFade().inUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.4 }}
              sx={{ textAlign: 'center', mb: 3 }}
            >
              <Typography variant="h4" sx={{ mb: 2, color: 'text.primary' }}>
                Shop Reviews
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                What customers say about {store.name}
              </Typography>

              {/* Overall Rating */}
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 4 }}>
                <Rating value={store.rating} precision={0.1} readOnly size="large" />
                <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  {store.rating.toFixed(1)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  out of 5
                </Typography>
              </Stack>
            </Box>

            {/* Reviews Filter Buttons */}
            <Box
              component={m.div}
              variants={varFade().inUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.4, delay: 0.1 }}
              sx={{ mb: 3 }}
            >
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1, sm: 2 }} 
                justifyContent="center" 
                flexWrap="wrap" 
                useFlexGap
                sx={{ 
                  alignItems: { xs: 'stretch', sm: 'center' },
                  '& > *': { 
                    minWidth: { xs: '100%', sm: 'auto' },
                    flex: { xs: '1 1 auto', sm: '0 0 auto' }
                  }
                }}
              >
                {[
                  { label: 'All Reviews', count: MOCK_REVIEWS.length, rating: 'all', color: 'primary' },
                  { label: '5 Stars', count: MOCK_REVIEWS.filter(r => r.rating === 5).length, rating: 5, color: 'success' },
                  { label: '4 Stars', count: MOCK_REVIEWS.filter(r => r.rating === 4).length, rating: 4, color: 'info' },
                  { label: '3 Stars', count: MOCK_REVIEWS.filter(r => r.rating === 3).length, rating: 3, color: 'warning' },
                  { label: '2 Stars', count: MOCK_REVIEWS.filter(r => r.rating === 2).length, rating: 2, color: 'error' },
                  { label: '1 Star', count: MOCK_REVIEWS.filter(r => r.rating === 1).length, rating: 1, color: 'error' }
                ].map((filter) => (
                  <Button
                    key={filter.label}
                    variant={selectedRating === filter.rating ? "contained" : "outlined"}
                    color={selectedRating === filter.rating ? "primary" : filter.color || "inherit"}
                    onClick={() => handleRatingFilter(filter.rating)}
                    sx={{
                      borderRadius: 2,
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1.5, sm: 1 },
                      minWidth: { xs: '100%', sm: 120 },
                      width: { xs: '100%', sm: 'auto' },
                      position: 'relative',
                      fontSize: { xs: '0.9rem', sm: '0.95rem' },
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <Stack alignItems="center" spacing={0.5}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {filter.label}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {filter.count} reviews
                      </Typography>
                    </Stack>
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* Recent Reviews */}
            <Box
              component={m.div}
              variants={varFade().inUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Typography variant="h5" sx={{ mb: 3, color: 'text.primary' }}>
                Recent Reviews
                  </Typography>

                  <Stack spacing={3}>
                    {filteredReviews.map((review, index) => (
                      <Card
                        key={review.id}
                        component={m.div}
                        variants={varFade().inUp}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        sx={{ p: 3 }}
                      >
                        <Stack spacing={3}>
                          {/* Review Header */}
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack spacing={1}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {review.isAnonymous ? review.customerName : review.customerName}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {review.product}
                              </Typography>
                            </Stack>
                            <Stack alignItems="flex-end" spacing={1}>
                              <Rating value={review.rating} readOnly size="small" />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {review.date}
                              </Typography>
                            </Stack>
                          </Stack>

                          {/* Review Comment */}
                          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                            "{review.comment}"
                          </Typography>

                          {/* Review Images */}
                          {review.images && review.images.length > 0 && (
                            <Box>
                              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                Photos from this review:
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {review.images.map((image, imgIndex) => (
                                  <Box
                                    key={imgIndex}
                                    onClick={() => handleImageClick(image)}
                                    sx={{
                                      width: 80,
                                      height: 80,
                                      borderRadius: 1,
                                      overflow: 'hidden',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        transform: 'scale(1.05)',
                                        transition: 'transform 0.2s ease'
                                      }
                                    }}
                                  >
                                    <img
                                      src={image}
                                      alt={`Review photo ${imgIndex + 1}`}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                  </Box>
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Box>
          </Box>
        )}

        {currentTab === 'shop-info' && (
          <Box sx={{ py: 3 }}>
            <Box
              component={m.div}
              variants={varFade().inUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.4 }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 3, 
                  color: 'text.primary',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                Shop Information
              </Typography>

              <Grid container spacing={3} alignItems="flex-start">
                {/* Left Side - Profile Picture */}
                <Grid item xs={12} md={4}>
                  <Box
                    component={m.div}
                    variants={varFade().inUp}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 0.4, delay: 0.1 }}
                    sx={{ textAlign: 'center' }}
                  >
                    <Avatar
                      src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=face"
                      alt={`${store.name} Profile`}
                      sx={{
                        width: { xs: 150, sm: 180, md: 200 },
                        height: { xs: 150, sm: 180, md: 200 },
                        mx: 'auto',
                        mb: 3,
                        border: '4px solid',
                        borderColor: 'primary.main',
                        boxShadow: 3
                      }}
                    />
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: 'text.primary', 
                        mb: 1, 
                        fontWeight: 600,
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                      }}
                    >
                      {store.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary', 
                        mb: 2,
                        fontSize: { xs: '0.9rem', sm: '0.875rem' }
                      }}
                    >
                      {store.category}
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                      <Rating value={store.rating} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {store.rating.toFixed(1)}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>

                {/* Right Side - Shop Details */}
                <Grid item xs={12} md={8}>
                  <Box
                    component={m.div}
                    variants={varFade().inUp}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Stack spacing={4}>
                      {/* Shop Description */}
                      <Box>
                        <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
                          About Our Shop
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.8 }}>
                          {store.description}
                        </Typography>
                      </Box>

                      {/* Address */}
                      <Box>
                        <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
                          Location
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Iconify
                            icon="eva:pin-outline"
                            width={24}
                            sx={{ color: 'primary.main' }}
                          />
                          <Typography variant="body1" sx={{ color: 'text.primary' }}>
                            Lipa City, Batangas, Philippines
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Contact Information */}
                      <Box>
                        <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
                          Contact Information
                        </Typography>
                        <Stack spacing={2}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Iconify
                              icon="eva:email-outline"
                              width={20}
                              sx={{ color: 'primary.main' }}
                            />
                            <Typography variant="body1" sx={{ color: 'text.primary' }}>
                              hello@{store.name.toLowerCase().replace(/\s+/g, '')}.com
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Iconify
                              icon="eva:phone-outline"
                              width={20}
                              sx={{ color: 'primary.main' }}
                            />
                            <Typography variant="body1" sx={{ color: 'text.primary' }}>
                              +63 912 345 6789
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>

                      {/* Social Media Links */}
                      <Box>
                        <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
                          Follow Us
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                          {[
                            {
                              name: 'Facebook',
                              icon: 'eva:facebook-fill',
                              color: '#1877F2',
                              url: 'https://facebook.com'
                            },
                            {
                              name: 'Instagram',
                              icon: 'eva:instagram-fill',
                              color: '#E4405F',
                              url: 'https://instagram.com'
                            },
                            {
                              name: 'Twitter',
                              icon: 'eva:twitter-fill',
                              color: '#1DA1F2',
                              url: 'https://twitter.com'
                            },
                            {
                              name: 'YouTube',
                              icon: 'eva:youtube-fill',
                              color: '#FF0000',
                              url: 'https://youtube.com'
                            },
                            {
                              name: 'TikTok',
                              icon: 'eva:video-outline',
                              color: '#000000',
                              url: 'https://tiktok.com'
                            }
                          ].map((social) => (
                            <Button
                              key={social.name}
                              component="a"
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="outlined"
                              startIcon={
                                <Iconify
                                  icon={social.icon}
                                  width={20}
                                  sx={{ color: social.color }}
                                />
                              }
                              sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1.5,
                                borderColor: 'divider',
                                color: 'text.primary',
                                '&:hover': {
                                  borderColor: social.color,
                                  bgcolor: `${social.color}10`,
                                  transform: 'translateY(-2px)',
                                  boxShadow: 2
                                }
                              }}
                            >
                              {social.name}
                            </Button>
                          ))}
                        </Stack>
                      </Box>

                      {/* Business Hours */}
                      <Box>
                        <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
                          Business Hours
                        </Typography>
                        <Stack spacing={1}>
                          {[
                            { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
                            { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
                            { day: 'Sunday', hours: 'Closed' }
                          ].map((schedule) => (
                            <Stack
                              key={schedule.day}
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{
                                py: 1,
                                px: 2,
                                bgcolor: 'background.neutral',
                                borderRadius: 1
                              }}
                            >
                              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                {schedule.day}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {schedule.hours}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Container>

      {/* Simplified Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'common.white',
          py: 3,
          borderTop: '1px solid',
          borderColor: 'grey.800',
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            textAlign={{ xs: 'center', sm: 'left' }}
          >
            {/* Copyright */}
            <Typography
              variant="body2"
              sx={{
                color: 'grey.500',
                fontSize: '0.875rem',
              }}
            >
              © 2024 STUDIO360. All rights reserved.
            </Typography>

            {/* Legal Links */}
            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              divider={<Box sx={{ width: 1, height: 12, bgcolor: 'grey.700' }} />}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'grey.500',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: 'grey.300',
                  },
                }}
              >
                Terms of Service
              </Typography>
              
              <Typography
                variant="caption"
                sx={{
                  color: 'grey.500',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: 'grey.300',
                  },
                }}
              >
                Privacy Policy
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Floating Chatbot */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        {/* Chatbot Toggle Button */}
        <Fab
          color="primary"
          aria-label="chat"
          onClick={toggleChatbot}
          sx={{
            width: 48,
            height: 48,
            boxShadow: 2,
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: 4
            }
          }}
        >
          <Iconify
            icon={isChatbotOpen ? "eva:close-fill" : "eva:message-circle-fill"}
            width={20}
          />
        </Fab>

        {/* Chat Interface */}
        {isChatbotOpen && (
          <Box
            component={m.div}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            sx={{
              position: 'absolute',
              bottom: 80,
              right: 0,
              width: 350,
              maxHeight: 500,
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 24,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            {/* Pre-Chat Form */}
            {showPreChatForm ? (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
                  Before we get started
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Please provide your information so we can reply to you if you leave the chat.
                </Typography>

                <Stack spacing={2} sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Name"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    variant="outlined"
                  />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                  <input
                    type="checkbox"
                    id="optIn"
                    checked={userInfo.optIn}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, optIn: e.target.value }))}
                    style={{ margin: 0 }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Opt in to get special email promotions and updates. You can opt out anytime.
                  </Typography>
                </Stack>

                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 3, display: 'block' }}>
                  By proceeding, you agree to the sharing of your data with third parties for the provision, and improvement, of the services. This site is protected by hCaptcha and its Privacy Policy and Terms of Service apply.
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlePreChatSubmit}
                  disabled={!userInfo.name || !userInfo.email}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    bgcolor: 'grey.300',
                    color: 'text.primary',
                    mb: 2,
                    '&.Mui-disabled': {
                      bgcolor: 'grey.100',
                      color: 'text.disabled'
                    }
                  }}
                >
                  Start chat
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setUserInfo({ name: 'Guest User', email: 'guest@example.com', optIn: false });
                    setShowPreChatForm(false);
                    setChatMessages([
                      {
                        id: 1,
                        type: 'bot',
                        message: `Hi! Welcome to ${store.name}! 👋 How can I help you today?`,
                        timestamp: new Date()
                      }
                    ]);
                    setCurrentStep('welcome');
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1.5
                  }}
                >
                  Skip (Demo Mode)
                </Button>
              </Box>
            ) : (
              <>
                {/* Chat Header */}
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Avatar
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=face"
                    sx={{ width: 32, height: 32 }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {store.name} Assistant
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {isAgentOnline ? 'Online • Usually responds instantly' : 'Offline • Will respond via email'}
                    </Typography>
                  </Box>
                </Box>

                {/* Chat Messages */}
                <Box
                  sx={{
                    height: 300,
                    overflowY: 'auto',
                    p: 2,
                    bgcolor: 'background.neutral'
                  }}
                >
                  <Stack spacing={2}>
                    {chatMessages.map((msg) => (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '80%',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: msg.type === 'user' ? 'primary.main' : 'white',
                            color: msg.type === 'user' ? 'white' : 'text.primary',
                            boxShadow: 1,
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-line'
                          }}
                        >
                          <Typography variant="body2">
                            {msg.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.7,
                              display: 'block',
                              mt: 0.5,
                              textAlign: msg.type === 'user' ? 'right' : 'left'
                            }}
                          >
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Quick FAQ Buttons */}
                {currentStep === 'faq' && (
                  <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                      Quick questions:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {[
                        { key: 'shipping', label: '🚚 Shipping', color: 'info' },
                        { key: 'returns', label: '🔄 Returns', color: 'warning' },
                        { key: 'payment', label: '💳 Payment', color: 'success' },
                        { key: 'products', label: '🛍️ Products', color: 'primary' }
                      ].map((faq) => (
                        <Button
                          key={faq.key}
                          size="small"
                          variant="outlined"
                          color={faq.color}
                          onClick={() => handleFAQClick(faq.key)}
                          sx={{
                            fontSize: '0.75rem',
                            py: 0.5,
                            px: 1,
                            minWidth: 'auto'
                          }}
                        >
                          {faq.label}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Chat Input - Always Visible */}
                <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type your message or ask a question..."
                      variant="outlined"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          handleChatMessage(e.target.value.trim(), currentStep);
                          e.target.value = '';
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Type your message or ask a question..."]');
                        if (input && input.value.trim()) {
                          handleChatMessage(input.value.trim(), currentStep);
                          input.value = '';
                        }
                      }}
                      sx={{
                        borderRadius: 2,
                        minWidth: 'auto',
                        px: 2
                      }}
                    >
                      <Iconify icon="eva:paper-plane-fill" width={16} />
                    </Button>
                  </Stack>

                  {/* Help Text */}
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                    💡 You can type any question or use the quick buttons above
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Image Modal */}
      <Modal
        open={isImageModalOpen}
        onClose={handleCloseImageModal}
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
        sx={{
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            outline: 'none'
          }}
        >
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Review photo"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: 8
              }}
            />
          )}
          <IconButton
            onClick={handleCloseImageModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <Iconify icon="eva:close-fill" width={20} />
          </IconButton>
        </Box>
      </Modal>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <IconButton
          aria-label="back to top"
          onClick={handleBackToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 80, md: 90 },
            right: { xs: 20, md: 30 },
            zIndex: 1100,
            width: 48,
            height: 48,
            backgroundColor: 'transparent',
            color: 'primary.main',
            opacity: 0.8,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'white',
              opacity: 1,
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          <Iconify 
            icon="eva:arrow-upward-fill" 
            width={20} 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }} 
          />
        </IconButton>
      )}
    </Box>
  );
}
