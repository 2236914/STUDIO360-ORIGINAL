'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const SALES_DATA = {
  shopee: [34000, 45000, 30000, 52000, 10000, 32000, 28000, 35000, 42000, 38000, 35000, 25000],
  tiktokShop: [42000, 38000, 22000, 42000, 2000, 15000, 25000, 32000, 42000, 38000, 35000, 32000],
  shopify: [7000, 10500, 8000, 12000, 4000, 6000, 14000, 12000, 16000, 18000, 22000, 25000],
  direct: [15000, 18000, 12000, 22000, 8000, 14000, 16000, 19000, 24000, 22000, 20000, 18000],
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LEGENDS = [
  { name: 'Shopee', color: '#00AB55' },
  { name: 'TikTok Shop', color: '#FF4842' },
  { name: 'Shopify', color: '#1890FF' },
  { name: 'Direct', color: '#FFC107' },
];

export function AnalyticsSalesAnalytics() {
  const theme = useTheme();

  const chartOptions = useChart({
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
    colors: ['#00AB55', '#FF4842', '#1890FF', '#FFC107'], // Green, Red, Blue, Yellow
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
    markers: {
      size: 0, // Hide permanent dots
      strokeWidth: 0,
      hover: {
        size: 6, // Show dots only on hover
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
      show: false, // Hide default legend
    },
  });

  const series = [
    {
      name: 'Shopee',
      data: SALES_DATA.shopee,
    },
    {
      name: 'TikTok Shop',
      data: SALES_DATA.tiktokShop,
    },
    {
      name: 'Shopify',
      data: SALES_DATA.shopify,
    },
    {
      name: 'Direct',
      data: SALES_DATA.direct,
    },
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Sales Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            (+43%) than last year
          </Typography>
        </Box>

        <Button
          variant="outlined"
          endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
          sx={{ minWidth: 120 }}
        >
          2023
        </Button>
      </Stack>

      {/* Legends positioned inside the card */}
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

      <Box sx={{ position: 'relative' }}>
        <Chart type="line" series={series} options={chartOptions} height={320} />
      </Box>
    </Card>
  );
} 