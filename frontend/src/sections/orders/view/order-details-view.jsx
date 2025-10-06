'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

import { paths } from 'src/routes/paths';
import { getOrderById } from 'src/services/ordersLocalService';
import { useRouter as useRouterHook } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Fallback sample order (used if not found in storage)
const ORDER_DATA_FALLBACK = {
  id: '#6010',
  customer: {
    name: 'Jayvion Simon',
    email: 'nannie.abernathy70@yahoo.com',
    avatar: '/assets/images/avatar/avatar_1.jpg',
    ip: '192.158.1.38',
  },
  date: new Date('2025-08-06'),
  time: '4:07 pm',
  status: 'refunded',
  items: 6,
  price: 484.15,
  orderItems: [
    {
      id: '16H9UR0',
      name: 'Urban Explorer Sneakers',
      image: '/assets/images/products/sneakers-green.jpg',
      quantity: 1,
      price: 83.74,
    },
    {
      id: '16H9UR1',
      name: 'Classic Leather Loafers',
      image: '/assets/images/products/loafers-black.jpg',
      quantity: 2,
      price: 97.14,
    },
    {
      id: '16H9UR2',
      name: 'Mountain Trekking Boots',
      image: '/assets/images/products/boots-orange.jpg',
      quantity: 3,
      price: 68.71,
    },
  ],
  delivery: {
    method: 'DHL',
    speed: 'Standard',
    trackingNo: 'SPX037739199373',
  },
  shipping: {
    address: '19034 Verna Unions Apt. 164 -Honolulu, RI / 87535',
    phone: '365-374-4961',
  },
  payment: {
    cardNumber: '**** **** **** 5678',
    cardType: 'Mastercard',
  },
  summary: {
    subtotal: 484.15,
    shipping: -10,
    discount: -10,
    taxes: 10,
    total: 474.15,
  },
  history: [
    {
      id: 1,
      event: 'Delivery successful',
      time: '05 Aug 2025 3:07 pm',
      status: 'completed',
    },
    {
      id: 2,
      event: 'Transporting to [2]',
      time: '05 Aug 2025 2:30 pm',
      status: 'pending',
    },
    {
      id: 3,
      event: 'Transporting to [1]',
      time: '05 Aug 2025 1:45 pm',
      status: 'pending',
    },
    {
      id: 4,
      event: 'The shipping unit has picked up the goods',
      time: '05 Aug 2025 1:00 pm',
      status: 'pending',
    },
    {
      id: 5,
      event: 'Order has been created',
      time: '05 Aug 2025 12:30 pm',
      status: 'pending',
    },
  ],
  keyTimes: {
    orderTime: '05 Aug 2025 3:07 pm',
    paymentTime: '05 Aug 2025 3:07 pm',
    deliveryTime: '05 Aug 2025 3:07 pm',
    completionTime: '05 Aug 2025 3:07 pm',
  },
};

// ----------------------------------------------------------------------

export function OrderDetailsView() {
  const router = useRouterHook();
  const params = useParams();
  const orderId = params?.id || '#6010';

  const stored = getOrderById(orderId.toString());
  const ORDER_DATA = stored || ORDER_DATA_FALLBACK;

  const handleBack = useCallback(() => {
    router.push(paths.dashboard.orders.root);
  }, [router]);

  const handleEdit = useCallback(() => {
    console.log('Edit order:', orderId);
  }, [orderId]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleAddToBlacklist = useCallback(() => {
    console.log('Add customer to blacklist');
  }, []);

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
                        background: item.name.includes('Urban Explorer') ? 'linear-gradient(135deg, #4CAF50, #45a049)' :
                                 item.name.includes('Classic Leather') ? 'linear-gradient(135deg, #424242, #212121)' :
                                 item.name.includes('Mountain Trekking') ? 'linear-gradient(135deg, #FF9800, #F57C00)' :
                                 'linear-gradient(135deg, #BDBDBD, #9E9E9E)',
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
