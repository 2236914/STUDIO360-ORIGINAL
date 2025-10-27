import { defaultFont } from 'src/theme/core/typography';

// ----------------------------------------------------------------------

export const STORAGE_KEY = 'app-settings';

export const defaultSettings = {
  colorScheme: 'light',
  direction: 'ltr',
  contrast: 'default',
  navLayout: 'vertical',
  primaryColor: 'default',
  navColor: 'integrate',
  compactLayout: true,
  fontFamily: defaultFont,
  borderRadius: 8, // Border radius for buttons, cards, etc. (in pixels)
};
