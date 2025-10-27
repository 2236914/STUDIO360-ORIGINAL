import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsProductPerformance } from 'src/sections/overview/analytics/analytics-product-performance';

// ----------------------------------------------------------------------

export const metadata = { title: `Product Performance - Kitsch Studio` };

export default function ProductPerformancePage() {
  return (
    <DashboardContent maxWidth="xl">
      <AnalyticsProductPerformance />
    </DashboardContent>
  );
}

