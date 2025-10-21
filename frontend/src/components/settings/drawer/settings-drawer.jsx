'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTheme, useColorScheme } from '@mui/material/styles';

import { paper } from 'src/theme/styles';
import COLORS from 'src/theme/core/colors.json';
import { defaultFont } from 'src/theme/core/typography';
import PRIMARY_COLOR from 'src/theme/with-settings/primary-color.json';

import { Iconify } from '../../iconify';
import { BaseOption } from './base-option';
import { NavOptions } from './nav-options';
import { Scrollbar } from '../../scrollbar';
import { FontOptions } from './font-options';
import { ClientOnly } from '../../client-only';
import { useSettingsContext } from '../context';
import { PresetsOptions } from './presets-options';
import { CustomDrawer } from '../../custom-drawer';
import { defaultSettings } from '../config-settings';
import { FullScreenButton } from './fullscreen-button';

// ----------------------------------------------------------------------

export function SettingsDrawer({
  sx,
  hideFont,
  hideCompact,
  hidePresets,
  hideNavColor,
  hideContrast,
  hideNavLayout,
  hideDirection,
  hideColorScheme,
}) {
  const theme = useTheme();

  const settings = useSettingsContext();

  // Safely use useColorScheme with fallback
  let mode = 'light';
  let setMode = () => {};
  
  try {
    const colorScheme = useColorScheme();
    mode = colorScheme.mode || 'light';
    setMode = colorScheme.setMode || (() => {});
  } catch (error) {
    // Fallback if useColorScheme is not available
    console.warn('useColorScheme not available, using fallback mode');
  }

  const renderHead = (
    <Box display="flex" alignItems="center" sx={{ py: 2, pr: 1, pl: 2.5 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Settings
      </Typography>

      <FullScreenButton />

      <Tooltip title="Reset">
        <IconButton
          onClick={() => {
            settings.onReset();
            setMode(defaultSettings.colorScheme);
          }}
        >
          <Badge color="error" variant="dot" invisible={!settings.canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title="Close">
        <IconButton onClick={settings.onCloseDrawer}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderMode = (
    <BaseOption
      label="Dark mode"
      icon="moon"
      selected={settings.colorScheme === 'dark'}
      onClick={() => {
        settings.onUpdateField('colorScheme', mode === 'light' ? 'dark' : 'light');
        setMode(mode === 'light' ? 'dark' : 'light');
      }}
    />
  );

  const renderContrast = (
    <BaseOption
      label="Contrast"
      icon="contrast"
      selected={settings.contrast === 'hight'}
      onClick={() =>
        settings.onUpdateField('contrast', settings.contrast === 'default' ? 'hight' : 'default')
      }
    />
  );

  const renderRTL = (
    <BaseOption
      label="Right to left"
      icon="align-right"
      selected={settings.direction === 'rtl'}
      onClick={() =>
        settings.onUpdateField('direction', settings.direction === 'ltr' ? 'rtl' : 'ltr')
      }
    />
  );

  const renderCompact = (
    <BaseOption
      tooltip="Dashboard only and available at large resolutions > 1600px (xl)"
      label="Compact"
      icon="autofit-width"
      selected={settings.compactLayout}
      onClick={() => settings.onUpdateField('compactLayout', !settings.compactLayout)}
    />
  );

  const renderPresets = (
    <PresetsOptions
      value={settings.primaryColor}
      onClickOption={(newValue) => settings.onUpdateField('primaryColor', newValue)}
      options={[
        { name: 'default', value: COLORS.primary.main },
        { name: 'cyan', value: PRIMARY_COLOR.cyan.main },
        { name: 'purple', value: PRIMARY_COLOR.purple.main },
        { name: 'pink', value: PRIMARY_COLOR.pink.main },
        { name: 'green', value: PRIMARY_COLOR.green.main },
        { name: 'orange', value: PRIMARY_COLOR.orange.main },
        { name: 'red', value: PRIMARY_COLOR.red.main },
      ]}
    />
  );

  const renderNav = (
    <NavOptions
      value={{
        color: settings.navColor,
        layout: settings.navLayout,
      }}
      onClickOption={{
        color: (newValue) => settings.onUpdateField('navColor', newValue),
        layout: (newValue) => settings.onUpdateField('navLayout', newValue),
      }}
      options={{
        colors: ['integrate', 'apparent'],
        layouts: ['vertical', 'horizontal', 'mini'],
      }}
      hideNavColor={hideNavColor}
      hideNavLayout={hideNavLayout}
    />
  );

  const renderFont = (
    <FontOptions
      value={settings.fontFamily}
      onClickOption={(newValue) => settings.onUpdateField('fontFamily', newValue)}
      options={[defaultFont, 'Inter', 'DM Sans', 'Nunito Sans']}
    />
  );

  return (
    <ClientOnly>
      <CustomDrawer
        anchor="right"
        open={settings.openDrawer}
        onClose={settings.onCloseDrawer}
        width={320}
        slotProps={{ backdrop: { invisible: true } }}
        sx={{
          ...paper({ theme }),
          ...sx,
        }}
      >
        <Scrollbar sx={{ height: 1 }}>
          <Stack spacing={3} sx={{ p: 3 }}>
            {renderHead}

            <Stack spacing={2}>
              {!hideColorScheme && renderMode}

              {!hideContrast && renderContrast}

              {!hideDirection && renderRTL}

              {!hideCompact && renderCompact}
            </Stack>

            {!hideNavLayout && (
              <Stack spacing={2}>
                <Typography variant="subtitle2">Nav</Typography>

                {renderNav}
              </Stack>
            )}

            {!hideFont && (
              <Stack spacing={2}>
                <Typography variant="subtitle2">Font</Typography>

                {renderFont}
              </Stack>
            )}

            {!hidePresets && (
              <Stack spacing={2}>
                <Typography variant="subtitle2">Presets</Typography>

                {renderPresets}
              </Stack>
            )}
          </Stack>
        </Scrollbar>
      </CustomDrawer>
    </ClientOnly>
  );
}
