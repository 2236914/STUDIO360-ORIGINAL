'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { fNumber, fPercent } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  'Jan+1', 'Feb+1', 'Mar+1', 'Apr+1', 'May+1', 'Jun+1'
];

// Empty dataset placeholders – ready for backend integration
const MOCK_DATA = {
  sales: {
    actual: [],
    forecast: [],
    confidence: [],
    growthRate: 0,
    seasonality: ''
  },
  expenses: {
    actual: [],
    forecast: [],
    confidence: [],
    growthRate: 0,
    seasonality: ''
  },
  profit: {
    actual: [],
    forecast: [],
    confidence: [],
    growthRate: 0,
    seasonality: ''
  },
  inventory: {
    actual: [],
    forecast: [],
    confidence: [],
    growthRate: 0,
    seasonality: ''
  },
  customers: {
    actual: [],
    forecast: [],
    confidence: [],
    growthRate: 0,
    seasonality: ''
  }
};

const FORECAST_METRICS = [
  {
    title: 'Revenue Forecast',
    value: '₱0',
    change: '+0%',
    trend: 'up',
    confidence: 0,
    description: 'Next 6 months projected revenue',
    icon: 'eva:trending-up-fill',
    color: 'success'
  },
  {
    title: 'Expense Forecast',
    value: '₱0',
    change: '+0%',
    trend: 'up',
    confidence: 0,
    description: 'Expected operational costs',
    icon: 'eva:trending-down-fill',
    color: 'warning'
  },
  {
    title: 'Profit Forecast',
    value: '₱0',
    change: '+0%',
    trend: 'up',
    confidence: 0,
    description: 'Projected net profit margin',
    icon: 'eva:pie-chart-fill',
    color: 'info'
  },
  {
    title: 'Customer Growth',
    value: '0',
    change: '+0%',
    trend: 'up',
    confidence: 0,
    description: 'Expected new customers',
    icon: 'eva:people-fill',
    color: 'primary'
  }
];

const RISK_FACTORS = [];

const SCENARIOS = [];

export function AnalyticsForecastingComprehensive() {
  const theme = useTheme();
  const [selectedMetric, setSelectedMetric] = useState('sales');
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const currentData = MOCK_DATA[selectedMetric];
  const isSales = selectedMetric === 'sales';

  const chartOptions = useChart({
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
    colors: ['#00AB55', '#FF4842', '#1890FF'],
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
      width: 3,
      curve: 'smooth',
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: {
        size: 8,
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
      name: `Actual ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`,
      data: [...(currentData.actual || []), ...Array(6).fill(null)],
    },
    {
      name: `Forecast ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`,
      data: [...Array(12).fill(null), ...(currentData.forecast || [])],
    },
    {
      name: 'Confidence Interval',
      data: [
        ...Array(12).fill(null),
        ...((currentData.forecast || []).map((val, i) =>
          val * (1 + ((currentData.confidence || [])[i] || 0) / 100)
        ))
      ],
    },
  ];

  const getTrendIcon = (trend) => trend === 'up' ? 'eva:trending-up-fill' : 'eva:trending-down-fill';

  const getTrendColor = (trend) => trend === 'up' ? 'success.main' : 'error.main';

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Forecasting Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            AI-powered predictions and business insights for the next 6 months
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant={selectedPeriod === '3months' ? 'contained' : 'outlined'}
            onClick={() => setSelectedPeriod('3months')}
            size="small"
          >
            3 Months
          </Button>
          <Button
            variant={selectedPeriod === '6months' ? 'contained' : 'outlined'}
            onClick={() => setSelectedPeriod('6months')}
            size="small"
          >
            6 Months
          </Button>
          <Button
            variant={selectedPeriod === '12months' ? 'contained' : 'outlined'}
            onClick={() => setSelectedPeriod('12months')}
            size="small"
          >
            12 Months
          </Button>
        </Stack>
      </Stack>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {FORECAST_METRICS.map((metric, index) => (
          <Grid key={index} xs={12} sm={6} lg={3}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: `${metric.color}.light`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify 
                    icon={metric.icon} 
                    sx={{ color: `${metric.color}.main`, fontSize: 24 }} 
                  />
                </Box>
                <Chip 
                  label={`${metric.confidence}%`} 
                  size="small" 
                  color={metric.color}
                  variant="outlined"
                />
              </Stack>
              
              <Typography variant="h6" sx={{ mb: 1 }}>
                {metric.value}
              </Typography>
              
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Iconify 
                  icon={getTrendIcon(metric.trend)} 
                  sx={{ color: getTrendColor(metric.trend), fontSize: 16 }} 
                />
                <Typography variant="body2" sx={{ color: getTrendColor(metric.trend), fontWeight: 600 }}>
                  {metric.change}
                </Typography>
              </Stack>
              
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {metric.description}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Forecasting Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} lg={8}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h6">
                {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Forecast
              </Typography>
              
              <Stack direction="row" spacing={1}>
                {Object.keys(MOCK_DATA).map((metric) => (
                  <Button
                    key={metric}
                    variant={selectedMetric === metric ? 'contained' : 'outlined'}
                    onClick={() => setSelectedMetric(metric)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {metric}
                  </Button>
                ))}
              </Stack>
            </Stack>

            {/* Chart Legends */}
            <Stack direction="row" spacing={3} sx={{ mb: 3, justifyContent: 'center' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#00AB55',
                  }}
                />
                <Typography variant="caption">Actual</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#FF4842',
                  }}
                />
                <Typography variant="caption">Forecast</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#1890FF',
                  }}
                />
                <Typography variant="caption">Confidence Interval</Typography>
              </Stack>
            </Stack>

            <Chart type="line" series={series} options={chartOptions} height={400} />

            {/* Forecast Details */}
            <Stack direction="row" spacing={4} sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Growth Rate
                </Typography>
                <Typography variant="h6" sx={{ color: 'success.main' }}>
                  {fPercent(currentData.growthRate || 0)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Seasonality
                </Typography>
                <Typography variant="body2">
                  {currentData.seasonality || ''}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Avg Confidence
                </Typography>
                <Typography variant="h6">
                  {fPercent(
                    (currentData.confidence && currentData.confidence.length)
                      ? currentData.confidence.reduce((a, b) => a + b, 0) / currentData.confidence.length
                      : 0
                  )}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Risk Analysis */}
        <Grid xs={12} lg={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Risk Analysis
            </Typography>
            
            <Stack spacing={2}>
              {RISK_FACTORS.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No risk factors available
                </Typography>
              ) : RISK_FACTORS.map((risk, index) => (
                <Box key={index}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {risk.factor}
                    </Typography>
                    <Chip 
                      label={risk.impact} 
                      size="small" 
                      color={risk.color}
                      variant="outlined"
                    />
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Probability: {risk.probability}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={risk.probability} 
                      sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                      color={risk.color}
                    />
                  </Stack>
                  
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Mitigation: {risk.mitigation}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Scenario Planning */}
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Scenario Planning
            </Typography>
            
            <Grid container spacing={3}>
              {SCENARIOS.length === 0 ? (
                <Grid xs={12}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No scenarios available
                  </Typography>
                </Grid>
              ) : SCENARIOS.map((scenario, index) => (
                <Grid key={index} xs={12} md={4}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: 1,
                      borderColor: `${scenario.color}.main`,
                      bgcolor: `${scenario.color}.lighter`,
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ color: `${scenario.color}.main` }}>
                        {scenario.name}
                      </Typography>
                      <Chip 
                        label={`${scenario.probability}%`} 
                        size="small" 
                        color={scenario.color}
                      />
                    </Stack>
                    
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Revenue:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {scenario.revenue}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Profit:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {scenario.profit}
                        </Typography>
                      </Stack>
                    </Stack>
                    
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {scenario.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* AI Insights Alert */}
      <Alert 
        severity="info" 
        sx={{ mt: 3 }}
        icon={<Iconify icon="eva:bulb-fill" />}
      >
        <Typography variant="body2">
          No forecasting data yet. Connect your data source to see forecasts and insights here.
        </Typography>
      </Alert>
    </Box>
  );
}
