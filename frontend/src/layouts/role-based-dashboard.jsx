'use client';

import { useEffect } from 'react';

import { useRouter, usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useAuthContext } from 'src/auth/hooks';

import { AdminLayout } from './admin';
import { DashboardLayout } from './dashboard';

// ----------------------------------------------------------------------

export function RoleBasedDashboardLayout({ children }) {
  const { user } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect based on role if user tries to access wrong section
  useEffect(() => {
    if (!user) return;

    // If admin tries to access dashboard routes, redirect to admin dashboard
    if (user.role === 'admin_it' && pathname?.startsWith('/dashboard')) {
      router.replace(paths.admin.itMaintenance.root);
      return;
    }

    // If seller tries to access admin routes, redirect to seller dashboard
    if (user.role === 'seller' && pathname?.startsWith('/admin')) {
      router.replace(paths.dashboard.root);
      return;
    }
  }, [user, pathname, router]);

  // Render appropriate layout based on role
  if (user?.role === 'admin_it') {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Default to seller dashboard layout
  return <DashboardLayout>{children}</DashboardLayout>;
} 