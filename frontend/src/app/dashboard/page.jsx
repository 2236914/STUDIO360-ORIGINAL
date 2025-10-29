
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { 
  AnalyticsKpiCards,
  AnalyticsAiForecast,
  AnalyticsWidgetSummary,
  AnalyticsSalesAnalytics,
  AnalyticsMonthlyProfitTrend,
  AnalyticsProductPerformance,
  AnalyticsTaxableIncome
} from 'src/sections/overview/analytics';
import { _analyticsWidgets } from 'src/_mock/_overview';

// ----------------------------------------------------------------------

export const metadata = { title: `Dashboard - Kitsch Studio` };

export default async function Page() {
  const widgets = await _analyticsWidgets();
  const wSales = widgets?.[0] || { percent: 0, total: 0, chart: { categories: [], series: [], colors: ['#22c55e'] } };
  const wExpenses = widgets?.[1] || { percent: 0, total: 0, chart: { categories: [], series: [], colors: ['#ef4444'] } };
  const wOrders = widgets?.[2] || { percent: 0, total: 0, chart: { categories: [], series: [], colors: ['#3b82f6'] } };
  const wProfit = widgets?.[3] || { percent: 0, total: 0, chart: { categories: [], series: [], colors: ['#f59e0b'] } };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Dashboard
      </Typography>

      {/* Top Row - Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} lg={3} md={6}>
          <AnalyticsWidgetSummary
            title="Total Sales"
            percent={wSales.percent || 0}
            total={wSales.total || 0}
            chart={wSales.chart || { categories: [], series: [], colors: ['#22c55e'] }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3} md={6}>
          <AnalyticsWidgetSummary
            title="Total Expenses"
            percent={wExpenses.percent || 0}
            total={wExpenses.total || 0}
            chart={wExpenses.chart || { categories: [], series: [], colors: ['#ef4444'] }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3} md={6}>
          <AnalyticsWidgetSummary
            title="Total Orders"
            percent={wOrders.percent || 0}
            total={wOrders.total || 0}
            chart={wOrders.chart || { categories: [], series: [], colors: ['#3b82f6'] }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3} md={6}>
          <AnalyticsWidgetSummary
            title="Net Profit"
            percent={wProfit.percent || 0}
            total={wProfit.total || 0}
            chart={wProfit.chart || { categories: [], series: [], colors: ['#f59e0b'] }}
          />
        </Grid>
      </Grid>

      {/* Second Row - Sales Analytics and Monthly Profit Trend */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} lg={6}>
          <AnalyticsSalesAnalytics />
        </Grid>
        <Grid xs={12} lg={6}>
          <AnalyticsMonthlyProfitTrend />
        </Grid>
      </Grid>

      {/* Third Row - AI Forecast and Taxable Income */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} lg={6}>
          <AnalyticsAiForecast />
        </Grid>
        <Grid xs={12} lg={6}>
          <AnalyticsTaxableIncome />
        </Grid>
      </Grid>

      {/* Fourth Row - Top Products Performance and KPI Cards */}
      <Grid container spacing={3}>
        <Grid xs={12} lg={8}>
          <AnalyticsProductPerformance hideHeader={true} showTableOnly={true} />
        </Grid>
        <Grid xs={12} lg={4}>
          <AnalyticsKpiCards />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
