import { accordionClasses } from '@mui/material/Accordion';
import { accordionSummaryClasses } from '@mui/material/AccordionSummary';

// ----------------------------------------------------------------------

const MuiAccordion = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor: 'transparent',
      [`&.${accordionClasses.expanded}`]: {
        boxShadow: theme.shadows[8], // SAFE: Use static shadow instead of customShadows
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.vars.palette.background.paper,
      },
      [`&.${accordionClasses.disabled}`]: { backgroundColor: 'transparent' },
    }),
  },
};

const MuiAccordionSummary = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
      [`&.${accordionSummaryClasses.expanded}`]: { minHeight: 'auto' },
    }),
    content: ({ theme }) => ({
      margin: theme.spacing(1.5, 0),
      [`&.${accordionSummaryClasses.expanded}`]: { margin: theme.spacing(1.5, 0) },
    }),
  },
};

const MuiAccordionDetails = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: { root: ({ theme }) => ({ padding: theme.spacing(0, 2, 2, 2) }) },
};

// ----------------------------------------------------------------------

export const accordion = { MuiAccordion, MuiAccordionSummary, MuiAccordionDetails };
