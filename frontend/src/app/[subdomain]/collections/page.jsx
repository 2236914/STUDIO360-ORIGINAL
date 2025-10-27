'use client';

import { useState, useEffect, use } from 'react';

import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Avatar,
  Typography,
  Container,
  Chip,
  CardMedia,
  CardContent,
  CardActions,
} from '@mui/material';

import { useRouter } from 'next/navigation';

import { isStoreSubdomain } from 'src/utils/subdomain';
import { storefrontApi } from 'src/utils/api/storefront';

import { StoreHeader } from 'src/components/store-header';
import { StoreFooter } from 'src/components/store-footer';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function SubdomainCollectionsPage({ params }) {
  const { subdomain } = use(params);
  const router = useRouter();
  
  const [collectionsData, setCollectionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isValidStore, setIsValidStore] = useState(false);

  // All hooks must be called in the same order every time
  useEffect(() => {
    setIsClient(true);
    setIsValidStore(isStoreSubdomain());
  }, []);

  useEffect(() => {
    if (isClient && isValidStore) {
      loadCollectionsData();
    }
  }, [subdomain, isClient, isValidStore]);

  const loadCollectionsData = async () => {
    try {
      setLoading(true);
      const data = await storefrontApi.getCategories(subdomain);
      setCollectionsData(data);
    } catch (error) {
      console.error('Error loading collections:', error);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push(`/${subdomain}`);
  };

  const handleViewCollection = (category) => {
    router.push(`/${subdomain}/collections/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleViewProducts = () => {
    router.push(`/${subdomain}/products`);
  };

  // Conditional rendering instead of early returns
  if (!isClient) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isValidStore) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h1>404</h1>
        <p>Collections page not found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StoreHeader storeId={subdomain} />
      
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Back Button */}
        <Button
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={handleBackToHome}
          sx={{ mb: 4 }}
        >
          Back to Home
        </Button>

        {/* Page Header */}
        <Stack spacing={3} sx={{ mb: 6, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, mx: 'auto' }}>
            <Iconify icon="eva:grid-fill" width={40} />
          </Avatar>
          
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Our Collections
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Discover our carefully curated collections of products, each designed to meet your specific needs and style.
          </Typography>
        </Stack>

        {/* Collections Grid */}
        <Grid container spacing={4}>
          {collectionsData && collectionsData.length > 0 ? (
            collectionsData.map((collection) => (
              <Grid item xs={12} sm={6} md={4} key={collection.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  {/* Collection Image */}
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      bgcolor: 'background.neutral',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {collection.image_url ? (
                      <Box
                        component="img"
                        src={collection.image_url}
                        alt={collection.name}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Iconify icon="eva:image-fill" sx={{ fontSize: 48, color: 'text.disabled' }} />
                    )}
                    
                    {/* Collection Badge */}
                    <Chip
                      label="Collection"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </CardMedia>

                  {/* Collection Content */}
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {collection.name}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        lineHeight: 1.6,
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {collection.description || 'Explore our curated selection of products in this collection.'}
                    </Typography>
                  </CardContent>

                  {/* Collection Actions */}
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleViewCollection(collection)}
                      sx={{ borderRadius: 2 }}
                    >
                      View Collection
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Card sx={{ p: 6, textAlign: 'center' }}>
                <Iconify icon="eva:grid-fill" sx={{ fontSize: 64, color: 'text.disabled', mb: 3 }} />
                <Typography variant="h5" sx={{ color: 'text.secondary', mb: 2 }}>
                  No Collections Available
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.disabled', mb: 4 }}>
                  Collections are being prepared. Check back soon for our curated product categories.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="eva:shopping-bag-fill" />}
                  onClick={handleViewProducts}
                  sx={{ borderRadius: 2 }}
                >
                  View All Products
                </Button>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Call to Action */}
        <Card sx={{ p: 4, mt: 6, bgcolor: 'primary.lighter' }}>
          <Stack spacing={3} sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto' }}>
              <Iconify icon="eva:shopping-bag-fill" width={30} />
            </Avatar>
            
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Can't find what you're looking for?
            </Typography>
            
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
              Browse our complete product catalog to discover all available items.
            </Typography>
            
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:shopping-bag-fill" />}
                onClick={handleViewProducts}
                sx={{ borderRadius: 2 }}
              >
                View All Products
              </Button>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={handleBackToHome}
                sx={{ borderRadius: 2 }}
              >
                Back to Home
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Container>

      <StoreFooter storeId={subdomain} />
    </Box>
  );
}
