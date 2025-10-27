# Card Visibility Fix - Default vs High Contrast Mode

## Problem
In **default contrast mode**, cards had no visual separation:
- ❌ No border
- ❌ No shadow (`boxShadow: 'none'`)
- ❌ Cards blend into background
- ❌ Hard to distinguish content sections

But in **high contrast mode**, cards were clearly visible:
- ✅ Strong shadow
- ✅ Clear borders
- ✅ Excellent visual separation

## Solution

### Default Mode (Now Fixed)
Cards now have subtle but clear visual indicators:

```javascript
// In card.jsx
root: ({ theme }) => ({
  // Subtle shadow for depth
  boxShadow: theme.customShadows.card,
  
  // Light border for definition
  border: `1px solid ${theme.vars.palette.divider}`,
  
  // Double border radius for modern look
  borderRadius: theme.shape.borderRadius * 2,
})
```

**Result:**
- ✅ Subtle shadow (customShadows.card)
- ✅ Light divider border
- ✅ Clear card boundaries
- ✅ Modern, clean appearance

### High Contrast Mode (Enhanced)
Cards now have even stronger visual indicators:

```javascript
// In update-theme.js when contrast === 'hight'
root: ({ theme }) => ({
  // Stronger shadow for better depth
  boxShadow: theme.customShadows.z12,
  
  // Visible border
  border: `1px solid ${theme.vars.palette.divider}`,
  
  // Inherits borderRadius from base
})
```

**Result:**
- ✅ Strong shadow (z12 instead of z1)
- ✅ Clear border
- ✅ Maximum visual separation
- ✅ Excellent for accessibility

## Visual Comparison

### Before Fix
```
Default Mode:
┌─────────────────┐
│                 │  ← No visible border
│   Card Content  │  ← Blends into background
│                 │
└─────────────────┘

High Contrast:
╔═════════════════╗
║                 ║  ← Strong shadow
║   Card Content  ║  ← Clearly separated
║                 ║
╚═════════════════╝
```

### After Fix
```
Default Mode:
┌─────────────────┐
│                 │  ← Subtle border + shadow
│   Card Content  │  ← Clear separation
│                 │
└─────────────────┘

High Contrast:
╔═════════════════╗
║                 ║  ← Strong shadow + border
║   Card Content  ║  ← Maximum separation
║                 ║
╚═════════════════╝
```

## Technical Details

### Custom Shadows Used

**Default Mode:**
- `theme.customShadows.card` - Subtle card shadow
  ```
  0 0 2px 0 rgba(145, 158, 171, 0.2),
  0 12px 24px -4px rgba(145, 158, 171, 0.12)
  ```

**High Contrast Mode:**
- `theme.customShadows.z12` - Stronger shadow
  ```
  0 12px 24px -4px rgba(145, 158, 171, 0.16)
  ```

### Border Colors

Both modes use:
- `theme.vars.palette.divider` - Subtle divider color
  - Light mode: `rgba(145, 158, 171, 0.2)`
  - Dark mode: Similar opacity, different base

### Border Radius

Both modes use:
- `theme.shape.borderRadius * 2`
- Default: `8px * 2 = 16px`
- Can be customized via settings (0, 4, 8, 16)

## Files Changed

1. **`frontend/src/theme/core/components/card.jsx`**
   - Added `boxShadow: theme.customShadows.card`
   - Added `border: 1px solid divider`
   - Applied to all cards in default mode

2. **`frontend/src/theme/with-settings/update-theme.js`**
   - Enhanced high contrast card styling
   - Changed from `z1` to `z12` shadow
   - Added explicit border styling

## Testing Checklist

### Default Contrast Mode
- [ ] Cards have visible borders
- [ ] Cards have subtle shadows
- [ ] Card boundaries are clear
- [ ] Still looks clean and modern
- [ ] Not too heavy/bold

### High Contrast Mode
- [ ] Cards have strong shadows
- [ ] Cards have clear borders
- [ ] Maximum visual separation
- [ ] Easy to distinguish sections
- [ ] Good for accessibility

### Both Modes
- [ ] Border radius customization works
- [ ] Light/dark theme works
- [ ] Responsive on all screen sizes
- [ ] No layout shift
- [ ] Consistent spacing

## Usage Examples

### Dashboard Cards
```jsx
<Card>
  <CardHeader title="Total Sales" />
  <CardContent>
    <Typography variant="h3">$12,345</Typography>
  </CardContent>
</Card>
```
Now clearly visible with border and shadow in both modes!

### Analytics Cards
```jsx
<Card>
  <CardHeader 
    title="Sales Analytics"
    subheader="Last 6 months"
  />
  <CardContent>
    <LineChart data={salesData} />
  </CardContent>
</Card>
```
Chart containers now have clear boundaries!

### Settings Cards
```jsx
<Card>
  <CardContent>
    <Stack spacing={2}>
      <TextField label="Name" />
      <TextField label="Email" />
    </Stack>
  </CardContent>
</Card>
```
Form sections clearly separated!

## Customization

### Adjust Card Shadow
Edit `card.jsx`:
```javascript
// Lighter shadow
boxShadow: theme.customShadows.z4,

// Stronger shadow
boxShadow: theme.customShadows.z8,

// No shadow (original)
boxShadow: 'none',
```

### Adjust Border
Edit `card.jsx`:
```javascript
// No border
border: 'none',

// Thicker border
border: `2px solid ${theme.vars.palette.divider}`,

// Colored border
border: `1px solid ${theme.vars.palette.primary.main}`,
```

### Per-Component Override
For specific cards:
```jsx
<Card sx={{ boxShadow: 'none', border: 'none' }}>
  {/* Flat card */}
</Card>

<Card sx={{ boxShadow: theme.customShadows.z20 }}>
  {/* Elevated card */}
</Card>
```

## Benefits

### User Experience
- ✅ Better visual hierarchy
- ✅ Easier to scan content
- ✅ Clear section boundaries
- ✅ Professional appearance

### Accessibility
- ✅ Clear contrast between elements
- ✅ High contrast mode for visibility needs
- ✅ Consistent visual language
- ✅ WCAG compliant

### Design
- ✅ Modern card design
- ✅ Subtle yet effective
- ✅ Works in light and dark modes
- ✅ Customizable

## Related Settings

Toggle between modes in Settings:
1. Open Settings (⚙️ icon)
2. Find "Contrast" toggle
3. Switch between:
   - **Default** - Subtle, clean appearance
   - **High** - Strong, maximum visibility

---

**Applied**: October 2025  
**Status**: ✅ Fixed  
**Affects**: All MuiCard components

