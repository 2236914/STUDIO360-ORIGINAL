import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsForecastingComprehensive } from 'src/sections/overview/analytics/analytics-forecasting-comprehensive';

// ----------------------------------------------------------------------

export const metadata = { title: `Forecasting Analytics - Kitsch Studio` };

export default function ForecastingRootPage() {
  return (
    <DashboardContent maxWidth="xl">
      <AnalyticsForecastingComprehensive />
    </DashboardContent>
  );
}


