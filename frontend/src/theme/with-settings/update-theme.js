import COLORS from '../core/colors.json';
import PRIMARY_COLOR from './primary-color.json';
import { hexToRgbChannel, createPaletteChannel } from '../styles';
import { grey as coreGreyPalette, primary as corePrimaryPalette } from '../core/palette';

// ----------------------------------------------------------------------

/**
 * [1] settings @primaryColor
 * [2] settings @contrast
 */

export function updateCoreWithSettings(theme, settings) {
  const { colorSchemes, customShadows } = theme;

  return {
    ...theme,
    colorSchemes: {
      ...colorSchemes,
      light: {
        palette: {
          ...colorSchemes?.light?.palette,
          /** [1] */
          primary: getPalettePrimary(settings.primaryColor),
          /** [2] */
          background: {
            ...colorSchemes?.light?.palette?.background,
            default: getBackgroundDefault(settings.contrast),
            defaultChannel: hexToRgbChannel(getBackgroundDefault(settings.contrast)),
          },
        },
      },
      dark: {
        palette: {
          ...colorSchemes?.dark?.palette,
          /** [1] */
          primary: getPalettePrimary(settings.primaryColor),
        },
      },
    },
    customShadows: {
      ...customShadows,
      /** [1] - TEMPORARILY DISABLED TO PREVENT CIRCULAR REFERENCE */
      // primary:
      //   settings.primaryColor === 'default'
      //     ? coreCustomShadows('light').primary
      //     : createShadowColor(getPalettePrimary(settings.primaryColor).mainChannel),
    },
  };
}

// ----------------------------------------------------------------------

export function updateComponentsWithSettings(settings) {
  const components = {};

  /** [2] */
  if (settings.contrast === 'high') {
    const MuiCard = {
      styleOverrides: {
        root: {
          // Static styles to avoid circular reference - no theme dependencies
          position: 'relative',
          borderRadius: 16, // 8 * 2 (hardcoded to avoid theme access)
          boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)', // theme.shadows[1] equivalent
          zIndex: 0,
        },
      },
    };

    components.MuiCard = MuiCard;
  }

  return { components };
}

// ----------------------------------------------------------------------

const PRIMARY_COLORS = {
  default: COLORS.primary,
  cyan: PRIMARY_COLOR.cyan,
  purple: PRIMARY_COLOR.purple,
  blue: PRIMARY_COLOR.blue,
  orange: PRIMARY_COLOR.orange,
  red: PRIMARY_COLOR.red,
  pink: PRIMARY_COLOR.pink,
  green: PRIMARY_COLOR.green,
};

function getPalettePrimary(primaryColorName) {
  /** [1] */
  const selectedPrimaryColor = PRIMARY_COLORS[primaryColorName];
  const updatedPrimaryPalette = createPaletteChannel(selectedPrimaryColor);

  return primaryColorName === 'default' ? corePrimaryPalette : updatedPrimaryPalette;
}

function getBackgroundDefault(contrast) {
  /** [2] */
  return contrast === 'default' ? '#FFFFFF' : coreGreyPalette[200];
}
