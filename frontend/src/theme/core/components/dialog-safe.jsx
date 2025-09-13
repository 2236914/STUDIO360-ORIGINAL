// ----------------------------------------------------------------------

const MuiDialog = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    paper: ({ ownerState, theme }) => ({
      boxShadow: theme.shadows[24], // SAFE: Use static shadow instead of customShadows
      borderRadius: theme.shape.borderRadius * 2,
      ...(!ownerState.fullScreen && { margin: theme.spacing(2) }),
    }),
    paperFullScreen: { borderRadius: 0 },
  },
};

const MuiDialogTitle = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({ typography: theme.typography.h6, padding: theme.spacing(3, 3, 0) }),
  },
};

const MuiDialogContent = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({ padding: theme.spacing(3) }),
    dividers: ({ theme }) => ({
      borderTopColor: theme.vars.palette.divider,
      borderBottomColor: theme.vars.palette.divider,
    }),
  },
};

const MuiDialogActions = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  defaultProps: { disableSpacing: true },

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(3),
      '& > :not(style) ~ :not(style)': { marginLeft: theme.spacing(1.5) },
    }),
  },
};

// ----------------------------------------------------------------------

export const dialog = { MuiDialog, MuiDialogTitle, MuiDialogContent, MuiDialogActions };
