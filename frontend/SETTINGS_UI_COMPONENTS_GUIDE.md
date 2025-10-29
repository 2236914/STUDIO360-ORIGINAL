# Settings UI Components Guide

## Overview
This guide explains all the settings UI components that display font cards, color swatches, border radius options, and other customization controls.

## Component Locations

### Settings Components
All settings UI components are located in:
```
frontend/src/components/settings/
  ├── drawer/              # Drawer settings components
  │   ├── settings-drawer.jsx       # Main settings drawer
  │   ├── font-options.jsx          # Font preview cards
  │   ├── presets-options.jsx       # Color preset swatches  
  │   ├── border-radius-options.jsx # Border radius selector (NEW!)
  │   ├── nav-options.jsx           # Navigation layout options
  │   ├── base-option.jsx           # Base toggle option component
  │   └── styles.jsx                # Shared styles
  ├── popover/             # Popover settings components
  │   └── settings-popover.jsx      # Settings in a popover
  ├── context/             # Settings context and state
  │   └── settings-provider.jsx
  └── config-settings.js   # Default settings configuration
```

## UI Components Explained

### 1. Font Options Component (`font-options.jsx`)

**What it shows**: Beautiful cards displaying each font family with:
- Font icon with gradient background when selected
- Font name in the actual font family
- Hover and selection states

**Features**:
- Grid layout (2 columns)
- Cards with borders and shadows
- Smooth transitions
- Uses actual font in the card

**Available Fonts**:
- Barlow (default)
- Inter
- DM Sans
- Nunito Sans

**Usage**:
```jsx
<FontOptions
  value={settings.fontFamily}
  onClickOption={(newValue) => settings.onUpdateField('fontFamily', newValue)}
  options={['Barlow', 'Inter', 'DM Sans', 'Nunito Sans']}
/>
```

### 2. Presets Options Component (`presets-options.jsx`)

**What it shows**: Color swatches for each primary color preset with:
- Colored sidebar icon
- Highlight effect when selected
- Smooth color transitions

**Features**:
- Grid layout (3 columns)
- Shows actual color in the button
- Alpha transparency when selected
- Icon preview in theme color

**Available Presets**:
- Default (Blue #007BDB)
- Cyan (#078DEE)
- Purple (#7635dc)
- Pink (#E91E63)
- Green (#00A76F)
- Orange (#fda92d)
- Red (#FF3030)

**Usage**:
```jsx
<PresetsOptions
  value={settings.primaryColor}
  onClickOption={(newValue) => settings.onUpdateField('primaryColor', newValue)}
  options={[
    { name: 'default', value: '#007BDB' },
    { name: 'cyan', value: '#078DEE' },
    // ... more options
  ]}
/>
```

### 3. Border Radius Options Component (NEW!)

**What it shows**: Visual preview of different border radius options with:
- Square/box showing the actual radius
- Label underneath (Sharp, Soft, Default, Round)
- Color change when selected
- Smooth animation

**Features**:
- Grid layout (4 columns)
- Animated preview boxes
- Shows exact roundness visually
- Selection highlighting

**Available Options**:
- Sharp: 0px - No rounding
- Soft: 4px - Subtle rounding
- Default: 8px - Standard rounding
- Round: 16px - Maximum rounding

**Usage**:
```jsx
<BorderRadiusOptions
  value={settings.borderRadius || 8}
  onClickOption={(newValue) => settings.onUpdateField('borderRadius', newValue)}
  options={[
    { label: 'Sharp', value: 0 },
    { label: 'Soft', value: 4 },
    { label: 'Default', value: 8 },
    { label: 'Round', value: 16 },
  ]}
/>
```

### 4. Base Option Component (`base-option.jsx`)

**What it shows**: Toggle-style option cards for binary settings:
- Icon at the top
- Switch toggle on the right
- Label and tooltip
- Selected state styling

**Used for**:
- Dark mode toggle
- Contrast toggle
- RTL (Right-to-left) toggle
- Compact layout toggle

**Usage**:
```jsx
<BaseOption
  label="Dark mode"
  icon="moon"
  tooltip="Optional help text"
  selected={settings.colorScheme === 'dark'}
  onClick={() => settings.onUpdateField('colorScheme', 'dark')}
/>
```

### 5. Nav Options Component (`nav-options.jsx`)

**What it shows**: Visual preview of navigation layouts:
- Miniature navigation bar
- Shows vertical, horizontal, and mini layouts
- Color options (integrate, apparent)
- Interactive preview

**Features**:
- Shows actual layout structure
- Color-coded navigation items
- Selection highlighting
- Responsive to color settings

## How to Access Settings UI

### Option 1: Settings Drawer (Full Screen)
- Click the settings icon in the header
- Opens full drawer from the right side
- Shows all customization options
- Best for detailed customization

### Option 2: Settings Popover (Quick Access)
- Click settings icon (with spinning animation)
- Opens compact popover
- Quick access to common settings
- Scrollable list of options

## Customizing Settings Components

### Adding a New Settings Option

1. **Create the component** (e.g., `new-option.jsx`):
```jsx
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { Block } from './styles';

export function NewOption({ value, options, onClickOption }) {
  return (
    <Block title="My New Setting">
      <Box component="ul" gap={1.5} display="grid">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Box component="li" key={option.value}>
              <ButtonBase onClick={() => onClickOption(option.value)}>
                {/* Your option UI */}
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </Block>
  );
}
```

2. **Add to config-settings.js**:
```js
export const defaultSettings = {
  // ... existing settings
  myNewSetting: 'default-value',
};
```

3. **Add to settings drawer/popover**:
```jsx
import { NewOption } from './new-option';

// In the component:
const renderNewOption = (
  <NewOption
    value={settings.myNewSetting}
    onClickOption={(newValue) => settings.onUpdateField('myNewSetting', newValue)}
    options={[/* your options */]}
  />
);

// In the render:
<Stack spacing={2}>
  <Typography variant="subtitle2">My New Setting</Typography>
  {renderNewOption}
</Stack>
```

4. **Update theme to use the setting** (if needed):
```js
// in update-theme.js
export function updateCoreWithSettings(theme, settings) {
  return {
    ...theme,
    myNewThemeProperty: settings.myNewSetting,
  };
}
```

## Styling Guidelines

### Using Block Component
The `Block` component provides consistent styling:
```jsx
<Block title="Setting Name">
  {/* Your content */}
</Block>
```

### Grid Layouts
Use consistent grid layouts:
```jsx
<Box 
  component="ul" 
  gap={1.5} 
  display="grid" 
  gridTemplateColumns="repeat(3, 1fr)" // 2, 3, or 4 columns
>
  {/* Items */}
</Box>
```

### Selection States
Apply consistent selection styling:
```jsx
sx={{
  ...(selected && {
    color: (theme) => theme.vars.palette.text.primary,
    borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
    boxShadow: (theme) => `-8px 8px 20px -4px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
  }),
}}
```

## Common Issues & Solutions

### Issue: Settings UI not showing
**Solution**: Ensure SettingsProvider wraps your app and context is available

### Issue: Custom option not persisting
**Solution**: Add the setting to `defaultSettings` in `config-settings.js`

### Issue: Theme not updating when setting changes
**Solution**: Add setting to `updateCoreWithSettings()` in `update-theme.js`

### Issue: Font cards not displaying fonts
**Solution**: Ensure fonts are loaded in `typography.js` and available

### Issue: Color swatches showing wrong colors
**Solution**: Check `primary-color.json` has correct hex values

### Issue: Border radius not applying
**Solution**: Verify `theme.shape.borderRadius` is being used in components

## Best Practices

1. **Always use the Block component** for consistent spacing
2. **Use grid layouts** for option lists (2-4 columns)
3. **Add tooltips** for complex options
4. **Show visual previews** when possible (like border radius)
5. **Use theme variables** instead of hardcoded colors
6. **Test in both light and dark modes**
7. **Ensure responsive layouts** for mobile devices
8. **Add loading states** for async operations
9. **Validate user input** before applying
10. **Persist settings** using localStorage or cookies

## Testing Checklist

- [ ] Settings UI opens correctly
- [ ] All options display properly
- [ ] Selection states work
- [ ] Changes persist on reload
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Theme updates immediately
- [ ] Reset button works

---

**Last Updated**: October 2025
**Version**: 2.0 (With Border Radius Options)

