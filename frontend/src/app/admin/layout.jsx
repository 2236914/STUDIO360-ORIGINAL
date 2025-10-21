'use client';

import { CONFIG } from 'src/config-global';
import { AdminLayout } from 'src/layouts/admin';

import { AuthGuard } from 'src/auth/guard';
import { useAuthContext } from 'src/auth/hooks';
import { RoleBasedGuard } from 'src/auth/guard/role-based-guard';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  const { user } = useAuthContext();

  if (CONFIG.auth.skip) {
    return (
      <RoleBasedGuard acceptRoles={['admin_it']} currentRole={user?.role}>
        <AdminLayout>{children}</AdminLayout>
      </RoleBasedGuard>
    );
  }

  return (
    <AuthGuard>
      <RoleBasedGuard acceptRoles={['admin_it']} currentRole={user?.role}>
        <AdminLayout>{children}</AdminLayout>
      </RoleBasedGuard>
    </AuthGuard>
  );
} 