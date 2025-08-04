import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';
import { RoleBasedDashboardLayout } from 'src/layouts/role-based-dashboard';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  if (CONFIG.auth.skip) {
    return <RoleBasedDashboardLayout>{children}</RoleBasedDashboardLayout>;
  }

  return (
    <AuthGuard>
      <RoleBasedDashboardLayout>{children}</RoleBasedDashboardLayout>
    </AuthGuard>
  );
}
