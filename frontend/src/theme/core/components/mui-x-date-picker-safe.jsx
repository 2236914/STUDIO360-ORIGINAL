import { datePickerToolbarClasses } from '@mui/x-date-pickers/DatePicker';
import {
  pickersDayClasses,
  pickersYearClasses,
  pickersMonthClasses,
  pickersCalendarHeaderClasses,
} from '@mui/x-date-pickers';

import { varAlpha } from '../../styles';

// ----------------------------------------------------------------------

const MuiDateCalendar = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.vars.palette.text.primary,
      [`& .${pickersCalendarHeaderClasses.root}`]: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
      },
      [`& .${pickersCalendarHeaderClasses.labelContainer}`]: {
        fontSize: theme.typography.h6.fontSize,
        fontWeight: theme.typography.h6.fontWeight,
      },
      [`& .${pickersDayClasses.root}`]: {
        fontSize: theme.typography.body2.fontSize,
        fontWeight: theme.typography.fontWeightMedium,
        [`&.${pickersDayClasses.today}`]: {
          borderColor: theme.vars.palette.text.primary,
        },
      },
    }),
  },
};

const MuiDayCalendar = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    weekDayLabel: ({ theme }) => ({
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.fontWeightSemiBold,
    }),
  },
};

const MuiPickersDay = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.fontWeightMedium,
    }),
  },
};

const MuiPickersYear = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    yearButton: ({ theme }) => ({
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.fontWeightMedium,
      [`&.${pickersYearClasses.selected}`]: {
        fontSize: theme.typography.subtitle2.fontSize,
        fontWeight: theme.typography.fontWeightSemiBold,
      },
    }),
  },
};

const MuiPickersMonth = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    monthButton: ({ theme }) => ({
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.fontWeightMedium,
      [`&.${pickersMonthClasses.selected}`]: {
        fontSize: theme.typography.subtitle2.fontSize,
        fontWeight: theme.typography.fontWeightSemiBold,
      },
    }),
  },
};

const MuiPickersCalendarHeader = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({ paddingLeft: theme.spacing(1), paddingRight: theme.spacing(1) }),
    labelContainer: ({ theme }) => ({
      fontSize: theme.typography.h6.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
    }),
  },
};

const MuiDatePickerToolbar = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      [`& .${datePickerToolbarClasses.title}`]: {
        fontSize: theme.typography.h4.fontSize,
        fontWeight: theme.typography.h4.fontWeight,
      },
    }),
  },
};

const MuiPickersLayout = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      [`& .${pickersCalendarHeaderClasses.root}`]: {
        [`& .${pickersCalendarHeaderClasses.labelContainer}`]: {
          fontSize: theme.typography.h6.fontSize,
          fontWeight: theme.typography.h6.fontWeight,
        },
      },
    }),
  },
};

const MuiPickersArrowSwitcher = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({ color: theme.vars.palette.text.disabled }),
    button: ({ theme }) => ({
      color: 'inherit',
      [`&:hover`]: { backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08) },
    }),
  },
};

const MuiClock = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({ backgroundColor: theme.vars.palette.grey[theme.palette.mode === 'light' ? 50 : 900] }),
  },
};

const MuiClockNumber = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.fontWeightMedium,
    }),
  },
};

const MuiClockPointer = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({ backgroundColor: theme.vars.palette.primary.main }),
    thumb: ({ theme }) => ({
      backgroundColor: theme.vars.palette.primary.main,
      borderColor: theme.vars.palette.primary.main,
    }),
  },
};

const MuiPickersPopper = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  styleOverrides: {
    paper: ({ theme }) => ({
      boxShadow: theme.shadows[20], // SAFE: Use static shadow instead of customShadows
      borderRadius: theme.shape.borderRadius * 1.5,
    }),
  },
};

// ----------------------------------------------------------------------

export const datePicker = {
  MuiClock,
  MuiClockNumber,
  MuiClockPointer,
  MuiDayCalendar,
  MuiDateCalendar,
  MuiPickersDay,
  MuiPickersYear,
  MuiPickersMonth,
  MuiPickersPopper,
  MuiPickersLayout,
  MuiDatePickerToolbar,
  MuiPickersArrowSwitcher,
  MuiPickersCalendarHeader,
};
