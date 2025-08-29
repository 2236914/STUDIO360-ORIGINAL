'use client';

import { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { Experimental_CssVarsProvider as CssVarsProvider, experimental_extendTheme as extendTheme } from '@mui/material/styles';
import { useServerInsertedHTML } from 'next/navigation';

import { useSettingsContext } from 'src/components/settings';
import { defaultSettings } from 'src/components/settings';

import { createTheme } from './create-theme';
import { createMinimalTheme } from './create-theme-minimal';
import { RTL } from './with-settings/right-to-left';
import { schemeConfig } from './color-scheme-script';

// ----------------------------------------------------------------------

// Completely safe theme that bypasses all problematic components
function createCompletelySafeTheme(settings) {
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

  // Create theme using extendTheme to ensure proper structure
  const theme = extendTheme({
    colorSchemes: {
      light: {
        palette: {
          primary: { main: '#007BDB' },
          secondary: { main: '#E91E63' },
          info: { main: '#00A76F' },
          success: { main: '#22C55E' },
          warning: { main: '#FFAB00' },
          error: { main: '#FF5630' },
          background: { default: '#FFFFFF', paper: '#FFFFFF' },
          text: { primary: '#1C252E', secondary: '#637381' },
          grey: {
            50: '#FCFDFD',
            100: '#F9FAFB',
            200: '#F4F6F8',
            300: '#DFE3E8',
            400: '#C4CDD5',
            500: '#919EAB',
            600: '#637381',
            700: '#454F5B',
            800: '#1C252E',
            900: '#141A21'
          },
          common: { black: '#000000', white: '#FFFFFF' },
          divider: 'rgba(145, 158, 171, 0.2)',
          action: {
            active: 'rgba(145, 158, 171, 0.54)',
            hover: 'rgba(145, 158, 171, 0.04)',
            selected: 'rgba(145, 158, 171, 0.08)',
            disabled: 'rgba(145, 158, 171, 0.26)',
            disabledBackground: 'rgba(145, 158, 171, 0.12)',
            focus: 'rgba(145, 158, 171, 0.12)',
          },
        },
      },
      dark: {
        palette: {
          primary: { main: '#007BDB' },
          secondary: { main: '#E91E63' },
          info: { main: '#00A76F' },
          success: { main: '#22C55E' },
          warning: { main: '#FFAB00' },
          error: { main: '#FF5630' },
          background: { default: '#141A21', paper: '#1C252E' },
          text: { primary: '#FFFFFF', secondary: '#C4CDD5' },
          grey: {
            50: '#FCFDFD',
            100: '#F9FAFB',
            200: '#F4F6F8',
            300: '#DFE3E8',
            400: '#C4CDD5',
            500: '#919EAB',
            600: '#637381',
            700: '#454F5B',
            800: '#1C252E',
            900: '#141A21'
          },
          common: { black: '#000000', white: '#FFFFFF' },
          divider: 'rgba(145, 158, 171, 0.2)',
          action: {
            active: 'rgba(145, 158, 171, 0.54)',
            hover: 'rgba(145, 158, 171, 0.04)',
            selected: 'rgba(145, 158, 171, 0.08)',
            disabled: 'rgba(145, 158, 171, 0.26)',
            disabledBackground: 'rgba(145, 158, 171, 0.12)',
            focus: 'rgba(145, 158, 171, 0.12)',
          },
        },
      },
    },
    direction: safeSettings.direction,
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"Barlow",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
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
    shouldSkipGeneratingVar: () => false,
    // Minimal components to avoid circular references
    components: {
      MuiButton: {
        defaultProps: { color: 'inherit', disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontFamily: '"Barlow",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            position: 'relative',
            borderRadius: 16,
            boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
            zIndex: 0,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            // Ensure text is properly defined for CssBaseline
            fontFamily: '"Barlow",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
          },
        },
      },
    },
  });
  
  console.log('Safe theme created with palette:', theme.palette);
  return theme;
}

export function ThemeProvider({ children }) {
  const settings = useSettingsContext() || defaultSettings;
  
  // Create theme with robust fallback system
  const theme = useMemo(() => {
    try {
      const createdTheme = createTheme(undefined, settings);
      console.log('Theme created successfully');
      return createdTheme;
    } catch (error) {
      console.warn('Main theme creation failed, using minimal theme:', error.message);
      const minimalTheme = createMinimalTheme(settings);
      console.log('Minimal theme created as fallback');
      return minimalTheme;
    }
  }, [settings]);

  // Fix hydration mismatch by ensuring consistent CSS generation
  useServerInsertedHTML(() => {
    return null; // Let AppRouterCacheProvider handle CSS insertion
  });

  // No loading state - theme is always available
  return (
    <AppRouterCacheProvider options={{ key: 'css', enableCssLayer: true }}>
      <CssVarsProvider
        theme={theme}
        defaultMode={schemeConfig.defaultMode}
        modeStorageKey={schemeConfig.modeStorageKey}
        // Critical: Ensure hydration consistency
        disableTransitionOnChange
        // Prevent CSS flash and ensure server/client consistency
        colorSchemeSelector="class"
      >
        <CssBaseline enableColorScheme />
        <RTL direction={settings.direction}>{children}</RTL>
      </CssVarsProvider>
    </AppRouterCacheProvider>
  );
}
