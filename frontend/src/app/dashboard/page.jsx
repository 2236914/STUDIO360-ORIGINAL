
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { 
  AnalyticsKpiCards,
  AnalyticsAiForecast,
  AnalyticsWidgetSummary,
  AnalyticsTaxableIncome,
  AnalyticsSalesAnalytics,
  AnalyticsMonthlyProfitTrend
} from 'src/sections/overview/analytics';

// ----------------------------------------------------------------------

export const metadata = { title: `Dashboard - Kitsch Studio` };

export default async function Page() {
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
            percent={0}
            total={0}
            chart={{ categories: [], series: [], colors: ['#22c55e'] }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3} md={6}>
          <AnalyticsWidgetSummary
            title="Total Expenses"
            percent={0}
            total={0}
            chart={{ categories: [], series: [], colors: ['#ef4444'] }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3} md={6}>
          <AnalyticsWidgetSummary
            title="Total Orders"
            percent={0}
            total={0}
            chart={{ categories: [], series: [], colors: ['#3b82f6'] }}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3} md={6}>
          <AnalyticsWidgetSummary
            title="Net Profit"
            percent={0}
            total={0}
            chart={{ categories: [], series: [], colors: ['#f59e0b'] }}
          />
        </Grid>
      </Grid>

      {/* Second Row - Sales Analytics (full width) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12}>
          <AnalyticsSalesAnalytics />
        </Grid>
      </Grid>

      {/* Third Row - AI Forecast and Taxable Income */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} lg={8}>
          <AnalyticsAiForecast />
        </Grid>
        <Grid xs={12} lg={4}>
          <AnalyticsTaxableIncome />
        </Grid>
      </Grid>

      {/* Fourth Row - Monthly Profit Trend and KPI Cards */}
      <Grid container spacing={3}>
        <Grid xs={12} lg={8}>
          <AnalyticsMonthlyProfitTrend />
        </Grid>
        <Grid xs={12} lg={4}>
          <AnalyticsKpiCards />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
