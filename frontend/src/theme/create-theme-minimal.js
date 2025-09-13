import { experimental_extendTheme as extendTheme } from '@mui/material/styles';
import { setFont } from './styles/utils';

// ----------------------------------------------------------------------
// Minimal theme creation that completely avoids circular references
// This is a fallback if the main theme creation still has issues

function shouldSkipGeneratingVar(keys, value) {
  const skipKeys = ['mixins', 'overlays', 'direction', 'breakpoints', 'cssVarPrefix', 'unstable_sxConfig'];
  return skipKeys.includes(keys[0]);
}

export function createMinimalTheme(settings = {}) {
  const safeSettings = {
    colorScheme: 'light',
    direction: 'ltr',
    fontFamily: 'Barlow',
    ...settings
  };

  // Create the most basic theme possible
  const theme = extendTheme({
    direction: safeSettings.direction,
    cssVarPrefix: 'studio',
    shouldSkipGeneratingVar,
    
    // Basic color schemes without complex references
    colorSchemes: {
      light: {
        palette: {
          primary: {
            main: '#6950E8',
            light: '#A996F8',
            dark: '#3828A7',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#8C57FF',
            light: '#B794F6',
            dark: '#553C9A',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#FFFFFF',
            paper: '#FFFFFF',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
          },
        },
      },
      dark: {
        palette: {
          primary: {
            main: '#6950E8',
            light: '#A996F8',
            dark: '#3828A7',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#8C57FF',
            light: '#B794F6',
            dark: '#553C9A',
            contrastText: '#FFFFFF',
          },
          background: {
            default: '#121212',
            paper: '#1E1E1E',
          },
          text: {
            primary: 'rgba(255, 255, 255, 0.87)',
            secondary: 'rgba(255, 255, 255, 0.6)',
          },
        },
      },
    },

    // Basic typography
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
    },

    // Basic shape
    shape: {
      borderRadius: 8,
    },

    // Only essential components to avoid circular references
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            fontFamily: setFont(safeSettings.fontFamily),
          },
        },
      },
    },
  });

  return theme;
}
