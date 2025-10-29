'use client';

import { CONFIG } from 'src/config-global';
import { RoleBasedDashboardLayout } from 'src/layouts/role-based-dashboard';

import { AuthGuard } from 'src/auth/guard';
import { useAuthContext } from 'src/auth/hooks';
import { RoleBasedGuard } from 'src/auth/guard/role-based-guard';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  const { user } = useAuthContext();

  if (CONFIG.auth.skip) {
    return (
      <RoleBasedGuard acceptRoles={['seller']} currentRole={user?.role}>
        <RoleBasedDashboardLayout>{children}</RoleBasedDashboardLayout>
      </RoleBasedGuard>
    );
  }

  return (
    <AuthGuard>
      <RoleBasedGuard acceptRoles={['seller']} currentRole={user?.role}>
        <RoleBasedDashboardLayout>{children}</RoleBasedDashboardLayout>
      </RoleBasedGuard>
    </AuthGuard>
  );
}
