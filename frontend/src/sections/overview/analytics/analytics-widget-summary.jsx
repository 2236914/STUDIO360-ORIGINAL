'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';

import { fNumber, fPercent } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

// Function to get chart colors based on color preset
function getChartColors(primaryColor, theme) {
  // If using default preset, use the primary main for all shades
  if (primaryColor === 'default') {
    return {
      dark: theme.palette.primary.main,
      main: theme.palette.primary.main,
      light: theme.palette.primary.main,
      lighter: theme.palette.primary.main,
    };
  }
  
  // For custom color presets, use the preset colors
  const presetColors = {
    cyan: theme.palette.cyan?.main || '#078DEE',
    purple: theme.palette.purple?.main || '#7635dc',
    blue: theme.palette.blue?.main || '#0C68E9',
    orange: theme.palette.orange?.main || '#fda92d',
    red: theme.palette.red?.main || '#FF3030',
    pink: theme.palette.pink?.main || '#E91E63',
    green: theme.palette.green?.main || '#00A76F',
  };
  
  const mainColor = presetColors[primaryColor] || theme.palette.primary.main;
  
  return {
    dark: mainColor,
    main: mainColor,
    light: mainColor,
    lighter: mainColor,
  };
}

export function AnalyticsWidgetSummary({ title, percent, total, chart, sx, ...other }) {
  const theme = useTheme();
  const settings = useSettingsContext();

  // Get chart colors based on current color preset
  const chartColors = getChartColors(settings.primaryColor, theme);

  // Use a single main color across all widgets
  const chartColor = chartColors.main;

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: [chartColor],
    stroke: { width: 0 },
    xaxis: { categories: chart.categories },
    tooltip: {
      y: { formatter: (value) => fNumber(value), title: { formatter: () => '' } },
    },
    plotOptions: { bar: { borderRadius: 1.5, columnWidth: '64%' } },
    ...chart.options,
  });

  const renderTrending = (
    <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      <Iconify
        width={{ xs: 20, sm: 24 }}
        icon={
          percent < 0
            ? 'solar:double-alt-arrow-down-bold-duotone'
            : 'solar:double-alt-arrow-up-bold-duotone'
        }
        sx={{ flexShrink: 0, color: 'success.main', ...(percent < 0 && { color: 'error.main' }) }}
      />

      <Box component="span" sx={{ 
        typography: { xs: 'caption', sm: 'subtitle2' },
        fontSize: { xs: '0.75rem', sm: '0.875rem' }
      }}>
        {percent > 0 && '+'}
        {fPercent(percent)}
      </Box>
      <Tooltip title="last 7 days" arrow>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Iconify
            width={{ xs: 14, sm: 16 }}
            icon="eva:info-outline"
            sx={{ 
              color: 'text.secondary',
              cursor: 'help'
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  );

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: { xs: 2, md: 2.5, lg: 3 },
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ 
          typography: { xs: 'caption', sm: 'subtitle2' },
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        }}>
          {title}
        </Box>
        <Box sx={{ 
          mt: { xs: 1, sm: 1.5 }, 
          mb: { xs: 0.5, sm: 1 }, 
          typography: { xs: 'h5', sm: 'h4', md: 'h3' },
          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
        }}>
          {fNumber(total)}
        </Box>
        {renderTrending}
      </Box>

      <Chart
        type="bar"
        series={[{ data: chart.series }]}
        options={chartOptions}
        width={{ xs: 50, sm: 60 }}
        height={{ xs: 35, sm: 40 }}
      />
    </Card>
  );
} 