import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { _analyticsWidgets } from 'src/_mock/_overview';
import { cookies } from 'next/headers';

import { 
  AnalyticsWidgetSummary,
  AnalyticsSalesAnalytics,
  AnalyticsTaxableIncome,
  AnalyticsAiForecast,
  AnalyticsMonthlyProfitTrend,
  AnalyticsKpiCards
} from 'src/sections/overview/analytics';

// ----------------------------------------------------------------------

export const metadata = { title: `Dashboard - Kitsch Studio` };

export default async function Page() {
  const c = cookies();
  const kpiYear = (() => {
    try { const v = c.get('kpiYear')?.value; return v ? parseInt(v, 10) : undefined; } catch { return undefined; }
  })();
  const widgets = await _analyticsWidgets(kpiYear);
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Dashboard
      </Typography>

      {/* Top Row - Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {widgets.map((widget) => (
          <Grid key={widget.id} xs={12} sm={6} lg={3} md={6}>
            <AnalyticsWidgetSummary
              title={widget.title}
              percent={widget.percent}
              total={widget.total}
              chart={widget.chart}
            />
          </Grid>
        ))}
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
