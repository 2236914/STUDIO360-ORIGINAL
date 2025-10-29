'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter as useRouterHook } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { ordersApi } from 'src/services/ordersService';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function OrderDetailsView({ id: idProp, inDialog = false, onClose }) {
  const router = useRouterHook();
  const params = useParams();
  const orderId = idProp || params?.id || '#6010';

  const [ORDER_DATA, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load order from database
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const order = await ordersApi.getOrderByNumber(`#${orderId}`);
        
        if (!order) {
          toast.error('Order not found');
          return;
        }

        // Transform database data to match component format
        const transformedOrder = {
          id: order.order_number,
          date: order.order_date,
          time: fTime(order.order_date),
          customer: {
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone || '',
            avatarUrl: order.customer_avatar_url || '',
          },
          total: parseFloat(order.total || 0),
          subtotal: parseFloat(order.subtotal || 0),
          shippingFee: parseFloat(order.shipping_fee || 0),
          tax: parseFloat(order.tax || 0),
          discount: parseFloat(order.discount || 0),
          status: order.status,
          paymentStatus: order.payment_status,
          paymentMethod: order.payment_method,
          items: (order.order_items || []).map(item => ({
            id: item.id,
            name: item.product_name,
            sku: item.product_sku,
            quantity: item.quantity,
            price: parseFloat(item.unit_price || 0),
            total: parseFloat(item.total || 0),
            imageUrl: item.product_image_url,
          })),
          shippingAddress: order.shipping_address_line1 ? {
            line1: order.shipping_address_line1,
            line2: order.shipping_address_line2,
            city: order.shipping_city,
            state: order.shipping_state,
            postalCode: order.shipping_postal_code,
            country: order.shipping_country,
          } : null,
          trackingNumber: order.tracking_number,
          courier: order.courier,
          customerNotes: order.customer_notes,
        };

        setOrderData(transformedOrder);
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const handleBack = useCallback(() => {
    if (inDialog && typeof onClose === 'function') {
      onClose();
      return;
    }
    router.push(paths.dashboard.orders.root);
  }, [router, inDialog, onClose]);

  const handleEdit = useCallback(() => {
    console.log('Edit order:', orderId);
  }, [orderId]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleAddToBlacklist = useCallback(() => {
    console.log('Add customer to blacklist');
  }, []);

  // Show loading state
  if (loading) {
    return (
      <DashboardContent>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:arrow-back-fill" />
          </IconButton>
          <Typography variant="h4">Order Details</Typography>
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  // Show empty state if no order data
  if (!ORDER_DATA) {
    return (
      <DashboardContent>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:arrow-back-fill" />
          </IconButton>
          <Typography variant="h4">Order Details</Typography>
        </Stack>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Order not found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            The order you\'re looking for doesn\'t exist or has been removed.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleBack}
          >
            Back to Orders
          </Button>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={handleBack} sx={{ color: 'text.secondary' }}>
            <Iconify icon="eva:arrow-back-fill" />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              Order {ORDER_DATA.id}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Chip
                label={ORDER_DATA.status}
                size="small"
                color={ORDER_DATA.status === 'refunded' ? 'info' : 'default'}
                variant="soft"
              />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {fDate(ORDER_DATA.date, 'dd MMM yyyy')} {ORDER_DATA.time}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:printer-fill" />}
            onClick={handlePrint}
            sx={{ textTransform: 'none' }}
          >
            Print
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:edit-fill" />}
            onClick={handleEdit}
            sx={{ textTransform: 'none' }}
          >
            Edit
          </Button>
        </Stack>
      </Stack>

      {/* Print-only invoice format */}
      <Box
        sx={{
          display: 'none',
          '@media print': {
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            bgcolor: 'white',
            color: 'black',
            zIndex: 9999,
            p: 4,
            fontFamily: 'inherit',
          },
        }}
      >
        {/* Invoice Header */}
        <Box sx={{ mb: 4, borderBottom: '2px solid #000', pb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            INVOICE
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Studio360 - Order Management System
          </Typography>
        </Box>

        {/* Invoice Details */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Bill To:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
              {ORDER_DATA.customer.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {ORDER_DATA.shipping.address}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Phone: {ORDER_DATA.shipping.phone}
            </Typography>
            <Typography variant="body2">
              Email: {ORDER_DATA.customer.email}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Invoice #:</strong> {ORDER_DATA.id}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Date:</strong> {fDate(ORDER_DATA.date, 'dd MMM yyyy')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Time:</strong> {ORDER_DATA.time}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {ORDER_DATA.status.toUpperCase()}
            </Typography>
          </Box>
        </Box>

        {/* Items Table */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 2,
              p: 2,
              bgcolor: 'grey.100',
              border: '1px solid #000',
              fontWeight: 600,
            }}
          >
            <Typography variant="body2">Item</Typography>
            <Typography variant="body2">Quantity</Typography>
            <Typography variant="body2">Price</Typography>
            <Typography variant="body2">Total</Typography>
          </Box>
          
          {ORDER_DATA.orderItems.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: 2,
                p: 2,
                border: '1px solid #ddd',
                borderTop: 'none',
                '&:nth-of-type(even)': {
                  bgcolor: 'grey.50',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.name}
              </Typography>
              <Typography variant="body2">{item.quantity}</Typography>
              <Typography variant="body2">{fCurrency(item.price)}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {fCurrency(item.price * item.quantity)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Summary */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ width: 300 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2">{fCurrency(ORDER_DATA.summary.subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Shipping:</Typography>
              <Typography variant="body2" sx={{ color: 'error.main' }}>
                {fCurrency(ORDER_DATA.summary.shipping)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Discount:</Typography>
              <Typography variant="body2" sx={{ color: 'error.main' }}>
                {fCurrency(ORDER_DATA.summary.discount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Taxes:</Typography>
              <Typography variant="body2">{fCurrency(ORDER_DATA.summary.taxes)}</Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                pt: 1,
                borderTop: '2px solid #000',
                mt: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                TOTAL:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {fCurrency(ORDER_DATA.summary.total)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 6, pt: 2, borderTop: '1px solid #ddd', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Thank you for your business!
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* Order Details */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Details
              </Typography>
              
              <Stack spacing={2} sx={{ mb: 3 }}>
                {ORDER_DATA.orderItems.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #BDBDBD, #9E9E9E)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Iconify 
                        icon="eva:shopping-bag-fill"
                        width={28} 
                        sx={{ color: 'white' }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {item.id}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        x{item.quantity}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {fCurrency(item.price)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>

              {/* Order Summary */}
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Subtotal
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {fCurrency(ORDER_DATA.summary.subtotal)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Shipping
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
                    {fCurrency(ORDER_DATA.summary.shipping)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Discount
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
                    {fCurrency(ORDER_DATA.summary.discount)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Taxes
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {fCurrency(ORDER_DATA.summary.taxes)}
                  </Typography>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {fCurrency(ORDER_DATA.summary.total)}
                  </Typography>
                </Stack>
              </Stack>
            </Card>

            {/* Order History */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                History
              </Typography>
              <Grid container spacing={0} alignItems="flex-start">
                <Grid item xs={12} md={8}>
                  <Timeline sx={{ pl: 0, pr: 0, m: 0 }}>
                    {ORDER_DATA.history.map((event, index) => (
                      <TimelineItem key={event.id} sx={{ minHeight: 48, '&:before': { display: 'none' } }}>
                        <TimelineSeparator>
                          <TimelineDot 
                            color={event.status === 'completed' ? 'primary' : 'grey'} 
                            variant={event.status === 'completed' ? 'filled' : 'outlined'}
                            sx={{ ml: 0 }}
                          />
                          {index < ORDER_DATA.history.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent sx={{ pl: 1, py: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {event.event}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {event.time}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack spacing={2} sx={{ pl: { md: 2, xs: 0 } }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        Order time
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {ORDER_DATA.keyTimes.orderTime}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        Payment time
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {ORDER_DATA.keyTimes.paymentTime}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        Delivery time for the carrier
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {ORDER_DATA.keyTimes.deliveryTime}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        Completion time
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {ORDER_DATA.keyTimes.completionTime}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Customer Info */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Customer info
              </Typography>
              
              <Stack spacing={2} alignItems="center">
                <Avatar
                  src={ORDER_DATA.customer.avatar}
                  sx={{ width: 80, height: 80, mb: 1 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {ORDER_DATA.customer.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {ORDER_DATA.customer.email}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  IP: {ORDER_DATA.customer.ip}
                </Typography>
                <Button
                  variant="text"
                  color="error"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  onClick={handleAddToBlacklist}
                  sx={{ textTransform: 'none' }}
                >
                  + Add to Blacklist
                </Button>
              </Stack>
            </Card>

            {/* Delivery */}
            <Card sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Delivery
                </Typography>
                <IconButton size="small">
                  <Iconify icon="eva:edit-fill" width={16} />
                </IconButton>
              </Stack>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Ship by
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {ORDER_DATA.delivery.method}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Speedy
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {ORDER_DATA.delivery.speed}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Tracking No.
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500, 
                      color: 'primary.main',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    {ORDER_DATA.delivery.trackingNo}
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* Shipping */}
            <Card sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Shipping
                </Typography>
                <IconButton size="small">
                  <Iconify icon="eva:edit-fill" width={16} />
                </IconButton>
              </Stack>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {ORDER_DATA.shipping.address}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Phone
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {ORDER_DATA.shipping.phone}
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* Payment */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Payment
              </Typography>
              
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {ORDER_DATA.payment.cardNumber}
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 24,
                    bgcolor: 'orange',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                    MC
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
