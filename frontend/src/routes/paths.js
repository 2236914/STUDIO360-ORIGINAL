// ----------------------------------------------------------------------

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
  // STORE
  store: {
    root: '/stores',
    checkout: (storeId) => `/stores/${storeId}/checkout`,
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
  // DASHBOARD (Seller Dashboard)
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
      aiBookkeeper: `${ROOTS.DASHBOARD}/ai-bookkeeper/ai-bookkeeper`,
      aiCategorization: `${ROOTS.DASHBOARD}/ai-bookkeeper/ai-categorization`,
      uploadProcess: `${ROOTS.DASHBOARD}/ai-bookkeeper/upload-process`,
    },
    taxDecisionTool: `${ROOTS.DASHBOARD}/tax-decision-tool`,
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
    mail: `${ROOTS.DASHBOARD}/mail`,
    // User
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      account: `${ROOTS.DASHBOARD}/account`,
    },
    // Settings
    account: `${ROOTS.DASHBOARD}/account`,
    // Misc
    announcement: `${ROOTS.DASHBOARD}/announcement`,
  },
  // ADMIN (Admin IT Dashboard)
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
  },
};
