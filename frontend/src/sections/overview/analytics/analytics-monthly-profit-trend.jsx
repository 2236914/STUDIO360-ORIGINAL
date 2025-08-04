'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SALES_DATA = [125000, 140000, 110000, 140000, 100000, 130000, 120000, 150000, 165000, 130000, 145000, 135000];
const EXPENSES_DATA = [45000, 55000, 40000, 65000, 25000, 40000, 35000, 50000, 60000, 30000, 45000, 35000];

const LEGENDS = [
  { name: 'Sales', color: '#00AB55' },
  { name: 'Expenses', color: '#FF4842' },
];

export function AnalyticsMonthlyProfitTrend() {
  const theme = useTheme();

  const chartOptions = useChart({
    chart: {
      type: 'area',
      toolbar: { show: false },
    },
    colors: ['#00AB55', '#FF4842'],
    xaxis: {
      categories: MONTHS,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => fNumber(value),
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.3,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    markers: {
      size: 0,
      strokeWidth: 0,
      hover: {
        size: 6,
        strokeWidth: 2,
        strokeColors: theme.palette.background.paper,
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => fNumber(value),
        title: {
          formatter: () => '',
        },
      },
    },
    legend: {
      show: false,
    },
  });

  const series = [
    {
      name: 'Sales',
      data: SALES_DATA,
    },
    {
      name: 'Expenses',
      data: EXPENSES_DATA,
    },
  ];

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Monthly Profit Trend
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Profit analysis over 6 months
          </Typography>
        </Box>

        <Button
          variant="outlined"
          endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
          sx={{ minWidth: 120 }}
        >
          2024
        </Button>
      </Stack>

      {/* Legends positioned horizontally */}
      <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'flex-end' }}>
        {LEGENDS.map((legend) => (
          <Stack key={legend.name} direction="row" alignItems="center" spacing={0.5}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: legend.color,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary' }}>
              {legend.name}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Chart type="area" series={series} options={chartOptions} height={280} />
    </Card>
  );
} 