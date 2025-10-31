'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
// Realtime removed in mock-only mode

// ----------------------------------------------------------------------

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  'Jan+1', 'Feb+1', 'Mar+1', 'Apr+1', 'May+1', 'Jun+1'
];

const CONFIG = {
  site: {
    serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'
  }
};

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
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSales = selectedType === 'sales';
  const currentLegends = isSales ? LEGENDS : EXPENSE_LEGENDS;

  useEffect(() => {
    loadForecastData();
  }, [selectedType]);

  // Polling and realtime removed in mock-only mode

  const loadForecastData = async () => {
    try {
      setLoading(true);
      setError('');
      if (process.env.NEXT_PUBLIC_DASHBOARD_MOCK === 'true') {
        const mock = {
          actual: [12000,14500,13200,14800,16000,17200,18000,19000,20500,21000,22500,24000],
          forecast: [25000,26000,27000,28000,29000,30000],
          confidence: 82,
          type: selectedType,
        };
        setForecastData(mock);
        return;
      }
      const res = await fetch(`/api/analytics/financial-forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: new Date().getFullYear(), type: selectedType })
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to load forecast');
      setForecastData(json.data);
    } catch (e) {
      setError(e.message || 'Failed to load');
      setForecastData({ actual: Array(12).fill(0), forecast: Array(6).fill(0), confidence: 0, type: selectedType });
    } finally {
      setLoading(false);
    }
  };

  // Server URL detection removed in mock-only mode

  // Get actual and forecast data from API or fallback to zeros
  const actualData = forecastData?.actual || Array(12).fill(0);
  const forecastDataArray = forecastData?.forecast || Array(6).fill(0);

  // Calculate dynamic Y-axis max based on actual data
  const allDataPoints = [...actualData, ...forecastDataArray].filter(val => val !== null && typeof val === 'number');
  const maxValue = allDataPoints.length > 0 ? Math.max(...allDataPoints) : 100;
  // Add 20% padding to the top
  const yAxisMax = Math.ceil(maxValue * 1.2);
  // Ensure minimum range of at least 100 for better visibility
  const finalMaxValue = Math.max(yAxisMax, 100);

  const chartOptions = useChart({
    chart: {
      type: 'line',
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    colors: ['#00AB55', '#FF4842'],
    xaxis: {
      categories: MONTHS,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '11px',
        },
        rotate: -45,
        rotateAlways: true,
      },
      axisBorder: {
        show: true,
        color: theme.palette.divider,
      },
      axisTicks: {
        show: true,
        color: theme.palette.divider,
      },
    },
    yaxis: {
      min: 0,
      max: finalMaxValue,
      forceNiceScale: true,
      labels: {
        formatter: (value) => fNumber(value),
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '11px',
        },
      },
      title: {
        text: 'Amount (₱)',
        style: {
          color: theme.palette.text.secondary,
          fontSize: '12px',
        },
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: {
        lines: { show: false },
      },
      yaxis: {
        lines: { show: true },
      },
      padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10,
      },
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      strokeColors: ['#fff', '#fff'],
      hover: {
        size: 6,
        strokeWidth: 2,
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `₱${fNumber(value)}`,
      },
      shared: true,
      intersect: false,
    },
    legend: {
      show: false,
    },
  });

  const series = [
    {
      name: isSales ? 'Actual Sales' : 'Actual Expenses',
      data: [...actualData, ...Array(6).fill(null)],
    },
    {
      name: isSales ? 'Forecast Sales' : 'Forecast Expenses',
      data: [...Array(12).fill(null), ...forecastDataArray],
    },
  ];

  // Classification of monthly sales levels (low/consistent/high)
  const classifyLevels = (() => {
    const vals = (actualData || []).filter((v) => typeof v === 'number' && v > 0).slice(0, 12);
    if (vals.length < 3) return [];
    const sorted = [...vals].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    return (actualData || []).slice(0, 12).map((v) => {
      if (v <= q1) return 'Low';
      if (v >= q3) return 'High';
      return 'Consistent';
    });
  })();

  return (
    <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Finance Forecast (Next 6 Months)
        </Typography>

        <Button
          variant="outlined"
          endIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
          onClick={() => setSelectedType(selectedType === 'sales' ? 'expenses' : 'sales')}
          sx={{ minWidth: 120 }}
          disabled={loading}
        >
          {isSales ? 'Sales' : 'Expenses'}
        </Button>
      </Stack>

      {/* Loading State */}
      {loading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Legends positioned at top center */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: 'center' }}>
        {currentLegends.map((legend) => (
          <Stack key={legend.name} direction="row" alignItems="center" spacing={0.5}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: legend.color,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {legend.name}
            </Typography>
          </Stack>
        ))}
        {forecastData?.confidence && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Confidence: {forecastData.confidence}%
            </Typography>
          </Stack>
        )}
      </Stack>

      <Chart type="line" series={series} options={chartOptions} height={320} />

      {/* Sales level legend */}
      {isSales && classifyLevels.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ mr: 1, color: 'text.secondary' }}>Sales Levels:</Typography>
          <Box sx={{ bgcolor: 'warning.lighter', color: 'warning.darker', px: 1, borderRadius: 1 }} component="span">Low</Box>
          <Box sx={{ bgcolor: 'info.lighter', color: 'info.darker', px: 1, borderRadius: 1 }} component="span">Consistent</Box>
          <Box sx={{ bgcolor: 'success.lighter', color: 'success.darker', px: 1, borderRadius: 1 }} component="span">High</Box>
        </Stack>
      )}
    </Card>
  );
} 