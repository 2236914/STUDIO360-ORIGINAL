# API Documentation

This section contains comprehensive documentation for the STUDIO360 API endpoints.

## 🔐 Authentication

All API endpoints require authentication using JWT tokens.

### Headers Required
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### AI Bookkeeper
- `POST /api/ai/upload` - Upload files for OCR processing
- `POST /api/ai/categorize` - Categorize transactions
- `GET /api/ai/categories` - Get available categories
- `GET /api/ai/logs` - Get categorization logs

### Invoice Management
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `POST /api/invoices/:id/pdf` - Generate PDF

### Bookkeeping
- `GET /api/bookkeeping/journal` - Get general journal
- `GET /api/bookkeeping/ledger` - Get general ledger
- `POST /api/bookkeeping/transactions` - Add transaction
- `GET /api/bookkeeping/reports` - Get financial reports

### Tax Calculator
- `POST /api/tax/calculate` - Calculate taxes
- `GET /api/tax/rates` - Get tax rates
- `GET /api/tax/history` - Get calculation history

## 📊 Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation successful",
  "timestamp": "2024-12-04T18:30:00Z"
}
```

## 🚨 Error Handling

Error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Email is required"
    }
  },
  "timestamp": "2024-12-04T18:30:00Z"
}
```

## 📝 Detailed Endpoint Documentation

- [Authentication Endpoints](./auth.md)
- [AI Bookkeeper Endpoints](./ai-bookkeeper.md)
- [Invoice Endpoints](./invoice.md)
- [Bookkeeping Endpoints](./bookkeeping.md)
- [Tax Calculator Endpoints](./tax-calculator.md)

## 🔧 Testing

Use the provided Postman collection or curl examples in each endpoint documentation.

---

**Base URL**: `https://api.studio360.com/v1`  
**Version**: 1.0.0 