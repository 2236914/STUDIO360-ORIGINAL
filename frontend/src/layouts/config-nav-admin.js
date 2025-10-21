
import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  people: icon('ic-user'), // Using user icon for people management
  settings: icon('ic-parameter'), // Using parameter icon for settings
  shield: icon('ic-lock'), // Using lock icon for compliance
  reports: icon('ic-file'), // Using file icon for reports
  support: icon('ic-chat'), // Using chat icon for support
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Platform Management
   */
  {
    subheader: 'PLATFORM MANAGEMENT',
    items: [
      {
        title: 'Platform Overview',
        path: '/admin/dashboard',
        icon: ICONS.dashboard,
      },
      {
        title: 'User Management',
        path: '/admin/users',
        icon: ICONS.people,
      },
      {
        title: 'Seller Onboarding',
        path: '/admin/onboarding',
        icon: ICONS.user,
      },
    ],
  },
  /**
   * System Administration
   */
  {
    subheader: 'SYSTEM ADMINISTRATION',
    items: [
      {
        title: 'System Settings',
        path: '/admin/settings',
        icon: ICONS.settings,
      },
      {
        title: 'Compliance',
        path: '/admin/compliance',
        icon: ICONS.shield,
      },
      {
        title: 'Analytics',
        path: '/admin/analytics',
        icon: ICONS.analytics,
      },
      {
        title: 'Reports',
        path: '/admin/reports',
        icon: ICONS.reports,
      },
      {
        title: 'Support',
        path: '/admin/support',
        icon: ICONS.support,
      },
    ],
  },
]; 