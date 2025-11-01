'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import { isStoreSubdomain } from 'src/utils/subdomain';
import { StoreHeader } from 'src/components/store-header';
import { StoreFooter } from 'src/components/store-footer';
import { Iconify } from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';
import { fCurrencyPHPSymbol } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function OrderConfirmationPage({ params }) {
  const { subdomain } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch order data from API using order ID from URL params
    const orderId = searchParams.get('orderId');
    
    // For now, get from localStorage or context
    const storedOrder = localStorage.getItem('lastOrder');
    
    if (storedOrder) {
      try {
        setOrderData(JSON.parse(storedOrder));
      } catch (e) {
        console.error('Error parsing stored order:', e);
      }
    } else {
      // Mock order data if nothing is stored
      setOrderData({
        orderId: orderId || `ORD-${Date.now()}`,
        items: [],
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        customerInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
        },
        paymentMethod: 'qrph',
        shippingMethod: 'standard',
      });
    }
    
    setLoading(false);
  }, [searchParams]);

  if (!isStoreSubdomain()) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <h1>404</h1>
        <p>Order confirmation page not found</p>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
        <StoreHeader storeId={subdomain} />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh'
        }}>
          <Typography>Loading order details...</Typography>
        </Box>
        <StoreFooter storeId={subdomain} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh' }}>
      <StoreHeader storeId={subdomain} />
      
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Success Icon and Title */}
        <Stack spacing={3} alignItems="center" sx={{ mb: 4 }}>
          <Box
            sx={{
              width: { xs: 80, md: 100 },
              height: { xs: 80, md: 100 },
              borderRadius: '50%',
              bgcolor: 'success.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify 
              icon="eva:checkmark-circle-2-fill" 
              sx={{ 
                color: 'success.main', 
                width: { xs: 48, md: 60 }, 
                height: { xs: 48, md: 60 } 
              }} 
            />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center' }}>
            Order Confirmed!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 500 }}>
            Thank you for your purchase. Your order has been received and is being processed.
          </Typography>
        </Stack>

        {/* Order Details Card */}
        <Card sx={{ p: { xs: 3, md: 4 }, mb: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Order Number
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {orderData?.orderId || 'N/A'}
              </Typography>
            </Box>

            <Divider />

            {/* Order Items */}
            {orderData?.items && orderData.items.length > 0 ? (
              <>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Order Items
                  </Typography>
                  <Stack spacing={2}>
                    {orderData.items.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                        {item.image && (
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.name}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1,
                              bgcolor: 'grey.100',
                            }}
                          />
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          {item.variant && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {item.variant}
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            Quantity: {item.quantity} × {fCurrencyPHPSymbol(item.price || 0)}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {fCurrencyPHPSymbol((item.price || 0) * (item.quantity || 1))}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
                <Divider />
              </>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No items in this order.
              </Typography>
            )}

            {/* Order Summary */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Order Summary
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Subtotal
                  </Typography>
                  <Typography variant="body2">
                    {fCurrencyPHPSymbol(orderData?.subtotal || 0)}
                  </Typography>
                </Box>
                {orderData?.shipping > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Shipping
                    </Typography>
                    <Typography variant="body2">
                      {fCurrencyPHPSymbol(orderData.shipping || 0)}
                    </Typography>
                  </Box>
                )}
                {orderData?.tax > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Tax
                    </Typography>
                    <Typography variant="body2">
                      {fCurrencyPHPSymbol(orderData.tax || 0)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Total
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {fCurrencyPHPSymbol(orderData?.total || 0)}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {orderData?.customerInfo && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Shipping Address
                  </Typography>
                  <Typography variant="body2">
                    {orderData.customerInfo.firstName} {orderData.customerInfo.lastName}
                  </Typography>
                  <Typography variant="body2">
                    {orderData.customerInfo.address}
                  </Typography>
                  <Typography variant="body2">
                    {orderData.customerInfo.city}, {orderData.customerInfo.state} {orderData.customerInfo.zipCode}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {orderData.customerInfo.phone}
                  </Typography>
                  <Typography variant="body2">
                    {orderData.customerInfo.email}
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        </Card>

        {/* Action Buttons */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ justifyContent: 'center' }}
        >
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push(`/${subdomain}/products`)}
            startIcon={<Iconify icon="eva:shopping-bag-fill" />}
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            Continue Shopping
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push(`/${subdomain}`)}
            startIcon={<Iconify icon="eva:home-fill" />}
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            Back to Home
          </Button>
        </Stack>

        {/* Additional Info */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            You will receive an email confirmation shortly with your order details and tracking information.
          </Typography>
        </Box>
      </Container>

      <StoreFooter storeId={subdomain} />
    </Box>
  );
}

