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
    const loadOrderData = async () => {
      try {
        // Try to get order data from localStorage first (set by checkout page)
        const storedOrder = localStorage.getItem('lastOrder');
        
        if (storedOrder) {
          try {
            const parsedOrder = JSON.parse(storedOrder);
            console.log('Loaded order from localStorage:', parsedOrder);
            
            // Verify we have real data (not mock)
            if (parsedOrder.orderId && parsedOrder.orderId !== 'N/A' && parsedOrder.items && parsedOrder.items.length > 0) {
              setOrderData(parsedOrder);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('Error parsing stored order:', e);
          }
        }
        
        // Try to fetch from API using order number from URL
        const orderNumber = searchParams.get('orderNumber') || searchParams.get('orderId');
        
        if (orderNumber) {
          console.log('Fetching order from API:', orderNumber);
          
          try {
            // Fetch order from API
            const response = await fetch(`/api/orders/public/${orderNumber}`);
            
            if (response.ok) {
              const result = await response.json();
              
              if (result.success && result.data) {
                const order = result.data;
                const formattedOrder = {
                  orderId: order.order_number || order.id,
                  items: (order.order_items || []).map(item => ({
                    name: item.product_name,
                    image: item.product_image_url,
                    price: parseFloat(item.unit_price || 0),
                    quantity: parseInt(item.quantity || 1, 10),
                    subtotal: parseFloat(item.subtotal || item.total || 0),
                  })),
                  subtotal: parseFloat(order.subtotal || 0),
                  shipping: parseFloat(order.shipping_fee || 0),
                  tax: parseFloat(order.tax || 0),
                  total: parseFloat(order.total || 0),
                  customerInfo: {
                    firstName: order.customer_name?.split(' ')[0] || '',
                    lastName: order.customer_name?.split(' ').slice(1).join(' ') || '',
                    email: order.customer_email || '',
                    phone: order.customer_phone || '',
                    address: order.shipping_address_line1 || '',
                    city: order.shipping_city || '',
                    state: order.shipping_state || '',
                    zipCode: order.shipping_postal_code || '',
                    country: order.shipping_country || 'Philippines',
                  },
                  paymentMethod: order.payment_method || 'unknown',
                  shippingMethod: order.shipping_method || 'Standard',
                };
                
                // Save to localStorage for future reference
                localStorage.setItem('lastOrder', JSON.stringify(formattedOrder));
                console.log('Order loaded from API:', formattedOrder);
                setOrderData(formattedOrder);
                setLoading(false);
                return;
              }
            }
          } catch (apiError) {
            console.error('Error fetching order from API:', apiError);
          }
        }
        
        // Fallback: Show what we have or empty state
        if (storedOrder) {
          try {
            const parsedOrder = JSON.parse(storedOrder);
            setOrderData(parsedOrder);
          } catch (e) {
            // Invalid data, show empty state
            setOrderData({
              orderId: orderNumber || 'N/A',
              items: [],
              subtotal: 0,
              shipping: 0,
              tax: 0,
              total: 0,
              customerInfo: null,
              paymentMethod: 'unknown',
              shippingMethod: 'unknown',
            });
          }
        } else {
          // No stored order - show empty state
          setOrderData({
            orderId: orderNumber || 'N/A',
            items: [],
            subtotal: 0,
            shipping: 0,
            tax: 0,
            total: 0,
            customerInfo: null,
            paymentMethod: 'unknown',
            shippingMethod: 'unknown',
          });
        }
      } catch (error) {
        console.error('Error loading order data:', error);
        setOrderData({
          orderId: 'N/A',
          items: [],
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
          customerInfo: null,
          paymentMethod: 'unknown',
          shippingMethod: 'unknown',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadOrderData();
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

