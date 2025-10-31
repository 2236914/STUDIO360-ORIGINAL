'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';

import { fNumber, fPercent } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  'Jan+1', 'Feb+1', 'Mar+1'
];

const CONFIG = {
  site: {
    serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'
  }
};

// Global data cache to prevent duplicate API calls
const dataCache = {
  productData: null,
  categoryData: null,
  inventoryData: null,
  lastFetch: null,
  cacheKey: null
};

// Helper functions for insights charts
const getSalesTrendData = (productData) => {
  if (!productData?.products || productData.products.length === 0) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = months.map(() => Math.floor(Math.random() * 5000) + 2000);
    return [{ name: 'Sales Revenue', data: salesData }];
  }
  
  // Sum up all products' actual sales for each month
  const monthlyTotals = Array(12).fill(0);
  productData.products.forEach(product => {
    if (product.actualSales && Array.isArray(product.actualSales)) {
      product.actualSales.forEach((value, index) => {
        monthlyTotals[index] += value || 0;
      });
    }
  });
  
  return [
    {
      name: 'Sales Revenue',
      data: monthlyTotals,
    },
  ];
};

const getSalesTrendOptions = () => ({
  chart: {
    toolbar: { show: false },
  },
  colors: ['#00AB55'],
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
    },
  },
  tooltip: {
    y: {
      formatter: (value) => fNumber(value),
    },
  },
});

const getConversionData = (productData) => {
  if (!productData?.products || productData.products.length === 0) {
    return [65, 25, 10]; // High, Medium, Low conversion rates
  }
  
  // Calculate conversion rate distribution from actual product data
  let high = 0, medium = 0, low = 0;
  productData.products.forEach(product => {
    const rate = Math.abs(product.conversionRate || 0);
    if (rate > 5) high++;
    else if (rate >= 2) medium++;
    else low++;
  });
  
  return [high, medium, low];
};

const getConversionOptions = () => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
  },
  colors: ['#00AB55', '#FFC107', '#FF4842'],
  labels: ['High (>5%)', 'Medium (2-5%)', 'Low (<2%)'],
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          total: {
            label: 'Avg Conversion',
            fontSize: '14px',
            fontWeight: 700,
          },
          value: {
            fontSize: '16px',
            fontWeight: 700,
            formatter: () => '3.2%',
          },
        },
      },
    },
  },
  legend: {
    position: 'bottom',
  },
});

const getTopPerformersData = (productData) => {
  if (!productData?.products || productData.products.length === 0) {
    return [{ 
      name: 'Sales', 
      data: [19464, 916, 611, 1174, 1465],
      categories: ['WAVE TO EARTH', 'BARBIE SERIES', 'BINI', 'seasons', 'bad']
    }];
  }
  
  // Get top 5 products' total sales
  const sortedProducts = [...productData.products]
    .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
    .slice(0, 5);
  
  return {
    series: [{
      name: 'Sales',
      data: sortedProducts.map(p => p.totalSales || 0),
    }],
    categories: sortedProducts.map(p => p.product.name || 'Unknown Product'),
  };
};

const getTopPerformersOptions = (productNames = ['WAVE TO EARTH', 'BARBIE SERIES', 'BINI', 'seasons', 'bad']) => ({
  chart: {
    toolbar: { show: false },
  },
  colors: ['#1890FF'],
  xaxis: {
    categories: productNames,
    labels: {
      rotate: -45,
      style: {
        fontSize: '11px',
      },
    },
  },
  plotOptions: {
    bar: {
      columnWidth: '70%',
      borderRadius: 4,
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (value) => fNumber(value),
    offsetY: -20,
    style: {
      fontSize: '11px',
      colors: ['#304758'],
    },
  },
  tooltip: {
    y: {
      formatter: (value) => `₱${fNumber(value)}`,
    },
  },
});

const getSeasonalData = (productData) => {
  if (!productData?.products || productData.products.length === 0) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const seasonalPattern = months.map((_, i) => {
      const baseValue = 1000;
      const seasonalFactor = 1 + 0.5 * Math.sin((i / 12) * 2 * Math.PI);
      return Math.floor(baseValue * seasonalFactor * (0.8 + Math.random() * 0.4));
    });
    return [{ name: 'Seasonal Sales', data: seasonalPattern }];
  }
  
  // Sum up all products' actual sales for seasonal pattern
  const monthlyTotals = Array(12).fill(0);
  productData.products.forEach(product => {
    if (product.actualSales && Array.isArray(product.actualSales)) {
      product.actualSales.forEach((value, index) => {
        monthlyTotals[index] += value || 0;
      });
    }
  });
  
  return [{
    name: 'Seasonal Sales',
    data: monthlyTotals,
  }];
};

const getSeasonalOptions = () => ({
  chart: {
    toolbar: { show: false },
  },
  colors: ['#7635dc'],
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  tooltip: {
    y: {
      formatter: (value) => fNumber(value),
    },
  },
});

const getTotalRevenue = (productData) => {
  if (!productData?.products || productData.products.length === 0) {
    return '₱0';
  }
  const total = productData.products.reduce((sum, p) => sum + (p.totalSales || 0), 0);
  return `₱${total.toLocaleString()}`;
};

const getAvgConversionRate = (productData) => {
  if (!productData?.products || productData.products.length === 0) {
    return '0';
  }
  const avg = productData.products.reduce((sum, p) => sum + Math.abs(p.conversionRate || 0), 0) / productData.products.length;
  return avg.toFixed(1);
};

const getTotalUnits = (productData) => {
  if (!productData?.products || productData.products.length === 0) {
    return '0';
  }
  const total = productData.products.reduce((sum, p) => sum + (p.avgMonthlySales || 0), 0);
  return total.toLocaleString();
};

const getGrowthRate = (productData) => {
  if (!productData?.products || productData.products.length === 0) {
    return '0';
  }
  const avg = productData.products.reduce((sum, p) => sum + (p.growthRate || 0), 0) / productData.products.length;
  return avg.toFixed(1);
};

export function AnalyticsProductPerformance({ hideHeader = false, showTableOnly = false, showChartOnly = false }) {
  const theme = useTheme();
  const [selectedView, setSelectedView] = useState('products'); // 'products', 'categories', 'inventory'
  const [dataSource, setDataSource] = useState('unified'); // 'unified', 'shopee', 'studio360'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year by default
  const [productData, setProductData] = useState(dataCache.productData);
  const [categoryData, setCategoryData] = useState(dataCache.categoryData);
  const [inventoryData, setInventoryData] = useState(dataCache.inventoryData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Available years (current year and previous years)
  const availableYears = [2025, 2024, 2023, 2022];

  useEffect(() => {
    loadData();
  }, [selectedView, dataSource, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Create cache key
      const cacheKey = `${selectedView}-${dataSource}-${selectedYear}`;
      
      // Check if we have cached data for this request
      if (dataCache.cacheKey === cacheKey && dataCache.lastFetch && 
          (Date.now() - dataCache.lastFetch) < 30000) { // 30 second cache
        console.log('Using cached data for:', cacheKey);
        if (selectedView === 'products') setProductData(dataCache.productData);
        else if (selectedView === 'categories') setCategoryData(dataCache.categoryData);
        else if (selectedView === 'inventory') setInventoryData(dataCache.inventoryData);
        setLoading(false);
        return;
      }

      if (process.env.NEXT_PUBLIC_DASHBOARD_MOCK === 'true') {
        // Populate mock datasets
        const mk = (i)=>({ id:`p${i}`, name:`Product ${i+1}`, category:'General' });
        const products = Array.from({length:10},(_,i)=>({
          product: mk(i), totalSales: 1000 + i*500, growthRate: (i%5)-1,
          avgMonthlySales: 80 + i*5, conversionRate: 2 + (i%4), seasonality: 'Stable',
          actualSales: [120,140,130,150,160,170,180,190,200,210,220,230], forecast: [240,250,260], confidence: 80 - i,
        }));
        const categories = [
          { category: { id:'c1', name:'Apparel', productCount: 25 }, totalRevenue: 120000, growthRate: 6, seasonality: 'Q4 peak', actualRevenue: [9,10,11,12,13,14,15,16,17,18,19,20], forecast: [21,22,23], confidence: 78 },
          { category: { id:'c2', name:'Accessories', productCount: 18 }, totalRevenue: 80000, growthRate: 3, seasonality: 'Steady', actualRevenue: [5,6,6,7,7,8,8,8,9,9,10,10], forecast: [10,11,11], confidence: 72 },
        ];
        const inv = { summary: { totalProducts: 120, urgentReorders: 6, lowStockCount: 12, avgDaysSupply: 24 }, inventory: [] };
        dataCache.productData = { year: selectedYear, products, summary: { totalProducts: products.length } };
        dataCache.categoryData = { year: selectedYear, categories };
        dataCache.inventoryData = inv;
        dataCache.cacheKey = cacheKey;
        dataCache.lastFetch = Date.now();
        if (selectedView === 'products') setProductData(dataCache.productData);
        else if (selectedView === 'categories') setCategoryData(dataCache.categoryData);
        else if (selectedView === 'inventory') setInventoryData(dataCache.inventoryData);
        setLoading(false);
        return;
      }

      // Real API paths
      if (selectedView === 'products') {
        const response = await fetch(`/api/analytics/products/forecast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year: selectedYear, limit: 10, dataSource })
        });
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.message || 'Failed to load product data');
        dataCache.productData = json.data;
        dataCache.cacheKey = cacheKey;
        dataCache.lastFetch = Date.now();
        setProductData(json.data);
      } else if (selectedView === 'categories') {
        const response = await fetch(`/api/analytics/products/categories/forecast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year: selectedYear })
        });
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.message || 'Failed to load category data');
        dataCache.categoryData = json.data;
        dataCache.cacheKey = cacheKey;
        dataCache.lastFetch = Date.now();
        setCategoryData(json.data);
      } else if (selectedView === 'inventory') {
        const response = await fetch(`/api/analytics/products/inventory/forecast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year: selectedYear })
        });
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.message || 'Failed to load inventory data');
        dataCache.inventoryData = json.data;
        dataCache.cacheKey = cacheKey;
        dataCache.lastFetch = Date.now();
        setInventoryData(json.data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Removed base URL probing – rely on Next.js proxy rewrites

  const chartOptions = useChart({
    chart: {
      type: 'area',
      toolbar: { show: false },
    },
    colors: ['#00AB55', '#FF4842', '#E3F2FD', '#E3F2FD'],
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
      width: [3, 3, 0, 0], // Main lines thick, confidence bounds invisible stroke
      curve: 'smooth',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    markers: {
      size: [4, 4, 0, 0], // Only show markers on main lines
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
      shared: true,
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      markers: {
        radius: 4,
      },
    },
  });

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getGrowthColor = (growthRate) => {
    if (growthRate > 10) return 'success';
    if (growthRate > 0) return 'info';
    if (growthRate > -10) return 'warning';
    return 'error';
  };

  const renderProductView = () => {
    if (!productData || !productData.products || productData.products.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No product data available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Import your Shopee data to see product forecasts
          </Typography>
        </Box>
      );
    }


    const topProduct = productData.products[0];
    
    // Safety check for data structure
    if (!topProduct || !topProduct.actualSales || !topProduct.forecast) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Product data format error
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Expected: actualSales, forecast arrays
          </Typography>
        </Box>
      );
    }
    
    // Generate confidence intervals for forecast
    const generateConfidenceInterval = (forecastData, confidenceLevel = 0.95) => {
      return forecastData.map(value => {
        const margin = value * 0.15; // 15% margin for 95% confidence
        return [value - margin, value + margin];
      });
    };

    const confidenceInterval = generateConfidenceInterval(topProduct.forecast);

    const series = [
      {
        name: 'Actual Sales',
        data: [...topProduct.actualSales, ...Array(3).fill(null)],
      },
      {
        name: 'Forecast',
        data: [...Array(12).fill(null), ...topProduct.forecast],
      },
      {
        name: 'Confidence Interval',
        data: [...Array(12).fill(null), ...confidenceInterval],
        type: 'area',
        fill: 'gradient',
      },
    ];

    // If showTableOnly is true, only render the table
    if (showTableOnly) {
      return (
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 3, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Top Products Performance
          </Typography>
          
          <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: { xs: '150px', sm: 'auto' } }}>Product</TableCell>
                  <TableCell align="right" sx={{ minWidth: '80px' }}>Growth</TableCell>
                  <TableCell align="right" sx={{ minWidth: '80px' }}>Sales</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productData.products && productData.products.length > 0 ? productData.products.slice(0, 5).map((item, index) => (
                  <TableRow key={`${item.product.id || 'product'}-${index}`}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.product.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.product.category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={fPercent(item.growthRate)} 
                        size="small" 
                        color={getGrowthColor(item.growthRate)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {fNumber(item.totalSales)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No product data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      );
    }
    
    // If showChartOnly is true, only render the chart
    if (showChartOnly) {
      return (
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            alignItems={{ xs: 'flex-start', sm: 'center' }} 
            justifyContent="space-between" 
            sx={{ mb: 3, gap: 1 }}
          >
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Top Product Performance
            </Typography>
            <Chip 
              label={`${topProduct.confidence}% confidence`} 
              color="success" 
              variant="outlined" 
              size="small"
            />
          </Stack>

          <Chart 
            type="area" 
            series={series} 
            options={chartOptions} 
            height={{ xs: 250, sm: 300 }} 
          />

          {/* Product Metrics - Responsive Grid */}
          <Grid container spacing={2} sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Grid xs={6} sm={3}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Growth Rate
                </Typography>
                <Typography variant="h6" sx={{ color: `${getGrowthColor(topProduct.growthRate)}.main` }}>
                  {fPercent(topProduct.growthRate)}
                </Typography>
              </Box>
            </Grid>
            <Grid xs={6} sm={3}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Total Sales
                </Typography>
                <Typography variant="h6">
                  {fNumber(topProduct.totalSales)} units
                </Typography>
              </Box>
            </Grid>
            <Grid xs={6} sm={3}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Avg Monthly
                </Typography>
                <Typography variant="h6">
                  {fNumber(topProduct.avgMonthlySales)} units
                </Typography>
              </Box>
            </Grid>
            <Grid xs={6} sm={3}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Seasonality
                </Typography>
                <Typography variant="body2">
                  {topProduct.seasonality}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      );
    }
    
    // Full view with chart and table
    return (
      <Grid container spacing={3}>
        {/* Top Product Chart */}
        <Grid xs={12} lg={8}>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              justifyContent="space-between" 
              sx={{ mb: 3, gap: 1 }}
            >
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Top Product Performance
              </Typography>
              <Chip 
                label={`${topProduct.confidence}% confidence`} 
                color="success" 
                variant="outlined" 
                size="small"
              />
            </Stack>


            <Chart 
              type="area" 
              series={series} 
              options={chartOptions} 
              height={{ xs: 250, sm: 300 }} 
            />

            {/* Product Metrics - Responsive Grid */}
            <Grid container spacing={2} sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Grid xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Growth Rate
                  </Typography>
                  <Typography variant="h6" sx={{ color: `${getGrowthColor(topProduct.growthRate)}.main` }}>
                    {fPercent(topProduct.growthRate)}
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Total Sales
                  </Typography>
                  <Typography variant="h6">
                    {fNumber(topProduct.totalSales)} units
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Avg Monthly
                  </Typography>
                  <Typography variant="h6">
                    {fNumber(topProduct.avgMonthlySales)} units
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Seasonality
                  </Typography>
                  <Typography variant="body2">
                    {topProduct.seasonality}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Top Products Table */}
        <Grid xs={12} lg={4}>
          <Card sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Top Products Performance
            </Typography>
            
            <TableContainer 
              component={Paper} 
              elevation={0} 
              sx={{ 
                overflowX: 'auto',
                overflowY: 'auto',
                maxHeight: '400px',
                flex: 1
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: { xs: '150px', sm: 'auto' } }}>Product</TableCell>
                    <TableCell align="right" sx={{ minWidth: '80px' }}>Growth</TableCell>
                    <TableCell align="right" sx={{ minWidth: '80px' }}>Sales</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productData.products && productData.products.length > 0 ? productData.products.map((item, index) => (
                    <TableRow key={`${item.product.id || 'product'}-${index}`}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.product.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {item.product.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={fPercent(item.growthRate)} 
                          size="small" 
                          color={getGrowthColor(item.growthRate)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {fNumber(item.totalSales)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No product data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderCategoryView = () => {
    if (!categoryData) return null;

    const topCategory = categoryData.categories[0];
    const series = [
      {
        name: 'Actual Revenue',
        data: [...topCategory.actualRevenue, ...Array(3).fill(null)],
      },
      {
        name: 'Forecast',
        data: [...Array(12).fill(null), ...topCategory.forecast],
      },
    ];

    return (
      <Grid container spacing={3}>
        {/* Top Category Chart */}
        <Grid xs={12} lg={8}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h6">
                Top Category: {topCategory.category.name}
              </Typography>
              <Chip 
                label={`${topCategory.confidence}% confidence`} 
                color="success" 
                variant="outlined" 
              />
            </Stack>

            <Chart type="line" series={series} options={chartOptions} height={300} />

            {/* Category Metrics */}
            <Stack direction="row" spacing={4} sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Growth Rate
                </Typography>
                <Typography variant="h6" sx={{ color: `${getGrowthColor(topCategory.growthRate)}.main` }}>
                  {fPercent(topCategory.growthRate)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Total Revenue
                </Typography>
                <Typography variant="h6">
                  ₱{fNumber(topCategory.totalRevenue)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Products
                </Typography>
                <Typography variant="h6">
                  {topCategory.category.productCount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Seasonality
                </Typography>
                <Typography variant="body2">
                  {topCategory.seasonality}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Categories Table */}
        <Grid xs={12} lg={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Category Performance
            </Typography>
            
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Growth</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryData.categories.map((item, index) => (
                    <TableRow key={item.category.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.category.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {item.category.productCount} products
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={fPercent(item.growthRate)} 
                          size="small" 
                          color={getGrowthColor(item.growthRate)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ₱{fNumber(item.totalRevenue)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderInventoryView = () => {
    if (!inventoryData || !inventoryData.inventory) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No inventory data available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Inventory forecasting data will appear here when available
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {/* Inventory Summary Cards */}
        <Grid xs={12}>
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
            <Grid xs={6} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: { xs: 2, sm: 2.5, md: 3 },
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    transform: 'translate(20px, -20px)'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative', zIndex: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                      Total Products
                    </Typography>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }, fontWeight: 700, mt: 0.5 }}>
                      {inventoryData.summary?.totalProducts || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: { xs: 40, sm: 48 }, 
                    height: { xs: 40, sm: 48 }, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Iconify icon="eva:cube-fill" sx={{ color: 'white', fontSize: { xs: 20, sm: 24 } }} />
                  </Box>
                </Stack>
              </Card>
            </Grid>
            <Grid xs={6} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: { xs: 2, sm: 2.5, md: 3 },
                  height: '100%',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    transform: 'translate(20px, -20px)'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative', zIndex: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                      Urgent Reorders
                    </Typography>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }, fontWeight: 700, mt: 0.5 }}>
                      {inventoryData.summary?.urgentReorders || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: { xs: 40, sm: 48 }, 
                    height: { xs: 40, sm: 48 }, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Iconify icon="eva:alert-triangle-fill" sx={{ color: 'white', fontSize: { xs: 20, sm: 24 } }} />
                  </Box>
                </Stack>
              </Card>
            </Grid>
            <Grid xs={6} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: { xs: 2, sm: 2.5, md: 3 },
                  height: '100%',
                  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                  color: '#8B4513',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    transform: 'translate(20px, -20px)'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative', zIndex: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(139,69,19,0.7)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                      Low Stock Items
                    </Typography>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }, fontWeight: 700, mt: 0.5 }}>
                      {inventoryData.summary?.lowStockCount || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: { xs: 40, sm: 48 }, 
                    height: { xs: 40, sm: 48 }, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.3)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Iconify icon="eva:trending-down-fill" sx={{ color: '#8B4513', fontSize: { xs: 20, sm: 24 } }} />
                  </Box>
                </Stack>
              </Card>
            </Grid>
            <Grid xs={6} sm={6} md={3}>
              <Card 
                sx={{ 
                  p: { xs: 2, sm: 2.5, md: 3 },
                  height: '100%',
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  color: '#2D5016',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    transform: 'translate(20px, -20px)'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ position: 'relative', zIndex: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(45,80,22,0.7)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>
                      Avg Days Supply
                    </Typography>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }, fontWeight: 700, mt: 0.5 }}>
                      {inventoryData.summary?.avgDaysSupply || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: { xs: 40, sm: 48 }, 
                    height: { xs: 40, sm: 48 }, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(255,255,255,0.3)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Iconify icon="eva:clock-fill" sx={{ color: '#2D5016', fontSize: { xs: 20, sm: 24 } }} />
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Inventory Forecast Table */}
        <Grid xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 3, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Inventory Forecast Alerts
            </Typography>
            
            <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: { xs: '120px', sm: 'auto' } }}>Product</TableCell>
                    <TableCell align="center" sx={{ minWidth: '80px' }}>Current Stock</TableCell>
                    <TableCell align="center" sx={{ minWidth: '100px' }}>Forecasted Demand</TableCell>
                    <TableCell align="center" sx={{ minWidth: '100px' }}>Recommended Stock</TableCell>
                    <TableCell align="center" sx={{ minWidth: '100px' }}>Days Supply</TableCell>
                    <TableCell align="center" sx={{ minWidth: '80px' }}>Urgency</TableCell>
                    <TableCell align="center" sx={{ minWidth: '80px' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryData.inventory && inventoryData.inventory.length > 0 ? inventoryData.inventory.map((item, index) => (
                    <TableRow key={`${item.product.id}-${index}`}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.product.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            SKU: {item.product.sku}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {item.product.currentStock}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {item.forecastedDemand?.join(', ') || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {item.recommendedStock || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {item.daysSupply || 'N/A'} days
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={item.urgency || 'Unknown'} 
                          size="small" 
                          color={getUrgencyColor(item.urgency)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined">
                          Reorder
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No inventory data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      {/* Header - Only show if not hidden */}
      {!hideHeader && (
        <Box sx={{ mb: 4 }}>
          {/* Title Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ mb: 1, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
              Product Performance Forecast
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {selectedYear > new Date().getFullYear() 
                  ? `AI-powered forecasts and predictions for` 
                  : `Historical performance data for`
                }
              </Typography>
              <Chip 
                label={selectedYear} 
                color={selectedYear > new Date().getFullYear() ? "warning" : "primary"} 
                variant={selectedYear > new Date().getFullYear() ? "filled" : "outlined"}
                size="small"
              />
              {selectedYear > new Date().getFullYear() && (
                <Chip 
                  label="FORECAST" 
                  color="warning" 
                  variant="filled" 
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
          </Box>
          
          {/* Controls Section - Responsive Layout */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 2, sm: 1 }} 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            sx={{ flexWrap: 'wrap', gap: 2 }}
          >
            {/* View Toggle */}
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button
                variant={selectedView === 'products' ? 'contained' : 'outlined'}
                onClick={() => setSelectedView('products')}
                size="small"
                sx={{ minWidth: { xs: '80px', sm: 'auto' } }}
              >
                Products
              </Button>
              <Button
                variant={selectedView === 'categories' ? 'contained' : 'outlined'}
                onClick={() => setSelectedView('categories')}
                size="small"
                sx={{ minWidth: { xs: '80px', sm: 'auto' } }}
              >
                Categories
              </Button>
              <Button
                variant={selectedView === 'inventory' ? 'contained' : 'outlined'}
                onClick={() => setSelectedView('inventory')}
                size="small"
                sx={{ minWidth: { xs: '80px', sm: 'auto' } }}
              >
                Inventory
              </Button>
            </Stack>

            {/* Data Source Toggle */}
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button
                variant={dataSource === 'unified' ? 'contained' : 'outlined'}
                onClick={() => setDataSource('unified')}
                size="small"
                color="primary"
                sx={{ minWidth: { xs: '80px', sm: 'auto' } }}
              >
                All Sources
              </Button>
              <Button
                variant={dataSource === 'shopee' ? 'contained' : 'outlined'}
                onClick={() => setDataSource('shopee')}
                size="small"
                color="secondary"
                sx={{ minWidth: { xs: '80px', sm: 'auto' } }}
              >
                Shopee
              </Button>
              <Button
                variant={dataSource === 'studio360' ? 'contained' : 'outlined'}
                onClick={() => setDataSource('studio360')}
                size="small"
                color="info"
                sx={{ minWidth: { xs: '80px', sm: 'auto' } }}
              >
                Studio360
              </Button>
            </Stack>

            {/* Year Toggle */}
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {availableYears.map((year) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? 'contained' : 'outlined'}
                  onClick={() => setSelectedYear(year)}
                  size="small"
                  color="warning"
                  sx={{ minWidth: { xs: '60px', sm: 'auto' } }}
                >
                  {year}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Content */}
      {selectedView === 'products' && renderProductView()}
      {selectedView === 'categories' && renderCategoryView()}
      {selectedView === 'inventory' && renderInventoryView()}

      {/* Additional Insights Section */}
      {!hideHeader && (
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {/* Sales Trend Analysis */}
            <Grid xs={12} lg={8}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Sales Trend Analysis
                </Typography>
                <Chart 
                  type="area" 
                  series={getSalesTrendData(productData)} 
                  options={getSalesTrendOptions()} 
                  height={280} 
                />
              </Card>
            </Grid>

            {/* Conversion Rate Breakdown */}
            <Grid xs={12} lg={4}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Conversion Performance
                </Typography>
                <Chart 
                  type="donut" 
                  series={getConversionData(productData)} 
                  options={getConversionOptions()} 
                  height={280} 
                />
              </Card>
            </Grid>

            {/* Seasonal Pattern Analysis */}
            <Grid xs={12} lg={9}>
              <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Seasonal Pattern Analysis
                </Typography>
                <Chart 
                  type="line" 
                  series={getSeasonalData(productData)} 
                  options={getSeasonalOptions()} 
                  height={280} 
                />
                <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Iconify icon="eva:bulb-fill" width={16} sx={{ color: 'primary.main' }} />
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      AI Insights
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Based on the seasonal pattern analysis, the data shows strong sales performance in the early months with a peak in February. The trend suggests a significant decline towards the end of the year, indicating potential opportunities for strategic marketing campaigns during slower periods.
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Performance Metrics */}
            <Grid xs={12} lg={3}>
              <Stack spacing={2}>
                {/* Total Revenue KPI */}
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: '#1E293B',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      opacity: 0.1,
                      transform: 'rotate(15deg)',
                    }}
                  >
                    <Iconify icon="eva:trending-up-fill" width={100} height={100} />
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={2.5}>
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box
                        sx={{
                          width: 70,
                          height: 70,
                          borderRadius: '50%',
                          background: `conic-gradient(${theme.palette.primary.main} 180deg, rgba(255,255,255,0.1) 0deg)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            bgcolor: '#1E293B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 700, fontSize: '0.75rem' }}>
                            50%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 0.5, fontSize: '1.25rem' }}>
                        {getTotalRevenue(productData)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Total Revenue
                      </Typography>
                    </Box>
                  </Stack>
                </Card>

                {/* Avg Conversion KPI */}
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: '#1E293B',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      opacity: 0.1,
                      transform: 'rotate(15deg)',
                    }}
                  >
                    <Iconify icon="eva:activity-fill" width={100} height={100} />
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={2.5}>
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box
                        sx={{
                          width: 70,
                          height: 70,
                          borderRadius: '50%',
                          background: `conic-gradient(${theme.palette.success.main} 120deg, rgba(255,255,255,0.1) 0deg)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            bgcolor: '#1E293B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 700, fontSize: '0.75rem' }}>
                            {getAvgConversionRate(productData)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 0.5, fontSize: '1.25rem' }}>
                        {getAvgConversionRate(productData)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Avg Conversion
                      </Typography>
                    </Box>
                  </Stack>
                </Card>

                {/* Units Sold KPI */}
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: '#1E293B',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      opacity: 0.1,
                      transform: 'rotate(15deg)',
                    }}
                  >
                    <Iconify icon="eva:shopping-cart-fill" width={100} height={100} />
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={2.5}>
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box
                        sx={{
                          width: 70,
                          height: 70,
                          borderRadius: '50%',
                          background: `conic-gradient(${theme.palette.warning.main} 150deg, rgba(255,255,255,0.1) 0deg)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            bgcolor: '#1E293B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="body2" sx={{ color: theme.palette.warning.main, fontWeight: 700, fontSize: '0.75rem' }}>
                            {getTotalUnits(productData)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 0.5, fontSize: '1.25rem' }}>
                        {getTotalUnits(productData)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Units Sold
                      </Typography>
                    </Box>
                  </Stack>
                </Card>

                {/* Growth Rate KPI */}
                <Card
                  sx={{
                    p: 2.5,
                    bgcolor: '#1E293B',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      opacity: 0.1,
                      transform: 'rotate(15deg)',
                    }}
                  >
                    <Iconify icon="eva:trending-up-fill" width={100} height={100} />
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={2.5}>
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box
                        sx={{
                          width: 70,
                          height: 70,
                          borderRadius: '50%',
                          background: `conic-gradient(${theme.palette.info.main} 90deg, rgba(255,255,255,0.1) 0deg)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            bgcolor: '#1E293B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="body2" sx={{ color: theme.palette.info.main, fontWeight: 700, fontSize: '0.75rem' }}>
                            {getGrowthRate(productData)}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 0.5, fontSize: '1.25rem' }}>
                        {getGrowthRate(productData)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Growth Rate
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}
