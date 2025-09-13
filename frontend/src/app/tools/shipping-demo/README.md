# Dynamic Shipping Calculator Implementation

## Overview

This implementation connects the seller's shipping configuration (from `/dashboard/account/`) with the customer checkout experience, automatically calculating delivery fees based on the customer's address and the seller's regional shipping rates.

## How It Works

### 1. **Seller Configuration** (`/dashboard/account/`)
- Sellers configure their available couriers (JNT Express, SPX, LBC, etc.)
- Set up shipping types and rates for different regions:
  - Metro Manila
  - Luzon (Outside Metro Manila)
  - Visayas
  - Mindanao
  - Island Provinces

### 2. **Customer Address Selection** (`/checkout/`)
- Customer fills out delivery address using Philippine address hierarchy
- Province → City/Municipality → Barangay selection
- Real-time address validation and preview

### 3. **Automatic Shipping Calculation**
- System determines customer's shipping region based on selected province
- Filters available couriers and rates for that specific region
- Automatically selects the cheapest available option
- Updates delivery options in real-time as address changes

### 4. **Regional Mapping System**
The `shipping-calculator.js` utility includes comprehensive regional mapping:

```javascript
// Example regions
METRO_MANILA_PROVINCES = ['METRO MANILA']
LUZON_PROVINCES = ['BATANGAS', 'CAVITE', 'LAGUNA', 'RIZAL', ...]
VISAYAS_PROVINCES = ['ILOILO', 'CEBU', 'BOHOL', ...]
MINDANAO_PROVINCES = ['DAVAO DEL NORTE', 'DAVAO DEL SUR', ...]
ISLAND_PROVINCES = ['PALAWAN', 'BATANES', ...]
```

## Integration Points

### Frontend Components
- `DeliveryAddressForm` - Customer address input
- `CheckoutDelivery` - Dynamic delivery options display
- `shipping-calculator.js` - Core logic for rate calculation
- `CheckoutAddressPayment` - Main checkout integration

### Data Flow
1. Customer selects province → triggers region detection
2. Region detection → queries seller's shipping config
3. Available options → filters by region and active status
4. Price calculation → sorts by cheapest first
5. Auto-selection → updates checkout total

## Configuration Structure

### Seller Shipping Config
```javascript
{
  couriers: [
    {
      id: '1',
      name: 'JNT Express',
      active: true,
      shippingTypes: [
        { region: 'metro-manila', fee: 120.00, active: true, description: '1-2 days' },
        { region: 'luzon', fee: 150.00, active: true, description: '2-3 days' }
      ]
    }
  ]
}
```

### Customer Address Format
```javascript
{
  street: "123 Sample Street",
  province: "BATANGAS",
  city: "LIPA CITY", 
  barangay: "POBLACION",
  zipCode: "4217",
  additionalInfo: "Near the mall"
}
```

## Benefits

✅ **Automated Pricing** - No manual rate calculation needed
✅ **Real-time Updates** - Rates change instantly with address
✅ **Regional Accuracy** - Proper Philippine shipping regions
✅ **Seller Control** - Full control over couriers and rates
✅ **Customer Experience** - Clear, transparent shipping costs
✅ **Scalable** - Easy to add new regions/couriers

## Usage Examples

### In Checkout Page
The system automatically calculates shipping when customer enters address:

```jsx
// Customer selects: Province: BATANGAS, City: LIPA CITY
// System detects: Region = 'luzon'
// Available options: JNT Express (₱150), SPX (₱180)
// Auto-selects: JNT Express (cheapest)
```

### In Account Management
Sellers can configure their shipping options:

```jsx
// Seller adds: JNT Express for Visayas region at ₱200
// Affects: All customers shipping to Visayas provinces
// Updates: Checkout options in real-time
```

## Demo

Visit `/tools/shipping-demo` to see:
- Live seller configuration display
- Customer address form with real-time shipping calculation
- Complete order summary with regional detection
- Interactive demonstration of the entire flow

This implementation ensures that delivery fees are always accurate, transparent, and automatically calculated based on the customer's actual location and the seller's current shipping configuration.
