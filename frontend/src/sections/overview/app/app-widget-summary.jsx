'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fNumber, fPercent } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

// Function to get chart colors based on color preset
function getChartColors(primaryColor, theme) {
  // If using primary color preset, use dark-main-light-lighter colors
  if (primaryColor === 'default') {
    return [
      theme.palette.primary.dark,
      theme.palette.primary.main,
      theme.palette.primary.light,
      theme.palette.primary.lighter,
    ];
  }
  
  // For custom color presets, use the preset colors
  const presetColors = {
    cyan: theme.palette.cyan?.main || '#078DEE',
    purple: theme.palette.purple?.main || '#7635dc',
    blue: theme.palette.blue?.main || '#0C68E9',
    orange: theme.palette.orange?.main || '#fda92d',
    red: theme.palette.red?.main || '#FF3030',
  };
  
  return [presetColors[primaryColor] || theme.palette.primary.main];
}

export function AppWidgetSummary({ title, percent, total, chart, sx, ...other }) {
  const theme = useTheme();
  const settings = useSettingsContext();

  // Get chart colors based on current color preset
  const chartColors = getChartColors(settings.primaryColor, theme);

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    colors: chartColors,
    plotOptions: {
      bar: {
        columnWidth: '60%',
      },
    },
    labels: chart.labels,
    xaxis: {
      type: 'datetime',
    },
    tooltip: {
      x: {
        format: 'yyyy/MM/dd HH:mm',
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: chartColors,
        inverseColors: true,
        opacityFrom: 0.8,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
  });

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 3 }} {...other}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2, mb: 1 }}>
          <Iconify
            width={24}
            height={24}
            icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'}
          />
          <Typography component="span" variant="subtitle2">
            {fPercent(percent)}
          </Typography>
        </Stack>

        <Typography variant="h3">{fNumber(total)}</Typography>
      </Box>

      <Chart type="line" series={[{ data: chart.series }]} options={chartOptions} height={100} />
    </Card>
  );
} 