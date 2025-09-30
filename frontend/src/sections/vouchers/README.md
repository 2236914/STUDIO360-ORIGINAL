# Voucher Management System

A comprehensive voucher management system for e-commerce applications, built with React and Material-UI.

## Features

### For Sellers (Dashboard)
- **Voucher CRUD Operations**: Create, read, update, and delete vouchers
- **Multiple Voucher Types**:
  - Percentage discount (e.g., 10% off)
  - Fixed amount discount (e.g., $20 off)
  - Free shipping
  - Buy X Get Y (coming soon)
- **Advanced Configuration**:
  - Minimum order amount requirements
  - Maximum discount limits
  - Usage limits (per voucher)
  - Validity periods (start and end dates)
  - Product/category restrictions
- **Voucher Statistics**: Real-time analytics and usage tracking
- **Status Management**: Active, inactive, expired, and used statuses
- **Bulk Operations**: Delete multiple vouchers at once

### For Buyers (Storefront)
- **Voucher Application**: Easy voucher code input and validation
- **Real-time Validation**: Instant feedback on voucher eligibility
- **Discount Calculation**: Automatic discount and shipping calculation
- **Usage Tracking**: Prevents duplicate usage and tracks limits

## Voucher Types

### 1. Percentage Discount
- Discounts a percentage of the order total
- Optional maximum discount amount
- Example: 10% off, max $20

### 2. Fixed Amount Discount
- Fixed dollar amount off the order
- Example: $20 off orders over $100

### 3. Free Shipping
- Removes shipping costs
- Can have minimum order requirements
- Example: Free shipping on orders over $50

### 4. Buy X Get Y (Future)
- Advanced promotional vouchers
- Example: Buy 2, get 1 free

## API Endpoints

### Voucher Management
- `GET /api/vouchers` - List vouchers with filtering and pagination
- `GET /api/vouchers/:id` - Get voucher details
- `POST /api/vouchers` - Create new voucher
- `PUT /api/vouchers/:id` - Update voucher
- `DELETE /api/vouchers/:id` - Delete voucher
- `POST /api/vouchers/:id/toggle-status` - Toggle voucher status

### Voucher Validation & Application
- `POST /api/vouchers/validate` - Validate voucher code for buyers
- `POST /api/vouchers/:id/apply` - Apply voucher (increment usage count)
- `GET /api/vouchers/stats/summary` - Get voucher statistics

## Components

### Dashboard Components
- `VoucherListView` - Main voucher listing with DataGrid
- `VoucherCreateView` - Create new voucher form
- `VoucherEditView` - Edit existing voucher
- `VoucherDetailsView` - Detailed voucher information
- `VoucherNewEditForm` - Reusable form component
- `VoucherStatsCard` - Statistics dashboard

### Storefront Components
- `VoucherApplication` - Voucher input and validation for buyers
- `useVoucherValidation` - Custom hook for voucher logic

### Table Components
- `VoucherTableToolbar` - Filtering and search toolbar
- `VoucherTableFiltersResult` - Active filters display
- Various cell renderers for different data types

## Usage Examples

### Creating a Voucher (Seller)
```jsx
// Navigate to create voucher page
router.push('/dashboard/vouchers/new');

// Fill out the form with:
// - Name: "Welcome Discount"
// - Type: "Percentage"
// - Value: 10
// - Min Order: $50
// - Max Discount: $20
// - Usage Limit: 100
// - Validity: 30 days
```

### Applying a Voucher (Buyer)
```jsx
import { VoucherApplication } from 'src/components/voucher-application';

function CheckoutPage() {
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  
  const handleVoucherApplied = (voucher) => {
    setAppliedVoucher(voucher);
    // Update order total with discount
  };

  return (
    <VoucherApplication
      onVoucherApplied={handleVoucherApplied}
      orderAmount={orderTotal}
      appliedVoucher={appliedVoucher}
      onRemoveVoucher={() => setAppliedVoucher(null)}
    />
  );
}
```

### Validating Vouchers Programmatically
```jsx
import { useVoucherValidation } from 'src/hooks/use-voucher-validation';

function MyComponent() {
  const { validateVoucher, loading } = useVoucherValidation();
  
  const handleValidate = async (code) => {
    try {
      const voucher = await validateVoucher(code, orderAmount);
      console.log('Valid voucher:', voucher);
    } catch (error) {
      console.error('Invalid voucher:', error.message);
    }
  };
}
```

## Sample Voucher Codes

For testing purposes, the following voucher codes are available:

- **WELCOME10**: 10% off, min $50 order, max $20 discount
- **SAVE20**: $20 off, min $100 order
- **FREESHIP**: Free shipping on any order
- **SUMMER25**: 25% off, min $75 order, max $50 discount

## Database Schema

```sql
CREATE TABLE vouchers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP,
  applicable_to VARCHAR(20) DEFAULT 'all',
  applicable_ids JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(50)
);
```

## Security Considerations

1. **Voucher Code Generation**: Uses secure random generation
2. **Usage Tracking**: Prevents duplicate usage and enforces limits
3. **Validation**: Server-side validation for all voucher operations
4. **Rate Limiting**: API endpoints are rate-limited
5. **Authentication**: All operations require proper authentication

## Future Enhancements

1. **Product/Category Restrictions**: Apply vouchers to specific products
2. **Customer Segments**: Target specific customer groups
3. **Bulk Voucher Generation**: Create multiple vouchers at once
4. **Voucher Analytics**: Detailed reporting and insights
5. **A/B Testing**: Test different voucher strategies
6. **Integration**: Connect with email marketing and CRM systems

## Troubleshooting

### Common Issues

1. **Voucher not applying**: Check minimum order amount and validity dates
2. **Usage limit exceeded**: Voucher has reached its maximum usage
3. **Invalid code**: Ensure code is entered correctly (case-sensitive)
4. **Expired voucher**: Check validity period

### Debug Mode

Enable debug logging by setting `VOUCHER_DEBUG=true` in environment variables.

## Contributing

When adding new voucher types or features:

1. Update the voucher schema
2. Add validation logic
3. Update the UI components
4. Add tests
5. Update documentation

## License

This voucher system is part of the STUDIO360 project and follows the same licensing terms.
