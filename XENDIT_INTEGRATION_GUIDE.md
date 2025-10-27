# Xendit Payment Integration Setup Guide

This guide will help you set up Xendit payment integration for QRPH, GCash, and Credit/Debit card payments in your Studio360 application.

## Prerequisites

1. **Xendit Account**: Sign up at [xendit.co](https://xendit.co)
2. **API Keys**: Get your secret key and webhook token from Xendit Dashboard
3. **Payment Methods**: Activate QRPH, GCash, and Card payments in your Xendit account

## Backend Setup

### 1. Environment Variables

Add the following variables to your `backend/.env` file:

```env
# Xendit Payment Gateway
XENDIT_SECRET_KEY=your-xendit-secret-key
XENDIT_WEBHOOK_TOKEN=your-xendit-webhook-token
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

### 2. Database Migration

Run the database migration to create the Xendit payments table:

```sql
-- Run the migration file
database/migrations/2025-01-22_xendit_payments.sql
```

### 3. Install Dependencies

The Xendit service uses `axios` which should already be installed. If not:

```bash
cd backend
npm install axios
```

### 4. API Endpoints

The following endpoints are now available:

- `POST /api/payments/xendit/qrph` - Create QRPH payment
- `POST /api/payments/xendit/gcash` - Create GCash payment  
- `POST /api/payments/xendit/card` - Create card payment
- `POST /api/payments/xendit/card-token` - Create card token
- `GET /api/payments/xendit/status/:externalId` - Get payment status
- `POST /api/payments/xendit/callback` - Webhook handler

## Frontend Setup

### 1. Environment Variables

Add to your `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Payment Components

The following components are available:

- `QRPHPaymentDialog` - QRPH payment dialog
- `GCashPaymentDialog` - GCash payment dialog  
- `CardPaymentDialog` - Credit/debit card payment dialog

### 3. Service Integration

Use the `xenditPaymentService` to process payments:

```javascript
import xenditPaymentService from 'src/services/xenditPaymentService';

// Create QRPH payment
const result = await xenditPaymentService.createQRPHPayment(paymentData);

// Create GCash payment
const result = await xenditPaymentService.createGCashPayment(paymentData);

// Create card payment
const result = await xenditPaymentService.createCardPayment(paymentData);
```

## Payment Flow

### QRPH Payment Flow

1. Customer selects QRPH payment method
2. System creates QRPH payment via Xendit API
3. QR code is displayed to customer
4. Customer scans QR code with banking/e-wallet app
5. Payment is processed by Xendit
6. Webhook updates payment status
7. Order status is updated to "paid"

### GCash Payment Flow

1. Customer selects GCash payment method
2. System creates GCash payment via Xendit API
3. Customer is redirected to GCash app/web
4. Customer completes payment in GCash
5. Payment is processed by Xendit
6. Webhook updates payment status
7. Order status is updated to "paid"

### Card Payment Flow

1. Customer selects card payment method
2. Customer enters card details
3. System creates card token via Xendit API
4. System processes payment with token
5. Payment is processed by Xendit
6. Webhook updates payment status
7. Order status is updated to "paid"

## Webhook Configuration

### 1. Xendit Dashboard Setup

1. Go to Xendit Dashboard > Settings > Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payments/xendit/callback`
3. Select events: `payment.paid`, `payment.failed`, `payment.expired`
4. Copy the webhook token to your environment variables

### 2. Webhook Security

The webhook handler verifies signatures using the webhook token:

```javascript
const signature = req.headers['x-xendit-signature'];
const isValid = xenditService.verifyWebhookSignature(signature, payload);
```

## Testing

### 1. Sandbox Testing

Use Xendit's sandbox environment for testing:

- Sandbox API URL: `https://api.xendit.co` (same as production)
- Use sandbox API keys
- Test with sandbox payment methods

### 2. Test Cards

For card testing, use Xendit's test card numbers:

- Visa: `4000000000000002`
- Mastercard: `5200000000000007`
- CVV: Any 3-digit number
- Expiry: Any future date

### 3. Test QRPH/GCash

- QRPH: Use Xendit's test QR codes
- GCash: Use Xendit's test GCash accounts

## Production Deployment

### 1. Environment Variables

Update production environment variables:

```env
XENDIT_SECRET_KEY=your-production-secret-key
XENDIT_WEBHOOK_TOKEN=your-production-webhook-token
BACKEND_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Webhook URL

Update webhook URL in Xendit Dashboard to your production domain:

```
https://your-backend-domain.com/api/payments/xendit/callback
```

### 3. SSL Certificate

Ensure your production domain has a valid SSL certificate for webhook security.

## Error Handling

### Common Errors

1. **Invalid API Key**: Check your Xendit secret key
2. **Webhook Verification Failed**: Check webhook token
3. **Payment Failed**: Check payment method activation
4. **Card Token Creation Failed**: Check card details format

### Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Security Considerations

1. **API Keys**: Never expose secret keys in frontend code
2. **Webhook Security**: Always verify webhook signatures
3. **Card Data**: Never store card details, use tokens only
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: Validate all payment data

## Monitoring

### 1. Payment Status Tracking

Monitor payment statuses in your database:

```sql
SELECT status, COUNT(*) 
FROM xendit_payments 
GROUP BY status;
```

### 2. Webhook Logs

Monitor webhook processing in your server logs.

### 3. Xendit Dashboard

Use Xendit Dashboard to monitor:
- Payment success rates
- Failed payments
- Webhook delivery status

## Support

- **Xendit Documentation**: [docs.xendit.co](https://docs.xendit.co)
- **Xendit Support**: Contact through Xendit Dashboard
- **Studio360 Issues**: Create GitHub issues for integration problems

## Files Created/Modified

### Backend Files
- `backend/services/xenditService.js` - Xendit service
- `backend/api/payments/xendit.routes.js` - Payment API routes
- `backend/server.js` - Added Xendit routes
- `backend/env.example` - Added Xendit environment variables
- `database/migrations/2025-01-22_xendit_payments.sql` - Database schema

### Frontend Files
- `frontend/src/services/xenditPaymentService.js` - Frontend service
- `frontend/src/components/payment/qrph-payment-dialog.jsx` - QRPH dialog
- `frontend/src/components/payment/gcash-payment-dialog.jsx` - GCash dialog
- `frontend/src/components/payment/card-payment-dialog.jsx` - Card dialog
- `frontend/src/sections/checkout/checkout-payment-xendit.jsx` - Enhanced checkout
- `frontend/src/app/[subdomain]/checkout/page.jsx` - Updated subdomain checkout

## Next Steps

1. Set up your Xendit account and get API keys
2. Configure environment variables
3. Run database migration
4. Test payment flows in sandbox
5. Deploy to production
6. Configure production webhooks
7. Monitor payment processing

Your Studio360 application now supports QRPH, GCash, and Credit/Debit card payments through Xendit!
