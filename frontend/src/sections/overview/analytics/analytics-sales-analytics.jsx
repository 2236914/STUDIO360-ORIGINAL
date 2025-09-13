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
  studio360: [12000, 15000, 13000, 20000, 8000, 14000, 16000, 17000, 19000, 21000, 23000, 22000],
  shopee: [34000, 45000, 30000, 52000, 10000, 32000, 28000, 35000, 42000, 38000, 35000, 25000],
  tiktokShop: [42000, 38000, 22000, 42000, 2000, 15000, 25000, 32000, 42000, 38000, 35000, 32000],
  shopify: [7000, 10500, 8000, 12000, 4000, 6000, 14000, 12000, 16000, 18000, 22000, 25000],
  direct: [15000, 18000, 12000, 22000, 8000, 14000, 16000, 19000, 24000, 22000, 20000, 18000],
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Legends will be computed from theme inside the component

export function AnalyticsSalesAnalytics() {
  const theme = useTheme();

  // Color mapping per requirement
  const COLORS = {
    primary360: theme.palette.primary?.main || '#2065D1',
    shopee: theme.palette.orange?.main || '#fda92d',
    tiktok: theme.palette.pink?.main || '#E91E63',
    shopify: theme.palette.green?.main || '#00A76F',
    other: theme.palette.purple?.main || '#7635dc',
  };

  const chartOptions = useChart({
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
    // Series order: 360 (primary), Shopee (orange), TikTok (pink), Shopify (green), Other (purple)
    colors: [COLORS.primary360, COLORS.shopee, COLORS.tiktok, COLORS.shopify, COLORS.other],
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
      name: '360',
      data: SALES_DATA.studio360,
    },
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
      name: 'Other',
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
        {[{ name: '360', color: COLORS.primary360 }, { name: 'Shopee', color: COLORS.shopee }, { name: 'TikTok Shop', color: COLORS.tiktok }, { name: 'Shopify', color: COLORS.shopify }, { name: 'Other', color: COLORS.other }].map((legend) => (
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