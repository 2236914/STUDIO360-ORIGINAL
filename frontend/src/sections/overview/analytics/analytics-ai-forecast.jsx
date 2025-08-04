'use client';

import { useState } from 'react';
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

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  'Jan+1', 'Feb+1', 'Mar+1', 'Apr+1', 'May+1', 'Jun+1'
];

const ACTUAL_SALES = [62000, 68000, 72000, 80000, 65000, 55000, 40000, 45000, 60000, 75000, 80000, 55000];
const FORECAST_SALES = [65000, 70000, 75000, 80000, 85000, 90000];

const ACTUAL_EXPENSES = [45000, 48000, 52000, 58000, 42000, 38000, 32000, 35000, 48000, 55000, 58000, 42000];
const FORECAST_EXPENSES = [48000, 52000, 56000, 60000, 64000, 68000];

const LEGENDS = [
  { name: 'Actual Sales', color: '#00AB55' },
  { name: 'Forecast Sales', color: '#FF4842' },
];

const EXPENSE_LEGENDS = [
  { name: 'Actual Expenses', color: '#00AB55' },
  { name: 'Forecast Expenses', color: '#FF4842' },
];

export function AnalyticsAiForecast() {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState('sales'); // 'sales' or 'expenses'

  const isSales = selectedType === 'sales';
  const currentLegends = isSales ? LEGENDS : EXPENSE_LEGENDS;

  const chartOptions = useChart({
    chart: {
      type: 'line',
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

  const salesSeries = [
    {
      name: 'Actual Sales',
      data: [...ACTUAL_SALES, ...Array(6).fill(null)],
    },
    {
      name: 'Forecast Sales',
      data: [...Array(12).fill(null), ...FORECAST_SALES],
    },
  ];

  const expensesSeries = [
    {
      name: 'Actual Expenses',
      data: [...ACTUAL_EXPENSES, ...Array(6).fill(null)],
    },
    {
      name: 'Forecast Expenses',
      data: [...Array(12).fill(null), ...FORECAST_EXPENSES],
    },
  ];

  const series = isSales ? salesSeries : expensesSeries;

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6">
          AI Forecast (Next 6 Months)
        </Typography>

        <Button
          variant="outlined"
          endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
          onClick={() => setSelectedType(selectedType === 'sales' ? 'expenses' : 'sales')}
          sx={{ minWidth: 120 }}
        >
          {isSales ? 'Sales' : 'Expenses'}
        </Button>
      </Stack>

      {/* Legends positioned at top center */}
      <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
        {currentLegends.map((legend) => (
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

      <Chart type="line" series={series} options={chartOptions} height={280} />
    </Card>
  );
} 