import { paths } from 'src/routes/paths';

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
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  bookkeeping: icon('ic-banking'), // Using banking icon for bookkeeping
  taxCalculator: icon('ic-analytics'), // Using analytics icon for tax calculator
  aiBookkeeper: icon('ic-robot'), // Using robot icon for AI bookkeeper
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * General
   */
  {
    subheader: 'GENERAL',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
    ],
  },
  /**
   * Management Tools
   */
  {
    subheader: 'MANAGEMENT TOOLS',
    items: [
      {
        title: 'Book of Accounts',
        path: paths.dashboard.bookkeeping.root,
        icon: ICONS.bookkeeping,
        children: [
          { title: 'General Journal', path: paths.dashboard.bookkeeping.generalJournal },
          { title: 'General Ledger', path: paths.dashboard.bookkeeping.generalLedger },
          { title: 'Cash Disbursement Book', path: paths.dashboard.bookkeeping.cashDisbursement },
          { title: 'Cash Receipt Journal', path: paths.dashboard.bookkeeping.cashReceipt },
        ],
      },
      {
        title: 'AI Bookkeeper',
        path: paths.dashboard.aiBookkeeper.root,
        icon: ICONS.aiBookkeeper,
        children: [
          { title: 'AI Bookkeeper', path: paths.dashboard.aiBookkeeper.aiBookkeeper },
          { title: 'AI Categorization Log', path: paths.dashboard.aiBookkeeper.aiCategorization },
        ],
      },

      {
        title: 'Tax Calculator',
        path: paths.dashboard.taxCalculator,
        icon: ICONS.taxCalculator,
      },
    ],
  },
];
