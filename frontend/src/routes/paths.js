// ----------------------------------------------------------------------

import { 
  buildStoreUrl, 
  buildAdminUrl, 
  buildDashboardUrl 
} from 'src/utils/subdomain';

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
};

// Mock ID for demo purposes
const MOCK_ID = 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1';

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // PRODUCT
  product: {
    root: '/product',
    checkout: `/product/checkout`,
  },
  // STORE (Subdomain-aware)
  store: {
    root: '/stores',
    checkout: (storeId) => `/stores/${storeId}/checkout`,
    // Subdomain-aware store URLs
    subdomain: {
      root: (storeId) => buildStoreUrl(storeId),
      checkout: (storeId) => buildStoreUrl(storeId, '/checkout'),
      products: (storeId) => buildStoreUrl(storeId, '/products'),
      about: (storeId) => buildStoreUrl(storeId, '/about'),
      shipping: (storeId) => buildStoreUrl(storeId, '/shipping'),
      faq: (storeId) => buildStoreUrl(storeId, '/faq'),
      collections: (storeId) => buildStoreUrl(storeId, '/collections'),
      collection: (storeId, category) => buildStoreUrl(storeId, `/collections/${category}`),
      product: (storeId, productName) => buildStoreUrl(storeId, `/${productName}`),
    },
  },
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
      forgotPassword: `${ROOTS.AUTH}/jwt/forgot-password`,
      resetPassword: `${ROOTS.AUTH}/jwt/reset-password`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  // DASHBOARD (Seller Dashboard) - Subdomain-aware
  dashboard: {
    root: ROOTS.DASHBOARD,
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
    bookkeeping: {
      root: `${ROOTS.DASHBOARD}/bookkeeping`,
      generalJournal: `${ROOTS.DASHBOARD}/bookkeeping/general-journal`,
      generalLedger: `${ROOTS.DASHBOARD}/bookkeeping/general-ledger`,
      cashDisbursement: `${ROOTS.DASHBOARD}/bookkeeping/cash-disbursement`,
      cashReceipt: `${ROOTS.DASHBOARD}/bookkeeping/cash-receipt`,
    },
    aiBookkeeper: {
      root: `${ROOTS.DASHBOARD}/ai-bookkeeper`,
      aiCategorization: `${ROOTS.DASHBOARD}/ai-bookkeeper/ai-categorization`,
      uploadProcess: `${ROOTS.DASHBOARD}/ai-bookkeeper/upload-process`,
    },
    forecasting: {
      root: `${ROOTS.DASHBOARD}/forecasting`,
      finance: `${ROOTS.DASHBOARD}/forecasting/finance`,
      productPerformance: `${ROOTS.DASHBOARD}/forecasting/product-performance`,
    },
    // Shop
    inventory: {
      root: `${ROOTS.DASHBOARD}/inventory`,
      new: `${ROOTS.DASHBOARD}/inventory/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/inventory/${id}/edit`,
      details: (id) => `${ROOTS.DASHBOARD}/inventory/${id}`,
    },
    orders: {
      root: `${ROOTS.DASHBOARD}/orders`,
      details: (id) => `${ROOTS.DASHBOARD}/orders/${id}`,
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
    },
    vouchers: {
      root: `${ROOTS.DASHBOARD}/vouchers`,
      new: `${ROOTS.DASHBOARD}/vouchers/new`,
      details: (id) => `${ROOTS.DASHBOARD}/vouchers/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/vouchers/${id}/edit`,
    },
    mail: `${ROOTS.DASHBOARD}/mail`,
    // Store Storefront Editor
    store: {
      root: `${ROOTS.DASHBOARD}/store`,
      homepage: `${ROOTS.DASHBOARD}/store/homepage`,
      shipping: `${ROOTS.DASHBOARD}/store/shipping`,
      about: `${ROOTS.DASHBOARD}/store/about`,
      events: `${ROOTS.DASHBOARD}/store/events`,
      customerSupport: `${ROOTS.DASHBOARD}/store/customer-support`,
    },
    // User
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      account: `${ROOTS.DASHBOARD}/account`,
    },
    // Settings
    account: `${ROOTS.DASHBOARD}/account`,
    // Misc
    announcement: `${ROOTS.DASHBOARD}/announcement`,
    // Subdomain-aware dashboard URLs
    subdomain: {
      root: () => buildDashboardUrl(),
      bookkeeping: () => buildDashboardUrl('/bookkeeping'),
      aiBookkeeper: () => buildDashboardUrl('/ai-bookkeeper'),
      inventory: () => buildDashboardUrl('/inventory'),
      orders: () => buildDashboardUrl('/orders'),
      invoice: () => buildDashboardUrl('/invoice'),
      vouchers: () => buildDashboardUrl('/vouchers'),
      store: () => buildDashboardUrl('/store'),
      account: () => buildDashboardUrl('/account'),
    },
  },
  // ADMIN (Admin IT Dashboard) - Subdomain-aware
  admin: {
    root: ROOTS.ADMIN,
    dashboard: `${ROOTS.ADMIN}/dashboard`,
    users: `${ROOTS.ADMIN}/users`,
    onboarding: `${ROOTS.ADMIN}/onboarding`,
    settings: `${ROOTS.ADMIN}/settings`,
    compliance: `${ROOTS.ADMIN}/compliance`,
    analytics: `${ROOTS.ADMIN}/analytics`,
    reports: `${ROOTS.ADMIN}/reports`,
    support: `${ROOTS.ADMIN}/support`,
    // Subdomain-aware admin URLs
    subdomain: {
      root: () => buildAdminUrl(),
      dashboard: () => buildAdminUrl('/dashboard'),
      users: () => buildAdminUrl('/users'),
      onboarding: () => buildAdminUrl('/onboarding'),
      settings: () => buildAdminUrl('/settings'),
      compliance: () => buildAdminUrl('/compliance'),
      analytics: () => buildAdminUrl('/analytics'),
      reports: () => buildAdminUrl('/reports'),
      support: () => buildAdminUrl('/support'),
    },
  },
};
