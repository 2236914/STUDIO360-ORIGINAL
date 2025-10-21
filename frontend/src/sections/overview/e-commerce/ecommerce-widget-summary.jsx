'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fNumber } from 'src/utils/format-number';

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

export function EcommerceWidgetSummary({ title, percent, total, chart, sx, ...other }) {
  const theme = useTheme();
  const settings = useSettingsContext();

  // Get chart colors based on current color preset
  const chartColors = getChartColors(settings.primaryColor, theme);

  const chartOptions = useChart({
    chart: {
      sparkline: { enabled: true },
    },
    colors: chartColors,
    plotOptions: {
      bar: {
        columnWidth: '60%',
      },
    },
    labels: ['Sales'],
    xaxis: { show: false },
    yaxis: { show: false },
    tooltip: {
      x: { show: false },
    },
  });

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 3 }} {...other}>
      <Box sx={{ flexGrow: 1 }}>
        <Chart type="line" series={[{ data: chart }]} options={chartOptions} height={80} />
      </Box>

      <Box
        sx={{
          ml: 2,
          textAlign: 'right',
        }}
      >
        <Typography variant="h3">{fNumber(total)}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.72 }}>
          {title}
        </Typography>
      </Box>

      <Iconify
        width={52}
        height={52}
        sx={{ color: 'success.main' }}
      >
        {percent > 0 ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
      </Iconify>
    </Card>
  );
} 