'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const EXPENSE_DATA = [
  { label: 'Supplies', value: 6500, color: '#FF4842' },
  { label: 'Platform Fees', value: 4200, color: '#00B8D9' },
  { label: 'Marketing', value: 3200, color: '#54B435' },
  { label: 'Shipping', value: 1800, color: '#1890FF' },
  { label: 'Other', value: 1196, color: '#FFC107' },
];

const TOTAL_EXPENSE = EXPENSE_DATA.reduce((sum, item) => sum + item.value, 0);

export function AnalyticsExpenseBreakdown() {
  const theme = useTheme();

  const chartOptions = useChart({
    chart: {
      type: 'donut',
      toolbar: { show: false },
    },
    colors: EXPENSE_DATA.map(item => item.color),
    labels: EXPENSE_DATA.map(item => item.label),
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              label: 'Total',
              fontSize: '14px',
              fontWeight: 700,
              color: theme.palette.text.primary,
            },
            value: {
              fontSize: '16px',
              fontWeight: 700,
              color: theme.palette.text.primary,
              formatter: () => fNumber(TOTAL_EXPENSE),
            },
          },
        },
      },
    },
    tooltip: {
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

  const series = EXPENSE_DATA.map(item => item.value);

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        Expense Breakdown
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Monthly expense tracking
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Chart type="donut" series={series} options={chartOptions} height={280} />
      </Box>

      {/* Horizontal Legend */}
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {EXPENSE_DATA.map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={0.5}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: item.color,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
} 