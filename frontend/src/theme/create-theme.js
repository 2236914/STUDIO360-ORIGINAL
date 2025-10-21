import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

import { setFont } from './styles/utils';
import { shadows, typography, components, colorSchemes } from './core';
import { updateCoreWithSettings, updateComponentsWithSettings } from './with-settings/update-theme';

// ----------------------------------------------------------------------

// Fallback minimal theme to prevent deepmerge crashes
function createMinimalTheme(settings) {
  const safeSettings = {
    colorScheme: 'light',
    direction: 'ltr',
    contrast: 'default',
    navLayout: 'vertical',
    primaryColor: 'default',
    navColor: 'integrate',
    compactLayout: true,
    fontFamily: 'Barlow',
    ...settings
  };

  return extendTheme({
    colorSchemes: {
      light: {
        palette: {
          mode: 'light',
          primary: { main: '#007BDB' },
          secondary: { main: '#E91E63' },
          background: { default: '#FFFFFF', paper: '#FFFFFF' },
          text: { primary: '#1C252E', secondary: '#637381' },
        },
      },
      dark: {
        palette: {
          mode: 'dark',
          primary: { main: '#007BDB' },
          secondary: { main: '#E91E63' },
          background: { default: '#141A21', paper: '#1C252E' },
          text: { primary: '#FFFFFF', secondary: '#C4CDD5' },
        },
      },
    },
    direction: safeSettings.direction,
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: setFont(safeSettings.fontFamily),
      h1: { fontSize: '2.5rem', fontWeight: 700 },
      h2: { fontSize: '2rem', fontWeight: 700 },
      h3: { fontSize: '1.75rem', fontWeight: 600 },
      h4: { fontSize: '1.5rem', fontWeight: 600 },
      h5: { fontSize: '1.25rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
      body1: { fontSize: '1rem', lineHeight: 1.5 },
      body2: { fontSize: '0.875rem', lineHeight: 1.43 },
      button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
      caption: { fontSize: '0.75rem', lineHeight: 1.66 },
      overline: { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' },
    },
    cssVarPrefix: 'studio',
    shouldSkipGeneratingVar,
  });
}

export function createTheme(localeComponents, settings) {
  // Handle case where only settings is passed (starter version)
  if (!settings && localeComponents) {
    settings = localeComponents;
    localeComponents = undefined;
  }

  // Ensure settings has default values
  const defaultSettings = {
    colorScheme: 'light',
    direction: 'ltr',
    contrast: 'default',
    navLayout: 'vertical',
    primaryColor: 'default',
    navColor: 'integrate',
    compactLayout: true,
    fontFamily: 'Barlow',
  };
  
  const safeSettings = { ...defaultSettings, ...settings };

  // Create theme step by step to avoid circular references
  
  // 1. Create base theme with minimal structure
  const baseTheme = {
    direction: safeSettings.direction,
    shape: { borderRadius: 8 },
    cssVarPrefix: 'studio',
    shouldSkipGeneratingVar,
  };

  // 2. Add colorSchemes (which are static and safe)
  const themeWithColorSchemes = {
    ...baseTheme,
    colorSchemes,
  };

  // 3. Add shadows (which depend on colorScheme but are simple)
  const themeWithShadows = {
    ...themeWithColorSchemes,
    shadows: shadows(safeSettings.colorScheme),
  };

  // 4. Add typography (which is mostly static)
  const themeWithTypography = {
    ...themeWithShadows,
    typography: {
      ...typography,
      fontFamily: setFont(safeSettings.fontFamily),
    },
  };

  // 5. Update core theme with settings (this modifies colorSchemes safely)
  const coreTheme = updateCoreWithSettings(themeWithTypography, safeSettings);

  // 6. Get component updates
  const componentUpdates = updateComponentsWithSettings(safeSettings);
  
  // 7. Create final theme with isolated parts to avoid circular references
  const finalTheme = extendTheme(
    // Base theme structure (already processed)
    coreTheme,
    // Components layer (process each separately to avoid deepmerge issues)
    {
      components: {
        // Core components (these are safe)
        ...components,
        // Setting-based component updates (minimal to avoid circular refs)
        ...(componentUpdates?.components || {}),
        // CssBaseline override for consistent fonts (static, no theme refs)
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              fontFamily: setFont(safeSettings.fontFamily),
            },
          },
        },
        // Fix z-index layering for modals and dialogs
        MuiModal: {
          styleOverrides: {
            root: {
              zIndex: 1400, // Higher than header (1100) and nav (1101)
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            root: {
              zIndex: 1400, // Ensure dialogs appear above navigation
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            root: {
              zIndex: 1350, // Higher than header but lower than modals
            },
          },
        },
        MuiPopover: {
          styleOverrides: {
            root: {
              zIndex: 1350, // Higher than header but lower than modals
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: {
              '& .MuiSelect-select': {
                zIndex: 1,
              },
            },
          },
          defaultProps: {
            MenuProps: {
              PaperProps: {
                style: {
                  zIndex: 1500, // Higher than dialogs (1400)
                },
              },
            },
          },
        },
      }
    },
    // Locale components (optional, minimal)
    localeComponents && Object.keys(localeComponents).length > 0 ? localeComponents : undefined,
    // Skip overridesTheme for now to avoid circular references
    // overridesTheme || {}
  );

  return finalTheme;
}

// ----------------------------------------------------------------------

function shouldSkipGeneratingVar(keys, value) {
  const skipGlobalKeys = [
    'mixins',
    'overlays',
    'direction',
    'breakpoints',
    'cssVarPrefix',
    'unstable_sxConfig',
    'typography',
    // 'transitions',
  ];

  const skipPaletteKeys = {
    global: ['tonalOffset', 'dividerChannel', 'contrastThreshold'],
    grey: ['A100', 'A200', 'A400', 'A700'],
    text: ['icon'],
  };

  const isPaletteKey = keys[0] === 'palette';

  if (isPaletteKey) {
    const paletteType = keys[1];
    const skipKeys = skipPaletteKeys[paletteType] || skipPaletteKeys.global;

    return keys.some((key) => skipKeys?.includes(key));
  }

  return keys.some((key) => skipGlobalKeys?.includes(key));
}