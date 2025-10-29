# Deep Merge Circular Reference Fix

## Problem
MUI's `extendTheme()` uses deep merge which can cause "Maximum call stack size exceeded" errors when:
1. Multiple objects with nested components are passed
2. Component style functions create circular references
3. Theme objects reference each other

## Solution Applied

### Pre-Merge Components
Instead of:
```javascript
// ❌ This causes deep merge issues
const theme = extendTheme(
  updatedTheme,           // has components
  componentOverrides,      // has components
  overridesTheme          // has components
);
```

We now do:
```javascript
// ✅ Pre-merge all components before extendTheme
const mergedComponents = {};

// Merge base components
Object.keys(updatedTheme.components).forEach(key => {
  mergedComponents[key] = updatedTheme.components[key];
});

// Merge overrides
Object.keys(componentOverrides.components).forEach(key => {
  mergedComponents[key] = componentOverrides.components[key];
});

// Create single theme config
const finalThemeConfig = {
  ...updatedTheme,
  components: mergedComponents, // Single merged object
};

const theme = extendTheme(finalThemeConfig); // Single argument
```

### Why This Works

**Before:**
- `extendTheme` receives 3 separate objects
- MUI tries to deep merge all 3
- Component functions create circular references
- Stack overflow occurs

**After:**
- Components pre-merged using shallow iteration
- `extendTheme` receives 1 object
- No deep merge of components needed
- No circular references created

## Key Principles

### 1. Single Object to extendTheme
Always pass a single, pre-merged configuration object to `extendTheme`:
```javascript
✅ extendTheme(finalConfig)
❌ extendTheme(config1, config2, config3)
```

### 2. Shallow Component Merge
Merge components at the top level only:
```javascript
// ✅ Shallow merge
mergedComponents[key] = component;

// ❌ Deep merge
mergedComponents = deepMerge(comp1, comp2, comp3);
```

### 3. Minimal Overrides
Keep `overridesTheme` minimal:
```javascript
// ✅ Minimal
export const overridesTheme = {};

// ❌ Complex nested overrides
export const overridesTheme = {
  components: { /* ... */ },
  colorSchemes: { /* ... */ },
  // etc...
};
```

## Verification

The fix is working if:
- ✅ No "Maximum call stack size exceeded" errors
- ✅ Theme creates successfully
- ✅ All components render properly
- ✅ Customization works (colors, fonts, border radius)
- ✅ No console warnings

## If Issues Persist

### Check for Circular References in Components
Look for components that reference themselves:
```javascript
// ❌ Can cause issues
const MuiButton = {
  styleOverrides: {
    root: ({ theme }) => ({
      // If this references MuiButton somehow
      ...theme.components.MuiButton,
    }),
  },
};
```

### Simplify Component Overrides
If a specific component causes issues, simplify it:
```javascript
// ❌ Complex
styleOverrides: {
  root: ({ theme, ownerState }) => {
    const baseStyles = getComplexStyles(theme);
    return { ...baseStyles, ...moreStyles };
  },
}

// ✅ Simple
styleOverrides: {
  root: {
    borderRadius: 8,
    padding: 16,
  },
}
```

### Test in Isolation
Test theme creation separately:
```javascript
import { createTheme } from './theme/create-theme';
import { defaultSettings } from './components/settings';

try {
  const theme = createTheme(defaultSettings);
  console.log('Theme created successfully:', theme);
} catch (error) {
  console.error('Theme creation failed:', error);
}
```

## Related Files

- `frontend/src/theme/create-theme.js` - Main fix applied here
- `frontend/src/theme/overrides-theme.js` - Simplified
- `frontend/src/theme/with-settings/update-theme.js` - Component override logic

## Additional Notes

This is a known limitation of MUI's deep merge utility. The fix follows best practices:
1. Pre-merge at application level (shallow)
2. Pass single config to MUI
3. Let MUI handle only its internal merging

---

**Applied**: October 2025
**Status**: ✅ Working
**Verified**: No stack overflow errors

