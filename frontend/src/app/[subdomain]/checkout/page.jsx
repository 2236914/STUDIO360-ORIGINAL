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
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
} from '@mui/material';

import { useRouter } from 'next/navigation';

import { isStoreSubdomain, getCurrentStoreId } from 'src/utils/subdomain';
import { calculateShippingOptions, getShippingRegion } from 'src/utils/shipping-calculator';
import { getShippingConfigForStore } from 'src/services/shippingConfigService';
import { useCheckoutContext } from 'src/sections/checkout/context';
import { CONFIG } from 'src/config-global';

import { StoreHeader } from 'src/components/store-header';
import { StoreFooter } from 'src/components/store-footer';
import { Iconify } from 'src/components/iconify';
import { QRPHPaymentDialog } from 'src/components/payment/qrph-payment-dialog';
import { GCashPaymentDialog } from 'src/components/payment/gcash-payment-dialog';
import { CardPaymentDialog } from 'src/components/payment/card-payment-dialog';

// ----------------------------------------------------------------------

export default function SubdomainCheckoutPage({ params }) {
  const { subdomain } = use(params);
  const router = useRouter();
  const checkout = useCheckoutContext();
  
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Philippines',
  });
  const [paymentMethod, setPaymentMethod] = useState('qrph');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isValidStore, setIsValidStore] = useState(false);
  
  // Shipping-related state
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [customerRegion, setCustomerRegion] = useState(null);
  const [shippingConfig, setShippingConfig] = useState(null);
  
  // Cart editing state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  
  // Payment dialog states
  const [qrphDialogOpen, setQrphDialogOpen] = useState(false);
  const [gcashDialogOpen, setGcashDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  
  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  // All hooks must be called in the same order every time
  useEffect(() => {
    setIsClient(true);
    setIsValidStore(isStoreSubdomain());
  }, []);

  useEffect(() => {
    if (isClient && isValidStore) {
      // Debug: Log cart data
      console.log('Cart items from context:', checkout.items);
      console.log('Cart subtotal from context:', checkout.subtotal);
      
      // Use real cart data from checkout context
      const realOrderData = {
        items: checkout.items || [],
        subtotal: checkout.subtotal || 0,
        shipping: 0, // Will be calculated based on shipping option
        tax: 0,
        total: checkout.subtotal || 0, // Will be updated when shipping is selected
      };
      setOrderData(realOrderData);
      
      // Load shipping configuration for this store
      const storeId = getCurrentStoreId() || subdomain;
      const config = getShippingConfigForStore(storeId);
      setShippingConfig(config);
    }
  }, [isClient, isValidStore, subdomain, checkout.items, checkout.subtotal]);

  // Calculate shipping options when customer address changes
  useEffect(() => {
    if (isClient && customerInfo.state && shippingConfig) {
      const region = getShippingRegion(customerInfo.state);
      setCustomerRegion(region);
      
      const options = calculateShippingOptions(
        customerInfo.state,
        customerInfo.city,
        shippingConfig,
        orderData.subtotal,
        getCurrentStoreId() || subdomain
      );
      
      setShippingOptions(options);
      
      // Auto-select cheapest option if available
      if (options.length > 0) {
        const cheapestOption = options.find(opt => opt.available !== false) || options[0];
        setSelectedShippingOption(cheapestOption);
        
        // Update order data with shipping cost
        setOrderData(prev => ({
          ...prev,
          shipping: cheapestOption.fee,
          total: prev.subtotal + cheapestOption.fee + prev.tax
        }));
      }
    } else {
      setShippingOptions([]);
      setSelectedShippingOption(null);
      setCustomerRegion(null);
    }
  }, [customerInfo.state, customerInfo.city, orderData.subtotal, shippingConfig, isClient, subdomain]);


  const handleInputChange = (field) => (event) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleShippingOptionChange = (option) => {
    setSelectedShippingOption(option);
    
    // Update order data with new shipping cost
    setOrderData(prev => ({
      ...prev,
      shipping: option.fee,
      total: prev.subtotal + option.fee + prev.tax
    }));
  };

  // Cart editing handlers
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleDeleteItem(itemId);
      return;
    }
    
    const updatedItems = orderData.items.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    const subtotal = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setOrderData(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      total: subtotal + prev.shipping + prev.tax
    }));
    
    // Update checkout context
    checkout.onUpdateField('items', updatedItems);
    checkout.onUpdateField('subtotal', subtotal);
  };

  const handleDeleteItem = (itemId) => {
    const updatedItems = orderData.items.filter(item => item.id !== itemId);
    const subtotal = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setOrderData(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      total: subtotal + prev.shipping + prev.tax
    }));
    
    // Update checkout context
    checkout.onUpdateField('items', updatedItems);
    checkout.onUpdateField('subtotal', subtotal);
  };

  const handleVariantChange = (itemId, variantType, newValue) => {
    const updatedItems = orderData.items.map(item => 
      item.id === itemId ? { ...item, [variantType]: newValue } : item
    );
    
    setOrderData(prev => ({
      ...prev,
      items: updatedItems
    }));
    
    // Update checkout context
    checkout.onUpdateField('items', updatedItems);
  };

  // Handle opening variant edit modal
  const handleEditVariants = (item) => {
    setSelectedItemForEdit(item);
    setShowVariantModal(true);
  };

  // Handle saving variant changes
  const handleSaveVariantChanges = (updatedItem) => {
    const updatedItems = orderData.items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    setOrderData(prev => ({
      ...prev,
      items: updatedItems
    }));
    
    // Update checkout context
    checkout.onUpdateField('items', updatedItems);
    
    // Close modal
    setShowVariantModal(false);
    setSelectedItemForEdit(null);
  };

  const handlePlaceOrder = () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    if (!selectedShippingOption) {
      alert('Please select a shipping method');
      return;
    }

    if (!customerInfo.state) {
      alert('Please enter your shipping address');
      return;
    }

    // Validate payment method for non-zero orders
    if (orderData.total > 0 && !paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    // Prepare order data for confirmation
    const orderItems = orderData.items.map((item) => ({
      id: item.id,
      name: item.name || item.title || `Item ${item.id}`,
      image: item.image || item.cover || item.thumbnail,
      quantity: item.quantity || 1,
      price: item.price || 0,
    }));

    const orderInput = {
      customer: {
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        email: customerInfo.email,
        phone: customerInfo.phone,
        avatar: '/assets/images/avatar/avatar_1.jpg',
      },
      items: orderItems.length,
      orderItems,
      price: orderData.total,
      status: orderData.total === 0 ? 'paid' : 'pending',
      delivery: {
        method: selectedShippingOption?.courierName || 'Standard',
        speed: selectedShippingOption?.estimatedDays ? `${selectedShippingOption.estimatedDays} days delivery` : '3-5 days delivery',
        trackingNo: '',
      },
      shipping: {
        address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}`,
        phone: customerInfo.phone,
      },
      payment: {
        method: orderData.total === 0 ? 'free' : paymentMethod,
      },
      summary: {
        subtotal: orderData.subtotal || 0,
        shipping: orderData.shipping || 0,
        discount: 0,
        taxes: orderData.tax || 0,
        total: orderData.total || 0,
      },
    };

    // Store order data and show confirmation dialog
    setPendingOrderData(orderInput);
    setConfirmDialogOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!pendingOrderData) return;

    setConfirmDialogOpen(false);
    setLoading(true);
    
    try {
      const orderInput = pendingOrderData;
      // Use subdomain as shop name (subdomain should match shop_name in shop_info table)
      const shopName = subdomain;
      
      // Log for debugging
      console.log(`[Checkout] Processing order for shop: "${shopName}"`);

      // If total is 0 (free order), create order and redirect
      if (orderData.total === 0) {
        // Save order locally
        try {
          const { addOrder } = await import('src/services/ordersLocalService');
          addOrder(orderInput);
        } catch (err) {
          console.warn('Could not save order locally:', err);
        }

        // Redirect to confirmation
        router.push(`/${subdomain}/order-confirmation`);
        return;
      }

      // Handle COD - create order in database
      if (paymentMethod === 'cod') {
        try {
          const API_BASE_URL = CONFIG.site.serverUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          
          // Format order data for database
          const orderDbData = {
            shopName: shopName,
            customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            customer_email: customerInfo.email,
            customer_phone: customerInfo.phone,
            shipping_address_line1: customerInfo.address,
            shipping_city: customerInfo.city,
            shipping_state: customerInfo.state,
            shipping_postal_code: customerInfo.zipCode,
            shipping_country: customerInfo.country || 'Philippines',
            payment_method: 'cod',
            payment_status: 'pending',
            status: 'pending',
            subtotal: orderData.subtotal || 0,
            shipping_fee: orderData.shipping || 0,
            tax: orderData.tax || 0,
            discount: 0,
            total: orderData.total || 0,
            shipping_method: selectedShippingOption?.courierName || 'Standard',
            items: orderInput.orderItems.map(item => ({
              product_name: item.name || 'Product',
              product_image_url: item.image || '',
              quantity: item.quantity || 1,
              unit_price: item.price || 0,
              subtotal: (item.price || 0) * (item.quantity || 1),
              total: (item.price || 0) * (item.quantity || 1),
            })),
          };

          const response = await fetch(`${API_BASE_URL}/api/orders/public`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderDbData),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create order');
          }

          // Also save locally for consistency
          try {
            const { addOrder } = await import('src/services/ordersLocalService');
            addOrder(orderInput);
          } catch (err) {
            console.warn('Could not save order locally:', err);
          }

          // Redirect to confirmation
          router.push(`/${subdomain}/order-confirmation`);
          return;
        } catch (error) {
          console.error('Error creating COD order:', error);
          alert(`Failed to create order: ${error.message || 'Please try again.'}`);
          setLoading(false);
          return;
        }
      }

      // For non-zero orders with payment methods, process payment
      if (['qrph', 'gcash', 'credit', 'card'].includes(paymentMethod)) {
        // Import Xendit payment service
        const xenditPaymentService = (await import('src/services/xenditPaymentService')).default;
        
        // Format payment data with shopName
        const paymentData = xenditPaymentService.formatPaymentData(
          orderInput,
          {
            firstName: customerInfo.firstName,
            lastName: customerInfo.lastName,
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            phone: customerInfo.phone,
            fullAddress: orderInput.shipping.address,
          },
          paymentMethod,
          shopName
        );

        // Save order locally first (before payment)
        try {
          const { addOrder } = await import('src/services/ordersLocalService');
          addOrder(orderInput);
        } catch (err) {
          console.warn('Could not save order locally:', err);
        }

        // Set payment data and open appropriate dialog
        setPaymentData(paymentData);
        setLoading(false); // Reset loading since payment dialog will handle its own state
        
        // Process payment based on method
        if (paymentMethod === 'qrph') {
          // Open QRPH payment dialog
          setQrphDialogOpen(true);
        } else if (paymentMethod === 'gcash') {
          // Open GCash payment dialog (it will handle redirect internally)
          setGcashDialogOpen(true);
        } else if (paymentMethod === 'credit' || paymentMethod === 'card') {
          // Open card payment dialog
          setCardDialogOpen(true);
        }
      } else {
        // Fallback for other payment methods
        try {
          const { addOrder } = await import('src/services/ordersLocalService');
          addOrder(orderInput);
        } catch (err) {
          console.warn('Could not save order locally:', err);
        }
        
        router.push(`/${subdomain}/order-confirmation`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error.message || 'Please try again.'}`);
      setLoading(false);
    }
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
        <p>Checkout page not found</p>
      </div>
    );
  }

  // Check if cart is empty
  if (checkout.items.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <StoreHeader storeId={subdomain} />
        
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Stack spacing={4} sx={{ textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, mx: 'auto' }}>
              <Iconify icon="eva:shopping-cart-fill" width={40} />
            </Avatar>
            
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Your cart is empty
            </Typography>
            
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Add some products to your cart before proceeding to checkout.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push(`/${subdomain}/products`)}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Continue Shopping
            </Button>
          </Stack>
        </Container>

        <StoreFooter storeId={subdomain} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StoreHeader storeId={subdomain} />
      
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Page Header */}
        <Stack spacing={2} sx={{ mb: 6, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto' }}>
            <Iconify icon="eva:shopping-cart-fill" width={30} />
          </Avatar>
          
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Checkout
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Complete your order securely
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {/* Customer Information */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Customer Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={customerInfo.firstName}
                    onChange={handleInputChange('firstName')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={customerInfo.lastName}
                    onChange={handleInputChange('lastName')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={customerInfo.email}
                    onChange={handleInputChange('email')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={customerInfo.phone}
                    onChange={handleInputChange('phone')}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={customerInfo.address}
                    onChange={handleInputChange('address')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    value={customerInfo.city}
                    onChange={handleInputChange('city')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State/Province"
                    value={customerInfo.state}
                    onChange={handleInputChange('state')}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    value={customerInfo.zipCode}
                    onChange={handleInputChange('zipCode')}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={customerInfo.country}
                      label="Country"
                      onChange={handleInputChange('country')}
                    >
                      <MenuItem value="Philippines">Philippines</MenuItem>
                      <MenuItem value="United States">United States</MenuItem>
                      <MenuItem value="Canada">Canada</MenuItem>
                      <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Card>

            {/* Shipping Method */}
            <Card sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Shipping Method
              </Typography>
              
              {customerRegion && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Shipping to: <strong>{customerInfo.state}</strong> ({customerRegion.replace('-', ' ').toUpperCase()})
                  </Typography>
                </Alert>
              )}
              
              {shippingOptions.length > 0 ? (
                <Stack spacing={2}>
                  {shippingOptions.map((option) => (
                    <Card
                      key={option.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: selectedShippingOption?.id === option.id ? 2 : 1,
                        borderColor: selectedShippingOption?.id === option.id ? 'primary.main' : 'divider',
                        bgcolor: selectedShippingOption?.id === option.id ? 'primary.50' : 'background.paper',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50',
                        },
                        opacity: option.disabled ? 0.6 : 1,
                      }}
                      onClick={() => !option.disabled && handleShippingOptionChange(option)}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {option.courierName}
                            </Typography>
                            {option.fee === 0 && (
                              <Chip label="FREE" color="success" size="small" />
                            )}
                            {option.disabled && (
                              <Chip label="Not Available" color="default" size="small" />
                            )}
                          </Stack>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            {option.description}
                          </Typography>
                          {option.minAmount && !option.available && (
                            <Typography variant="caption" sx={{ color: 'warning.main' }}>
                              Minimum order: ₱{option.minAmount.toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {option.fee === 0 ? 'FREE' : `₱${option.fee.toLocaleString()}`}
                        </Typography>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              ) : customerInfo.state ? (
                <Alert severity="warning">
                  <Typography variant="body2">
                    No shipping options available for {customerInfo.state}. Please contact the store for shipping arrangements.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="info">
                  <Typography variant="body2">
                    Please enter your shipping address to see available delivery options.
                  </Typography>
                </Alert>
              )}
            </Card>

            {/* Payment Method */}
            <Card sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Payment Method
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>Select Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Select Payment Method"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="qrph">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        component="img"
                        src="/assets/icons/payment/ic-qrph.svg"
                        alt="QRPH"
                        sx={{ width: 20, height: 20 }}
                      />
                      <Typography>QRPH</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="gcash">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        component="img"
                        src="/assets/icons/payment/ic-gcash.svg"
                        alt="GCash"
                        sx={{ width: 20, height: 20 }}
                      />
                      <Typography>GCash</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="card">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify icon="eva:credit-card-fill" />
                      <Typography>Credit/Debit Card</Typography>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="cod">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Iconify icon="eva:credit-card-fill" />
                      <Typography>Cash on Delivery (COD)</Typography>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
              
              {paymentMethod === 'qrph' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Scan the QR code with your banking or e-wallet app to complete payment instantly.
                </Alert>
              )}
              
              {paymentMethod === 'gcash' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Pay securely using your GCash wallet. You'll be redirected to GCash to complete the payment.
                </Alert>
              )}
              
              {paymentMethod === 'card' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Pay securely with your credit or debit card. We accept Visa, Mastercard, and other major cards.
                </Alert>
              )}
              
              {paymentMethod === 'cod' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Pay with cash when your order is delivered. Additional ₱50 COD fee applies.
                </Alert>
              )}
            </Card>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 4, position: 'sticky', top: 24 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Order Summary
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => router.push(`/${subdomain}/products`)}
                  startIcon={<Iconify icon="eva:edit-fill" />}
                >
                  Edit Cart
                </Button>
              </Stack>
              
              {/* Order Items */}
              <Stack spacing={2} sx={{ mb: 3 }}>
                {orderData.items.map((item) => (
                  <Card key={item.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={item.image}
                        alt={item.name}
                        sx={{ width: 60, height: 60 }}
                      >
                        <Iconify icon="eva:image-fill" />
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {item.name}
                        </Typography>
                        
                        {/* Variant Selection */}
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          {item.colors && item.colors.length > 1 && (
                            <FormControl size="small" sx={{ minWidth: 80 }}>
                              <Select
                                value={item.selectedColor || item.colors[0]}
                                onChange={(e) => handleVariantChange(item.id, 'selectedColor', e.target.value)}
                                displayEmpty
                              >
                                {item.colors.map((color) => (
                                  <MenuItem key={color} value={color}>
                                    {color}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                          
                          {item.sizes && item.sizes.length > 1 && (
                            <FormControl size="small" sx={{ minWidth: 80 }}>
                              <Select
                                value={item.selectedSize || item.sizes[0]}
                                onChange={(e) => handleVariantChange(item.id, 'selectedSize', e.target.value)}
                                displayEmpty
                              >
                                {item.sizes.map((size) => (
                                  <MenuItem key={size} value={size}>
                                    {size}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </Stack>
                        
                        {/* Quantity Controls */}
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            sx={{ minWidth: 32, height: 32 }}
                          >
                            -
                          </Button>
                          <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            sx={{ minWidth: 32, height: 32 }}
                          >
                            +
                          </Button>
                        </Stack>
                      </Box>
                      
                      <Stack alignItems="flex-end" spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          ₱{(item.price * item.quantity).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          ₱{item.price.toLocaleString()} each
                        </Typography>
                        
                        {/* Action Buttons */}
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEditVariants(item)}
                            sx={{ minWidth: 'auto', p: 0.5 }}
                          >
                            <Iconify icon="eva:edit-fill" width={16} />
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteItem(item.id)}
                            sx={{ minWidth: 'auto', p: 0.5 }}
                          >
                            <Iconify icon="eva:trash-2-outline" width={16} />
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Order Totals */}
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">₱{orderData.subtotal.toLocaleString()}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">
                    Shipping {selectedShippingOption && `(${selectedShippingOption.courierName})`}
                  </Typography>
                  <Typography variant="body2">
                    {orderData.shipping === 0 ? 'FREE' : `₱${orderData.shipping.toLocaleString()}`}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Tax</Typography>
                  <Typography variant="body2">₱{orderData.tax.toLocaleString()}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ₱{orderData.total.toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>
              
              {/* Terms and Conditions */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    I agree to the{' '}
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => router.push(`/${subdomain}/terms`)}
                      sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                    >
                      Terms and Conditions
                    </Button>
                  </Typography>
                }
                sx={{ mb: 3 }}
              />
              
              {/* Place Order Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePlaceOrder}
                disabled={loading || !agreedToTerms || !selectedShippingOption}
                sx={{ borderRadius: 2 }}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <StoreFooter storeId={subdomain} />

      {/* Payment Dialogs */}
      {paymentData && (
        <>
          <QRPHPaymentDialog
            open={qrphDialogOpen}
            onClose={() => {
              setQrphDialogOpen(false);
              setPaymentData(null);
            }}
            paymentData={paymentData}
            onSuccess={(paymentResult) => {
              console.log('QRPH Payment successful:', paymentResult);
              setQrphDialogOpen(false);
              setPaymentData(null);
              router.push(`/${subdomain}/order-confirmation`);
            }}
            onError={(error) => {
              console.error('QRPH Payment error:', error);
              alert(`Payment failed: ${error}`);
            }}
          />
          
          <GCashPaymentDialog
            open={gcashDialogOpen}
            onClose={() => {
              setGcashDialogOpen(false);
              setPaymentData(null);
            }}
            paymentData={paymentData}
            onSuccess={(paymentResult) => {
              console.log('GCash Payment successful:', paymentResult);
              setGcashDialogOpen(false);
              setPaymentData(null);
              router.push(`/${subdomain}/order-confirmation`);
            }}
            onError={(error) => {
              console.error('GCash Payment error:', error);
              alert(`Payment failed: ${error}`);
            }}
          />
          
          <CardPaymentDialog
            open={cardDialogOpen}
            onClose={() => {
              setCardDialogOpen(false);
              setPaymentData(null);
            }}
            paymentData={paymentData}
            onSuccess={(paymentResult) => {
              console.log('Card Payment successful:', paymentResult);
              setCardDialogOpen(false);
              setPaymentData(null);
              router.push(`/${subdomain}/order-confirmation`);
            }}
            onError={(error) => {
              console.error('Card Payment error:', error);
              alert(`Payment failed: ${error}`);
            }}
          />
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Confirm Order
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {pendingOrderData && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Please review your order details before confirming.
              </Typography>
              
              <Divider />
              
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Items:</Typography>
                  <Typography variant="body2">{pendingOrderData.orderItems.length}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Subtotal:</Typography>
                  <Typography variant="body2">₱{orderData.subtotal.toLocaleString()}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Shipping:</Typography>
                  <Typography variant="body2">₱{orderData.shipping.toLocaleString()}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Total:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>₱{orderData.total.toLocaleString()}</Typography>
                </Stack>
              </Stack>
              
              <Divider />
              
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Shipping to: {customerInfo.address}, {customerInfo.city}, {customerInfo.state}
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Payment method: {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleConfirmOrder}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Variant Edit Modal */}
      <Dialog 
        open={showVariantModal} 
        onClose={() => setShowVariantModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Edit Product Variants
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {selectedItemForEdit && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              {/* Product Info */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={selectedItemForEdit.image}
                  alt={selectedItemForEdit.name}
                  sx={{ width: 60, height: 60 }}
                >
                  <Iconify icon="eva:image-fill" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {selectedItemForEdit.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    ₱{selectedItemForEdit.price.toLocaleString()} each
                  </Typography>
                </Box>
              </Stack>

              {/* Color Selection */}
              {selectedItemForEdit.colors && selectedItemForEdit.colors.length > 1 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Color
                  </Typography>
                  <RadioGroup
                    value={selectedItemForEdit.selectedColor || selectedItemForEdit.colors[0]}
                    onChange={(e) => {
                      setSelectedItemForEdit(prev => ({
                        ...prev,
                        selectedColor: e.target.value
                      }));
                    }}
                  >
                    {selectedItemForEdit.colors.map((color) => (
                      <FormControlLabel
                        key={color}
                        value={color}
                        control={<Radio />}
                        label={color}
                      />
                    ))}
                  </RadioGroup>
                </Box>
              )}

              {/* Size Selection */}
              {selectedItemForEdit.sizes && selectedItemForEdit.sizes.length > 1 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Size
                  </Typography>
                  <RadioGroup
                    value={selectedItemForEdit.selectedSize || selectedItemForEdit.sizes[0]}
                    onChange={(e) => {
                      setSelectedItemForEdit(prev => ({
                        ...prev,
                        selectedSize: e.target.value
                      }));
                    }}
                  >
                    {selectedItemForEdit.sizes.map((size) => (
                      <FormControlLabel
                        key={size}
                        value={size}
                        control={<Radio />}
                        label={size}
                      />
                    ))}
                  </RadioGroup>
                </Box>
              )}

              {/* Quantity */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Quantity
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedItemForEdit(prev => ({
                        ...prev,
                        quantity: Math.max(1, prev.quantity - 1)
                      }));
                    }}
                  >
                    -
                  </Button>
                  <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                    {selectedItemForEdit.quantity}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedItemForEdit(prev => ({
                        ...prev,
                        quantity: prev.quantity + 1
                      }));
                    }}
                  >
                    +
                  </Button>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowVariantModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => handleSaveVariantChanges(selectedItemForEdit)}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
