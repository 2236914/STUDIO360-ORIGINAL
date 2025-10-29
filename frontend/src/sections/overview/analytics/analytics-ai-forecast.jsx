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

  const loadForecastData = async () => {
    try {
      setLoading(true);
      setError('');

      // Detect server URL
      const base = await detectServerUrl();
      
      // Use Prophet for sophisticated financial forecasting
      const response = await fetch(`${base}/api/analytics/financial-forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          year: new Date().getFullYear(),
          type: selectedType // 'sales' or 'expenses'
        })
      });
      
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to load forecast data');
      }
      
      setForecastData(json.data);
    } catch (e) {
      setError(e.message);
      // Fallback to empty data
      setForecastData({
        actual: Array(12).fill(0),
        forecast: Array(6).fill(0),
        confidence: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const detectServerUrl = async () => {
    try {
      const cached = sessionStorage.getItem('serverUrl:detected');
      if (cached) return cached;
    } catch (_) {}
    
    const candidates = [
      CONFIG.site.serverUrl,
      typeof window !== 'undefined' ? `${window.location.origin.replace(/:\d+$/, ':3001')}` : null,
      typeof window !== 'undefined' ? `${window.location.origin.replace(/:\d+$/, ':3021')}` : null,
      'http://localhost:3001',
      'http://localhost:3021',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3021',
    ].filter(Boolean);
    
    for (const base of candidates) {
      try {
        const ac = new AbortController();
        const t = setTimeout(() => ac.abort(), 2500);
        const r = await fetch(`${base}/api/health`, { signal: ac.signal });
        clearTimeout(t);
        if (r.ok) {
          try { sessionStorage.setItem('serverUrl:detected', base); } catch (_) {}
          return base;
        }
      } catch (_) {}
    }
    return CONFIG.site.serverUrl;
  };

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
    </Card>
  );
} 