'use client';

import { useEffect } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';

import { AdminLayout } from './admin';
import { DashboardLayout } from './dashboard';

// ----------------------------------------------------------------------

export function RoleBasedDashboardLayout({ children }) {
  const { user } = useAuthContext();
  const router = useRouter();

  // Redirect based on role
  useEffect(() => {
    if (user) {
      const currentPath = window.location.pathname;
      
      // If user is admin IT and not on admin route, redirect to admin dashboard
      if (user.role === 'admin_it' && !currentPath.startsWith('/admin')) {
        router.push('/admin/dashboard');
        return;
      }
      
      // If user is seller and on admin route, redirect to seller dashboard
      if (user.role === 'seller' && currentPath.startsWith('/admin')) {
        router.push('/dashboard');
        
      }
    }
  }, [user, router]);

  // Render appropriate layout based on role
  if (user?.role === 'admin_it') {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // Default to seller dashboard layout
  return <DashboardLayout>{children}</DashboardLayout>;
} 