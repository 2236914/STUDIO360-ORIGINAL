import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

import { setFont } from './styles/utils';
import { shadows, typography, components, colorSchemes, customShadows } from './core';
import { updateCoreWithSettings, updateComponentsWithSettings } from './with-settings/update-theme';

// ----------------------------------------------------------------------

export function createTheme(settings) {
  // 1) Compute settings-specific component overrides
  const settingsComponents = updateComponentsWithSettings(settings).components || {};

  // 2) Shallow-merge components BEFORE calling extendTheme to avoid deep-merge circular refs
  const mergedComponents = {};
  Object.keys(components || {}).forEach((key) => {
    mergedComponents[key] = components[key];
  });
  Object.keys(settingsComponents || {}).forEach((key) => {
    if (settingsComponents[key]) {
      mergedComponents[key] = settingsComponents[key];
    }
  });

  const initialTheme = {
    colorSchemes,
    shadows: shadows(settings.colorScheme),
    customShadows: customShadows(settings.colorScheme),
    direction: settings.direction,
    shape: { borderRadius: 8 },
    components: mergedComponents,
    typography: (() => {
      const t = {};
      Object.keys(typography || {}).forEach((k) => { t[k] = typography[k]; });
      t.fontFamily = setFont(settings.fontFamily);
      return t;
    })(),
    cssVarPrefix: '',
    shouldSkipGeneratingVar,
  };

  // 3) Update core values safely (no theme spread inside)
  const themeConfig = updateCoreWithSettings(initialTheme, settings);

  // 4) Create theme from a SINGLE config object to avoid deep-merge across multiple arguments
  const theme = extendTheme(themeConfig);

  return theme;
}

// ----------------------------------------------------------------------

function shouldSkipGeneratingVar(keys, value) {
  const skipGlobalKeys = [
    'mixins',
    'overlays',
    'direction',
    'breakpoints',
    'cssVarPrefix',
    'unstable_sxConfig',
    'typography',
    // 'transitions',
  ];

  const skipPaletteKeys = {
    global: ['tonalOffset', 'dividerChannel', 'contrastThreshold'],
    grey: ['A100', 'A200', 'A400', 'A700'],
    text: ['icon'],
  };

  const isPaletteKey = keys[0] === 'palette';

  if (isPaletteKey) {
    const paletteType = keys[1];
    const skipKeys = skipPaletteKeys[paletteType] || skipPaletteKeys.global;

    return keys.some((key) => skipKeys?.includes(key));
  }

  return keys.some((key) => skipGlobalKeys?.includes(key));
}

/**
* createTheme without @settings and @locale components.
*
 ```jsx
export function createTheme(): Theme {
  const initialTheme = {
    colorSchemes,
    shadows: shadows('light'),
    customShadows: customShadows('light'),
    shape: { borderRadius: 8 },
    components,
    typography,
    cssVarPrefix: '',
    shouldSkipGeneratingVar,
  };

  const theme = extendTheme(initialTheme, overridesTheme);

  return theme;
}
 ```
*/
