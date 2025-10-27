import { Toaster } from 'sonner';

import { styled } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';

import { toasterClasses } from './classes';

// ----------------------------------------------------------------------

export const StyledToaster = styled(Toaster)(({ theme }) => {
  const baseStyles = {
    toastDefault: {
      padding: theme.spacing(1, 1, 1, 1.5),
      boxShadow: theme.customShadows.z8,
      color: theme.vars.palette.background.paper,
      backgroundColor: theme.vars.palette.text.primary,
    },
    toastColor: {
      padding: 0,
      boxShadow: theme.customShadows.z8,
      color: theme.vars.palette.text.primary,
      backgroundColor: theme.vars.palette.background.paper,
      border: '1px solid',
      borderColor: theme.vars.palette.divider,
    },
    toastLoader: {
      padding: theme.spacing(0.5, 1, 0.5, 0.5),
      boxShadow: theme.customShadows.z8,
      color: theme.vars.palette.text.primary,
      backgroundColor: theme.vars.palette.background.paper,
    },
  };

  const loadingStyles = {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'none',
    transform: 'none',
    overflow: 'hidden',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 'inherit',
    justifyContent: 'center',
    background: theme.vars.palette.background.neutral,
    [`& .${toasterClasses.loadingIcon}`]: {
      zIndex: 9,
      width: 24,
      height: 24,
      borderRadius: '50%',
      animation: 'rotate 3s infinite linear',
      background: `conic-gradient(${varAlpha(theme.vars.palette.text.primaryChannel, 0)}, ${varAlpha(theme.vars.palette.text.disabledChannel, 0.64)})`,
    },
    [toasterClasses.loaderVisible]: { display: 'flex' },
  };

  return {
    width: 320,
    [`& .${toasterClasses.toast}`]: {
      gap: 8,
      width: '100%',
      minHeight: 48,
      display: 'flex',
      borderRadius: 8,
      alignItems: 'center',
      padding: theme.spacing(1, 1.5),
    },
    /*
     * Content
     */
    [`& .${toasterClasses.content}`]: {
      gap: 2,
      flex: '1 1 auto',
    },
    [`& .${toasterClasses.title}`]: {
      fontSize: theme.typography.body2.fontSize,
      fontWeight: 500,
    },
    [`& .${toasterClasses.description}`]: {
      fontSize: theme.typography.caption.fontSize,
      opacity: 0.7,
    },
    /*
     * Buttons
     */
    [`& .${toasterClasses.actionButton}`]: {},
    [`& .${toasterClasses.cancelButton}`]: {},
    [`& .${toasterClasses.closeButton}`]: {
      top: 4,
      right: 4,
      left: 'auto',
      padding: 4,
      minWidth: 20,
      width: 20,
      height: 20,
      color: 'currentColor',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      transition: theme.transitions.create(['background-color']),
      '&:hover': {
        backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
      },
    },
    /*
     * Icon
     */
    [`& .${toasterClasses.icon}`]: {
      margin: 0,
      width: 36,
      height: 36,
      alignItems: 'center',
      borderRadius: 8,
      justifyContent: 'center',
      flexShrink: 0,
      [`& .${toasterClasses.iconSvg}`]: {
        width: 20,
        height: 20,
        fontSize: 0,
      },
    },

    /*
     * Default
     */
    '@keyframes rotate': { to: { transform: 'rotate(1turn)' } },

    [`& .${toasterClasses.default}`]: {
      ...baseStyles.toastDefault,
      [`&:has(${toasterClasses.closeBtnVisible})`]: {
        [`& .${toasterClasses.content}`]: {
          paddingRight: 32,
        },
      },
      [`&:has(.${toasterClasses.loader})`]: baseStyles.toastLoader,
      /*
       * With loader
       */
      [`&:has(.${toasterClasses.loader})`]: baseStyles.toastLoader,
      [`& .${toasterClasses.loader}`]: loadingStyles,
    },
    /*
     * Error
     */
    [`& .${toasterClasses.error}`]: {
      ...baseStyles.toastColor,
      borderColor: theme.vars.palette.error.main,
      [`& .${toasterClasses.icon}`]: {
        color: theme.vars.palette.error.main,
        backgroundColor: varAlpha(theme.vars.palette.error.mainChannel, 0.12),
      },
    },
    /*
     * Success
     */
    [`& .${toasterClasses.success}`]: {
      ...baseStyles.toastColor,
      borderColor: theme.vars.palette.success.main,
      [`& .${toasterClasses.icon}`]: {
        color: theme.vars.palette.success.main,
        backgroundColor: varAlpha(theme.vars.palette.success.mainChannel, 0.12),
      },
    },
    /*
     * Warning
     */
    [`& .${toasterClasses.warning}`]: {
      ...baseStyles.toastColor,
      borderColor: theme.vars.palette.warning.main,
      [`& .${toasterClasses.icon}`]: {
        color: theme.vars.palette.warning.main,
        backgroundColor: varAlpha(theme.vars.palette.warning.mainChannel, 0.12),
      },
    },
    /*
     * Info
     */
    [`& .${toasterClasses.info}`]: {
      ...baseStyles.toastColor,
      borderColor: theme.vars.palette.info.main,
      [`& .${toasterClasses.icon}`]: {
        color: theme.vars.palette.info.main,
        backgroundColor: varAlpha(theme.vars.palette.info.mainChannel, 0.12),
      },
    },
  };
});
