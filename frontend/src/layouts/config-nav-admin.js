
import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  itMaintenance: icon('ic-parameter'), // IT Maintenance icon
  tickets: icon('ic-mail'), // Support tickets icon
  announcements: icon('ic-blog'), // System announcements icon
  history: icon('ic-calendar'), // Account history icon
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * IT Maintenance
   */
  {
    subheader: 'IT MAINTENANCE',
    items: [
      { title: 'Dashboard', path: '/admin/it-maintenance', icon: ICONS.itMaintenance },
      { title: 'Support Tickets', path: '/admin/it-maintenance/support-tickets', icon: ICONS.tickets },
      { title: 'System Announcements', path: '/admin/it-maintenance/announcements', icon: ICONS.announcements },
      { title: 'Account History', path: '/admin/it-maintenance/account-history', icon: ICONS.history },
    ],
  },
]; 