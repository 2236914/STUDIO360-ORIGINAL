import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  product: icon('ic-product'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  bookkeeping: icon('ic-banking'), 
  taxDecisionTool: icon('ic-analytics'), 
  aiBookkeeper: icon('ic-robot'),
  forecasting: icon('ic-analytics'),
  inventory: icon('ic-product'),
  invoice: icon('ic-file'),
  vouchers: icon('ic-label'),
  account: icon('ic-user'),
  announcement: icon('ic-blog'),
  store: icon('ic-ecommerce'),
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
      },
      {
        title: 'Forecasting Analytics',
        path: paths.dashboard.forecasting.root,
        icon: ICONS.forecasting,
      },
    ],
  },
  /**
   * Shop
   */
  {
    subheader: 'SHOP',
    items: [
      {
        title: 'Store',
        path: paths.dashboard.store.root,
        icon: ICONS.store,
        children: [
          { title: 'Homepage', path: paths.dashboard.store.homepage },
          { title: 'About', path: paths.dashboard.store.about },
          { title: 'Shipping & Returns', path: paths.dashboard.store.shipping },
          { title: 'Events', path: paths.dashboard.store.events },
          { title: 'Customer Support', path: paths.dashboard.store.customerSupport },
        ],
      },
      { title: 'Inventory', path: paths.dashboard.inventory.root, icon: ICONS.inventory },
      { title: 'Orders', path: paths.dashboard.orders.root, icon: ICONS.order },
      { title: 'Invoice', path: paths.dashboard.invoice.root, icon: ICONS.invoice },
      { title: 'Vouchers', path: paths.dashboard.vouchers.root, icon: ICONS.vouchers },
      { title: 'Mail', path: paths.dashboard.mail, icon: ICONS.mail },
    ],
  },
  /**
   * Settings
   */
  {
    subheader: 'SETTINGS',
    items: [
      { title: 'Account', path: paths.dashboard.account, icon: ICONS.account },
    ],
  },
  /**
   * Misc
   */
  {
    subheader: 'MISC',
    items: [
      { title: 'Announcement', path: paths.dashboard.announcement, icon: ICONS.announcement },
    ],
  },
];
