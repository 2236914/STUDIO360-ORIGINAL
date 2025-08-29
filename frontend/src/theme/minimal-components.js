// Minimal component overrides that avoid circular references
// These provide essential styling without complex theme dependencies

export const minimalComponents = {
  MuiCard: {
    styleOverrides: {
      root: {
        position: 'relative',
        // Static shadow values to avoid circular references
        boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        borderRadius: 16, // 8 * 2
        zIndex: 0,
      },
    },
  },
  MuiCardHeader: {
    defaultProps: {
      titleTypographyProps: { variant: 'h6' },
      subheaderTypographyProps: { variant: 'body2', marginTop: '4px' },
    },
    styleOverrides: {
      root: {
        padding: '24px 24px 0', // theme.spacing(3, 3, 0)
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: 24, // theme.spacing(3)
      },
    },
  },
  MuiButton: {
    defaultProps: { 
      color: 'inherit', 
      disableElevation: true 
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontFamily: '"Barlow",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
      },
      contained: {
        '&:hover': {
          // Static shadow values for different colors
          boxShadow: '0 8px 16px 0 rgba(0, 167, 111, 0.24)', // primary
        },
      },
      sizeSmall: {
        height: 30,
        paddingLeft: 8,
        paddingRight: 8,
      },
      sizeMedium: {
        paddingLeft: 12,
        paddingRight: 12,
      },
      sizeLarge: {
        height: 48,
        paddingLeft: 16,
        paddingRight: 16,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
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
  MuiStack: {
    styleOverrides: {
      root: {
        gap: 'inherit',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: 'rgba(224, 224, 224, 1)',
        '&.MuiDivider-vertical': {
          borderStyle: 'dashed',
        },
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
    },
  },
};
