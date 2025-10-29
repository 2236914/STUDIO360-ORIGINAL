import COLORS from '../core/colors.json';
import PRIMARY_COLOR from './primary-color.json';
import { components as coreComponents } from '../core/components';
import { hexToRgbChannel, createPaletteChannel } from '../styles';
import { grey as coreGreyPalette, primary as corePrimaryPalette } from '../core/palette';
import { createShadowColor, customShadows as coreCustomShadows } from '../core/custom-shadows';

// ----------------------------------------------------------------------

/**
 * [1] settings @primaryColor
 * [2] settings @contrast
 * [3] settings @borderRadius
 */

export function updateCoreWithSettings(theme, settings) {
  const { colorSchemes, customShadows, shadows, typography, components, direction, cssVarPrefix, shouldSkipGeneratingVar } = theme;

  // DON'T spread entire theme - causes circular reference!
  // Instead, explicitly copy only what we need
  return {
    colorSchemes: {
      ...colorSchemes,
      light: {
        palette: {
          ...colorSchemes?.light?.palette,
          /** [1] Update primary color */
          primary: getPalettePrimary(settings.primaryColor),
          /** [2] Update background contrast */
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
          /** [1] Update primary color for dark mode */
          primary: getPalettePrimary(settings.primaryColor),
        },
      },
    },
    customShadows: {
      ...customShadows,
      /** [1] Update primary shadow color */
      primary:
        settings.primaryColor === 'default'
          ? coreCustomShadows('light').primary
          : createShadowColor(getPalettePrimary(settings.primaryColor).mainChannel),
    },
    /** [3] Update border radius from settings */
    shape: {
      borderRadius: settings.borderRadius || 8,
    },
    // Pass through other required properties WITHOUT spreading
    shadows,
    typography,
    components,
    direction,
    cssVarPrefix,
    shouldSkipGeneratingVar,
  };
}

// ----------------------------------------------------------------------

export function updateComponentsWithSettings(settings) {
  const components = {};

  /** [2] High contrast mode - Enhanced card styling */
  if (settings.contrast === 'hight') {
    const MuiCard = {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          let rootStyles = {};
          if (typeof coreComponents?.MuiCard?.styleOverrides?.root === 'function') {
            rootStyles =
              coreComponents.MuiCard.styleOverrides.root({
                ownerState,
                theme,
              }) ?? {};
          }

          return {
            ...rootStyles,
            // Enhanced shadow for high contrast
            boxShadow: theme.customShadows.z12,
            // Stronger border for high contrast
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: theme.vars.palette.divider,
          };
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
  const selectedPrimaryColor = PRIMARY_COLORS[primaryColorName];
  
  if (!selectedPrimaryColor) {
    return corePrimaryPalette;
  }

  const updatedPrimaryPalette = createPaletteChannel(selectedPrimaryColor);

  return primaryColorName === 'default' ? corePrimaryPalette : updatedPrimaryPalette;
}

function getBackgroundDefault(contrast) {
  return contrast === 'default' ? '#FFFFFF' : coreGreyPalette[200];
}
