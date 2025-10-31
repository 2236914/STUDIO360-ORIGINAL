'use client';

import { useEffect, useState } from 'react';

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

// Default empty dataset – filled from backend
const EMPTY_DATA = {
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

export function AnalyticsForecastingComprehensive() {
  const theme = useTheme();
  const [selectedMetric, setSelectedMetric] = useState('sales');
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [data, setData] = useState(EMPTY_DATA);
  const [metrics, setMetrics] = useState(FORECAST_METRICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    loadCombinedForecast();
  }, []);

  // Polling and refetch on visibility/focus
  useEffect(() => {
    let intervalId;
    const onVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadCombinedForecast();
      }
    };
    intervalId = setInterval(() => loadCombinedForecast(), 30000);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('focus', onVisibility);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('focus', onVisibility);
      }
    };
  }, []);

  // Removed base URL probing – rely on Next.js proxy rewrites

  const loadCombinedForecast = async () => {
    try {
      setLoading(true);
      setError('');
      // Use mock if explicitly enabled, otherwise fetch real data
      let d;
      const USE_MOCK = process.env.NEXT_PUBLIC_DASHBOARD_MOCK === 'true';
      if (USE_MOCK) {
        d = {
          sales: { actual: [12000,14500,13200,14800,16000,17200,18000,19000,20500,21000,22500,24000], forecast: [25000,26000,27000,28000,29000,30000], confidence: 82, growthRate: 0.12, seasonality: 'Q4 peak' },
          expenses: { actual: [9000,9200,9500,9700,10200,11000,11200,11800,12000,12500,13000,13500], forecast: [13800,14000,14500,14800,15000,15200], confidence: 70, growthRate: 0.05, seasonality: 'Steady' },
        };
      } else {
        const response = await fetch(`/api/analytics/financial-forecast/combined`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: new Date().getFullYear() })
      });
      const json = await response.json();
        if (!response.ok || !json?.success) throw new Error(json?.message || 'Failed to load combined forecast');
        d = json.data || {};
      }
      const nextData = {
        sales: {
          actual: d.sales.actual,
          forecast: d.sales.forecast,
          confidence: Array(d.sales.forecast.length).fill(d.sales.confidence || 0),
          growthRate: d.sales.growthRate || 0,
          seasonality: d.sales.seasonality || ''
        },
        expenses: {
          actual: d.expenses.actual,
          forecast: d.expenses.forecast,
          confidence: Array(d.expenses.forecast.length).fill(d.expenses.confidence || 0),
          growthRate: d.expenses.growthRate || 0,
          seasonality: d.expenses.seasonality || ''
        },
        profit: {
          actual: d.sales.actual.map((v, i) => Number(v || 0) - Number(d.expenses.actual?.[i] || 0)),
          forecast: d.sales.forecast.map((v, i) => Number(v || 0) - Number(d.expenses.forecast?.[i] || 0)),
          confidence: Array(d.sales.forecast.length).fill(Math.min(d.sales.confidence || 0, d.expenses.confidence || 0)),
          growthRate: 0,
          seasonality: ''
        },
        inventory: EMPTY_DATA.inventory,
        customers: EMPTY_DATA.customers,
      };
      setData(nextData);

      const totalSales = (d.sales.actual || []).reduce((s, v) => s + Number(v || 0), 0);
      const totalExpenses = (d.expenses.actual || []).reduce((s, v) => s + Number(v || 0), 0);
      const profitNow = totalSales - totalExpenses;
      // Compute short-term change based on recent average vs next 3-month forecast
      const avgLast3 = (arr) => {
        const last = (arr || []).slice(-3);
        if (!last.length) return 0;
        return last.reduce((s, v) => s + Number(v || 0), 0) / last.length;
      };
      const avgNext3 = (arr) => {
        const first = (arr || []).slice(0, 3);
        if (!first.length) return 0;
        return first.reduce((s, v) => s + Number(v || 0), 0) / first.length;
      };
      const salesChange = ((avgNext3(d.sales.forecast) - avgLast3(d.sales.actual)) / (avgLast3(d.sales.actual) || 1)) * 100;
      const expensesChange = ((avgNext3(d.expenses.forecast) - avgLast3(d.expenses.actual)) / (avgLast3(d.expenses.actual) || 1)) * 100;
      const profitActual = (d.sales.actual || []).map((v, i) => Number(v || 0) - Number(d.expenses.actual?.[i] || 0));
      const profitForecast = (d.sales.forecast || []).map((v, i) => Number(v || 0) - Number(d.expenses.forecast?.[i] || 0));
      const profitChange = ((avgNext3(profitForecast) - avgLast3(profitActual)) / (avgLast3(profitActual) || 1)) * 100;

      setMetrics([
        { ...FORECAST_METRICS[0], value: `₱${fNumber(totalSales)}`, confidence: d.sales.confidence || 0, change: `${salesChange >= 0 ? '+' : ''}${(Math.round(salesChange * 10) / 10)}%`, trend: salesChange >= 0 ? 'up' : 'down' },
        { ...FORECAST_METRICS[1], value: `₱${fNumber(totalExpenses)}`, confidence: d.expenses.confidence || 0, change: `${expensesChange >= 0 ? '+' : ''}${(Math.round(expensesChange * 10) / 10)}%`, trend: expensesChange >= 0 ? 'up' : 'down' },
        { ...FORECAST_METRICS[2], value: `₱${fNumber(profitNow)}`, confidence: Math.min(d.sales.confidence || 0, d.expenses.confidence || 0), change: `${profitChange >= 0 ? '+' : ''}${(Math.round(profitChange * 10) / 10)}%`, trend: profitChange >= 0 ? 'up' : 'down' },
        { ...FORECAST_METRICS[3] },
      ]);

      // Generate simple scenarios based on confidence
      const sum = (arr) => (arr || []).reduce((s, v) => s + Number(v || 0), 0);
      const salesF = d.sales.forecast || [];
      const expF = d.expenses.forecast || [];
      const midRevenue = sum(salesF);
      const midProfit = sum(salesF.map((v, i) => Number(v || 0) - Number(expF[i] || 0)));
      const conf = Math.min(Number(d.sales.confidence || 0), Number(d.expenses.confidence || 0));
      const spread = Math.max(0.05, (100 - conf) / 100);
      const bestRevenue = Math.round(midRevenue * (1 + spread));
      const worstRevenue = Math.round(midRevenue * (1 - spread));
      const bestProfit = Math.round(midProfit * (1 + spread));
      const worstProfit = Math.round(midProfit * (1 - spread));
      setScenarios([
        { name: 'Best Case', color: 'success', probability: Math.max(10, Math.round(conf / 2)), revenue: `₱${fNumber(bestRevenue)}`, profit: `₱${fNumber(bestProfit)}`, description: 'Upside: demand outperforms baseline; costs contained.' },
        { name: 'Most Likely', color: 'info', probability: Math.max(30, Math.round(conf)), revenue: `₱${fNumber(midRevenue)}`, profit: `₱${fNumber(midProfit)}`, description: 'Base case from Prophet forecast.' },
        { name: 'Worst Case', color: 'warning', probability: Math.max(10, 100 - Math.round(conf)), revenue: `₱${fNumber(worstRevenue)}`, profit: `₱${fNumber(worstProfit)}`, description: 'Downside: softer sales or higher expenses.' },
      ]);
    } catch (e) {
      setError(e.message);
      setData(EMPTY_DATA);
      setScenarios([]);
    } finally {
      setLoading(false);
    }
  };

  const currentData = data[selectedMetric];
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
            Finance Forecasting
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
        {metrics.map((metric, index) => (
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
        <Grid xs={12} lg={12}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h6">
                {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Forecast
              </Typography>
              
              <Stack direction="row" spacing={1}>
                {Object.keys(EMPTY_DATA).map((metric) => (
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

        
      </Grid>

      {/* Scenario Planning */}
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Scenario Planning
            </Typography>
            
            <Grid container spacing={3}>
              {scenarios.length === 0 ? (
                <Grid xs={12}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No scenarios available
                  </Typography>
                </Grid>
              ) : scenarios.map((scenario, index) => (
                <Grid key={index} xs={12} md={4}>
                  <Card
                    sx={{
                      position: 'relative',
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      boxShadow: 0,
                      borderLeftWidth: 4,
                      borderLeftStyle: 'solid',
                      borderLeftColor: `${scenario.color}.main`,
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
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>

                    <Stack spacing={1.5} sx={{ mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Revenue
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {scenario.revenue}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Profit
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {scenario.profit}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {scenario.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* AI Insights Alert */}
      {error && (
        <Alert severity="warning" sx={{ mt: 3 }} icon={<Iconify icon="eva:alert-triangle-fill" />}> 
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}
    </Box>
  );
}
