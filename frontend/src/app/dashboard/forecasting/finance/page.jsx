import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsForecastingComprehensive } from 'src/sections/overview/analytics/analytics-forecasting-comprehensive';

// ----------------------------------------------------------------------

export const metadata = { title: `Finance Forecasting - Kitsch Studio` };

export default function FinanceForecastingPage() {
  return (
    <DashboardContent maxWidth="xl">
      <AnalyticsForecastingComprehensive />
    </DashboardContent>
  );
}

