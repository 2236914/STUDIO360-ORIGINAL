import { sliderClasses } from '@mui/material/Slider';

import { varAlpha, stylesMode } from '../../styles';

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'];

// ----------------------------------------------------------------------

const SIZE = {
  track: { medium: 4, large: 6 },
  thumb: { medium: 20, large: 24 },
};

// ----------------------------------------------------------------------

function styleColors(ownerState, styles) {
  const outputStyle = COLORS.reduce((acc, color) => {
    if (!ownerState.disabled && ownerState.color === color) {
      acc = styles(color);
    }
    return acc;
  }, {});

  return outputStyle;
}

// ----------------------------------------------------------------------

const MuiSlider = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  defaultProps: { size: 'medium' },

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      [`& .${sliderClasses.thumb}`]: {
        borderWidth: 1,
        borderStyle: 'solid',
        width: SIZE.thumb.medium,
        height: SIZE.thumb.medium,
        boxShadow: theme.shadows[1], // SAFE: Use static shadow instead of customShadows
        color: theme.vars.palette.common.white,
        borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
        '&::before': {
          opacity: 0.4,
          boxShadow: 'none',
          width: 'calc(100% - 4px)',
          height: 'calc(100% - 4px)',
        },
        [`&.${sliderClasses.active}`]: { boxShadow: 'none' },
        [`&.${sliderClasses.disabled}`]: { boxShadow: 'none' },
      },
      [`& .${sliderClasses.track}`]: { borderRadius: 1, height: SIZE.track.medium },
      [`& .${sliderClasses.rail}`]: {
        height: SIZE.track.medium,
        borderRadius: 1,
        color: theme.vars.palette.grey[400],
        opacity: 1,
        [stylesMode.dark]: { color: theme.vars.palette.grey[600] },
      },
      [`& .${sliderClasses.mark}`]: { borderRadius: '50%' },
      [`& .${sliderClasses.markLabel}`]: { fontSize: theme.typography.body2.fontSize },
      [`&.${sliderClasses.sizeLarge}`]: {
        [`& .${sliderClasses.thumb}`]: {
          width: SIZE.thumb.large,
          height: SIZE.thumb.large,
        },
        [`& .${sliderClasses.track}`]: { height: SIZE.track.large },
        [`& .${sliderClasses.rail}`]: { height: SIZE.track.large },
      },
    }),
    thumbColorPrimary: ({ theme, ownerState }) => {
      const styled = {
        colors: styleColors(ownerState, (color) => ({
          borderColor: theme.vars.palette[color].main,
        })),
      };
      return { ...styled.colors };
    },
    thumbColorSecondary: ({ theme, ownerState }) => {
      const styled = {
        colors: styleColors(ownerState, (color) => ({
          borderColor: theme.vars.palette[color].main,
        })),
      };
      return { ...styled.colors };
    },
    thumbColorInfo: ({ theme, ownerState }) => {
      const styled = {
        colors: styleColors(ownerState, (color) => ({
          borderColor: theme.vars.palette[color].main,
        })),
      };
      return { ...styled.colors };
    },
    thumbColorSuccess: ({ theme, ownerState }) => {
      const styled = {
        colors: styleColors(ownerState, (color) => ({
          borderColor: theme.vars.palette[color].main,
        })),
      };
      return { ...styled.colors };
    },
    thumbColorWarning: ({ theme, ownerState }) => {
      const styled = {
        colors: styleColors(ownerState, (color) => ({
          borderColor: theme.vars.palette[color].main,
        })),
      };
      return { ...styled.colors };
    },
    thumbColorError: ({ theme, ownerState }) => {
      const styled = {
        colors: styleColors(ownerState, (color) => ({
          borderColor: theme.vars.palette[color].main,
        })),
      };
      return { ...styled.colors };
    },
  },
};

// ----------------------------------------------------------------------

export const slider = { MuiSlider };
