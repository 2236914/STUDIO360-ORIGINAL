# Delivery Address Form Component

A comprehensive and reusable delivery address form component designed specifically for Philippine addresses with proper hierarchical structure.

## Features

- ✅ **Philippine Address Hierarchy**: Province → City/Municipality → Barangay cascading dropdowns
- ✅ **Real-time Validation**: Form validation with helpful error messages
- ✅ **Address Preview**: Live preview of the complete address
- ✅ **Responsive Design**: Works seamlessly on all device sizes
- ✅ **Dark Mode Support**: Compatible with the project's dark mode theme
- ✅ **Comprehensive Database**: 35+ provinces, 800+ cities, 2000+ barangays
- ✅ **Accessibility**: Full keyboard navigation and screen reader support

## Usage

### Basic Implementation

```jsx
import { DeliveryAddressForm } from 'src/components/delivery-address-form';

function MyComponent() {
  const handleAddressSubmit = (addressData) => {
    console.log('Address data:', addressData);
    // Handle the submitted address data
  };

  return (
    <DeliveryAddressForm 
      onSubmit={handleAddressSubmit}
      title="Delivery Address"
    />
  );
}
```

### With Default Values

```jsx
<DeliveryAddressForm 
  onSubmit={handleAddressSubmit}
  defaultValues={{
    street: '123 Sample Street',
    province: 'BATANGAS',
    city: 'LIPA CITY',
    barangay: 'POBLACION',
    zipCode: '4217',
    additionalInfo: 'Near the public market'
  }}
/>
```

### Customized Styling

```jsx
<DeliveryAddressForm 
  onSubmit={handleAddressSubmit}
  title="Shipping Address"
  showTitle={false}
  sx={{ 
    mb: 3,
    boxShadow: 2,
    borderRadius: 3 
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSubmit` | `function` | - | Callback function called when form is submitted with valid data |
| `defaultValues` | `object` | `{}` | Initial values for the form fields |
| `title` | `string` | `"Delivery Address"` | Title displayed in the card header |
| `showTitle` | `boolean` | `true` | Whether to show the card title |
| `sx` | `object` | - | Custom styling for the card container |

## Form Data Structure

The form returns the following data structure:

```javascript
{
  street: "123 Sample Street, Subdivision Name",
  province: "BATANGAS", 
  city: "LIPA CITY",
  barangay: "POBLACION",
  zipCode: "4217",
  additionalInfo: "Near the public market" // optional
}
```

## Field Details

### Street Address
- **Required**: Yes
- **Type**: Text input
- **Description**: House/building number, street name, subdivision
- **Placeholder**: "House number, street name, subdivision"

### Province
- **Required**: Yes
- **Type**: Select dropdown
- **Options**: All major Philippine provinces (35+ provinces)
- **Behavior**: Triggers city dropdown population

### City/Municipality
- **Required**: Yes
- **Type**: Select dropdown
- **Options**: Cities/municipalities within selected province
- **Behavior**: Enabled only after province selection, triggers barangay dropdown

### Barangay
- **Required**: Yes
- **Type**: Select dropdown
- **Options**: Barangays within selected city
- **Behavior**: Enabled only after city selection

### ZIP Code
- **Required**: Yes
- **Type**: Numeric input (4 digits)
- **Validation**: Must be exactly 4 digits
- **Input Mode**: Numeric keyboard on mobile devices

### Additional Info / Landmark
- **Required**: No
- **Type**: Text input
- **Description**: Optional landmarks or additional directions
- **Placeholder**: "e.g. Near SM Mall, Beside Church"

## Address Preview

The component includes a real-time address preview that shows:
- Complete formatted address as you type
- Landmark information (if provided)
- Updates automatically as fields are filled

## Form Validation

- **Client-side validation** using Zod schema
- **Real-time validation** with helpful error messages
- **Cascading validation** ensures proper hierarchy selection
- **Required field indicators** with clear error states

## Integration Examples

### In Checkout Flow

```jsx
import { DeliveryAddressForm } from 'src/components/delivery-address-form';

function CheckoutPage() {
  const handleAddressSubmit = (addressData) => {
    // Save to checkout context
    checkout.updateAddress(addressData);
    // Proceed to next step
    checkout.nextStep();
  };

  return (
    <DeliveryAddressForm 
      onSubmit={handleAddressSubmit}
      defaultValues={checkout.address}
    />
  );
}
```

### In User Profile

```jsx
function UserProfileForm() {
  const handleAddressSubmit = (addressData) => {
    // Update user profile
    updateUserProfile({ address: addressData });
  };

  return (
    <DeliveryAddressForm 
      onSubmit={handleAddressSubmit}
      title="Home Address"
      defaultValues={user.address}
    />
  );
}
```

### Standalone Usage

```jsx
import { DeliveryAddressExample } from 'src/components/delivery-address-form';

function AddressFormPage() {
  return <DeliveryAddressExample />;
}
```

## Technical Details

### Dependencies
- React Hook Form for form management
- Zod for validation
- Material-UI components for UI
- Philippine address database for location data

### Performance
- **Lazy loading**: Address data loaded only when needed
- **Optimized rendering**: Minimal re-renders with useWatch
- **Memory efficient**: Efficient data structures for address lookup

### Accessibility
- Full keyboard navigation support
- Screen reader compatible
- ARIA labels and descriptions
- Focus management for dropdown selections

## Philippine Address Database

The component uses a comprehensive Philippine address database including:

- **35+ Provinces**: Major provinces covering 90%+ of population
- **800+ Cities**: All major urban centers and municipalities  
- **2000+ Barangays**: Complete coverage for major cities
- **Updated Data**: Based on Philippine Statistics Authority (PSA)

### Geographic Coverage

- **Luzon**: 22 provinces including Metro Manila, CALABARZON, Central Luzon
- **Visayas**: 8 provinces including Western, Central, and Eastern Visayas
- **Mindanao**: 5 provinces covering major urban centers

## Styling & Theming

The component automatically adapts to your project's theme:

- **Light/Dark Mode**: Automatically switches based on theme
- **Material-UI Integration**: Uses theme colors and typography
- **Responsive Grid**: Adapts to different screen sizes
- **Consistent Spacing**: Follows Material-UI spacing guidelines

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for all screen sizes

## Migration from Existing Forms

If you have existing address forms, you can easily migrate:

1. Replace your current address fields with `<DeliveryAddressForm />`
2. Update your form handling to use the new data structure
3. Remove old address-related validation logic
4. Update any address display components to use the new format

```jsx
// Old way
<TextField name="address" />
<TextField name="city" />
<TextField name="province" />

// New way
<DeliveryAddressForm onSubmit={handleAddressSubmit} />
```
