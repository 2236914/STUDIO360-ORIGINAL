import { today } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';

import { _mock } from './_mock';

// Server-side helper to fetch JSON with timeout
async function fetchJson(url, opts = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), opts.timeout || 3000);
  try {
    const res = await fetch(url, { ...opts, signal: ac.signal, cache: 'no-store' });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    clearTimeout(t);
    return null;
  }
}
// Detect backend base URL for server-side rendering
function detectServerBases() {
  const env = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || CONFIG?.site?.serverUrl || '';
  const list = [env, 'http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:3021', 'http://127.0.0.1:3021']
    .filter(Boolean);
  return Array.from(new Set(list));
}

// APP
// ----------------------------------------------------------------------

export const _appRelated = [
  'Microsoft office 365',
  'Opera',
  'Adobe acrobat reader DC',
  'Joplin',
  'Topaz photo AI',
].map((name, index) => ({
  id: _mock.id(index),
  name,
  downloaded: _mock.number.nativeL(index),
  ratingNumber: _mock.number.rating(index),
  size: _mock.number.nativeL(index) * 1024,
  totalReviews: _mock.number.nativeL(index),
  shortcut: `${CONFIG.site.basePath}/assets/icons/app/ic-app-${index + 1}.webp`,
  price: [2, 4].includes(index) ? _mock.number.price(index) : 0,
}));

export const _appInstalled = ['Germany', 'England', 'France', 'Korean', 'USA'].map(
  (country, index) => ({
    id: _mock.id(index),
    countryName: country,
    android: _mock.number.nativeL(index),
    windows: _mock.number.nativeL(index + 1),
    apple: _mock.number.nativeL(index + 2),
    countryCode: ['de', 'gb', 'fr', 'kr', 'us'][index],
  })
);

export const _appAuthors = [...Array(3)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
  totalFavorites: _mock.number.nativeL(index),
}));

export const _appInvoices = [...Array(5)].map((_, index) => {
  const category = ['Android', 'Mac', 'Windows', 'Android', 'Mac'][index];

  const status = ['paid', 'out of date', 'progress', 'paid', 'paid'][index];

  return {
    id: _mock.id(index),
    invoiceNumber: `INV-199${index}`,
    price: _mock.number.price(index),
    category,
    status,
  };
});

export const _appFeatured = [...Array(3)].map((_, index) => ({
  id: _mock.id(index + 3),
  title: _mock.postTitle(index + 3),
  description: _mock.sentence(index + 3),
  coverUrl: _mock.image.cover(index + 3),
}));

// ANALYTIC
// ----------------------------------------------------------------------

export const _analyticTasks = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.taskNames(index),
}));

export const _analyticPosts = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  postedAt: _mock.time(index),
  title: _mock.postTitle(index),
  coverUrl: _mock.image.cover(index),
  description: _mock.sentence(index),
}));

export const _analyticOrderTimeline = [...Array(5)].map((_, index) => {
  const title = [
    '1983, orders, $4220',
    '12 Invoices have been paid',
    'Order #37745 from September',
    'New order placed #XF-2356',
    'New order placed #XF-2346',
  ][index];

  return {
    id: _mock.id(index),
    title,
    type: `order${index + 1}`,
    time: _mock.time(index),
  };
});

export const _analyticTraffic = [
  {
    value: 'facebook',
    label: 'Facebook',
    total: _mock.number.nativeL(1),
  },
  {
    value: 'google',
    label: 'Google',
    total: _mock.number.nativeL(2),
  },
  {
    value: 'linkedin',
    label: 'Linkedin',
    total: _mock.number.nativeL(3),
  },
  {
    value: 'twitter',
    label: 'Twitter',
    total: _mock.number.nativeL(4),
  },
];

// ECOMMERCE
// ----------------------------------------------------------------------

export const _ecommerceSalesOverview = ['Total profit', 'Total income', 'Total expenses'].map(
  (label, index) => ({
    label,
    totalAmount: _mock.number.price(index) * 100,
    value: _mock.number.percent(index),
  })
);

export const _ecommerceBestSalesman = [...Array(5)].map((_, index) => {
  const category = ['CAP', 'Branded shoes', 'Headphone', 'Cell phone', 'Earings'][index];

  return {
    id: _mock.id(index),
    category,
    rank: `Top ${index + 1}`,
    email: _mock.email(index),
    name: _mock.fullName(index),
    totalAmount: _mock.number.price(index),
    avatarUrl: _mock.image.avatar(index + 8),
    countryCode: ['de', 'gb', 'fr', 'kr', 'us'][index],
  };
});

export const _ecommerceLatestProducts = [...Array(5)].map((_, index) => {
  const colors = (index === 0 && ['#2EC4B6', '#E71D36', '#FF9F1C', '#011627']) ||
    (index === 1 && ['#92140C', '#FFCF99']) ||
    (index === 2 && ['#0CECDD', '#FFF338', '#FF67E7', '#C400FF', '#52006A', '#046582']) ||
    (index === 3 && ['#845EC2', '#E4007C', '#2A1A5E']) || ['#090088'];

  return {
    id: _mock.id(index),
    colors,
    name: _mock.productName(index),
    price: _mock.number.price(index),
    coverUrl: _mock.image.product(index),
    priceSale: [1, 3].includes(index) ? _mock.number.price(index) : 0,
  };
});

export const _ecommerceNewProducts = [...Array(4)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.productName(index),
  coverUrl: _mock.image.product(index),
}));

// BANKING
// ----------------------------------------------------------------------

export const _bankingContacts = [...Array(12)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  email: _mock.email(index),
  avatarUrl: _mock.image.avatar(index),
}));

export const _bankingCreditCard = [
  {
    id: _mock.id(2),
    balance: 23432.03,
    cardType: 'mastercard',
    cardHolder: _mock.fullName(2),
    cardNumber: '**** **** **** 3640',
    cardValid: '11/22',
  },
  {
    id: _mock.id(3),
    balance: 18000.23,
    cardType: 'visa',
    cardHolder: _mock.fullName(3),
    cardNumber: '**** **** **** 8864',
    cardValid: '11/25',
  },
  {
    id: _mock.id(4),
    balance: 2000.89,
    cardType: 'mastercard',
    cardHolder: _mock.fullName(4),
    cardNumber: '**** **** **** 7755',
    cardValid: '11/22',
  },
];

export const _bankingRecentTransitions = [
  {
    id: _mock.id(2),
    name: _mock.fullName(2),
    avatarUrl: _mock.image.avatar(2),
    type: 'Income',
    message: 'Receive money from',
    category: 'Annette black',
    date: _mock.time(2),
    status: 'progress',
    amount: _mock.number.price(2),
  },
  {
    id: _mock.id(3),
    name: _mock.fullName(3),
    avatarUrl: _mock.image.avatar(3),
    type: 'Expenses',
    message: 'Payment for',
    category: 'Courtney henry',
    date: _mock.time(3),
    status: 'completed',
    amount: _mock.number.price(3),
  },
  {
    id: _mock.id(4),
    name: _mock.fullName(4),
    avatarUrl: _mock.image.avatar(4),
    type: 'Receive',
    message: 'Payment for',
    category: 'Theresa webb',
    date: _mock.time(4),
    status: 'failed',
    amount: _mock.number.price(4),
  },
  {
    id: _mock.id(5),
    name: null,
    avatarUrl: null,
    type: 'Expenses',
    message: 'Payment for',
    category: 'Fast food',
    date: _mock.time(5),
    status: 'completed',
    amount: _mock.number.price(5),
  },
  {
    id: _mock.id(6),
    name: null,
    avatarUrl: null,
    type: 'Expenses',
    message: 'Payment for',
    category: 'Fitness',
    date: _mock.time(6),
    status: 'progress',
    amount: _mock.number.price(6),
  },
];

// BOOKING
// ----------------------------------------------------------------------

export const _bookings = [...Array(5)].map((_, index) => {
  const status = ['Paid', 'Paid', 'Pending', 'Cancelled', 'Paid'][index];

  const customer = {
    avatarUrl: _mock.image.avatar(index),
    name: _mock.fullName(index),
    phoneNumber: _mock.phoneNumber(index),
  };

  const destination = [...Array(5)].map((__, _index) => ({
    name: _mock.tourName(_index + 1),
    coverUrl: _mock.image.travel(_index + 1),
  }))[index];

  return {
    id: _mock.id(index),
    destination,
    status,
    customer,
    checkIn: _mock.time(index),
    checkOut: _mock.time(index),
  };
});

export const _bookingsOverview = [...Array(3)].map((_, index) => ({
  status: ['Pending', 'Canceled', 'Sold'][index],
  quantity: _mock.number.nativeL(index),
  value: _mock.number.percent(index + 5),
}));

export const _bookingReview = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  postedAt: _mock.time(index),
  rating: _mock.number.rating(index),
  avatarUrl: _mock.image.avatar(index),
  description: _mock.description(index),
  tags: ['Great sevice', 'Recommended', 'Best price'],
}));

export const _bookingNew = [...Array(8)].map((_, index) => ({
  guests: '3-5',
  id: _mock.id(index),
  bookedAt: _mock.time(index),
  duration: '3 days 2 nights',
  isHot: _mock.boolean(index),
  name: _mock.fullName(index),
  price: _mock.number.price(index),
  avatarUrl: _mock.image.avatar(index),
  coverUrl: _mock.image.travel(index),
}));

// COURSE
// ----------------------------------------------------------------------

export const _coursesContinue = [...Array(4)].map((_, index) => ({
  id: _mock.id(index),
  title: _mock.courseNames(index),
  coverUrl: _mock.image.course(index),
  totalLesson: 12,
  currentLesson: index + 7,
}));

export const _coursesFeatured = [...Array(6)].map((_, index) => ({
  id: _mock.id(index),
  title: _mock.courseNames(index),
  coverUrl: _mock.image.course(index + 6),
  totalDuration: 220,
  totalStudents: _mock.number.nativeM(index),
  price: _mock.number.price(index),
}));

export const _coursesReminder = [...Array(4)].map((_, index) => ({
  id: _mock.id(index),
  title: _mock.courseNames(index),
  totalLesson: 12,
  reminderAt: today(),
  currentLesson: index + 7,
}));

// ----------------------------------------------------------------------

// ANALYTICS
// ----------------------------------------------------------------------

// Dynamic KPI source: compute from backend analytics, fall back when unavailable.
export async function _analyticsWidgets(yearParam) {
  const year = Number.isInteger(yearParam) ? yearParam : new Date().getFullYear();
  const bases = detectServerBases();
  let sales = null;
  let profit = null;
  for (const base of bases) {
    // Try live endpoints
    const s = await fetchJson(`${base}/api/analytics/sales?year=${year}`);
    const p = await fetchJson(`${base}/api/analytics/profit?year=${year}`);
    if (s?.success && p?.success) { sales = s.data; profit = p.data; break; }
    // Try caches explicitly
    const sc = await fetchJson(`${base}/api/analytics/sales/cache?year=${year}`);
    const pc = await fetchJson(`${base}/api/analytics/profit/cache?year=${year}`);
    if (sc?.data || pc?.data) { sales = sc?.data || sales; profit = pc?.data || profit; break; }
  }
  // Compute totals
  const months = profit?.months || ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'];
  const salesTotal = sales ? Object.values(sales.series || {}).reduce((sum, arr) => sum + (arr||[]).reduce((a,b)=>a+Number(b||0),0), 0) : 0;
  const expensesTotal = profit ? (profit.expenses || []).reduce((a,b)=>a+Number(b||0),0) : 0;
  const ordersTotal = typeof sales?.orderCount === 'number' ? sales.orderCount : 0;
  const netProfitTotal = profit ? ((profit.sales || []).reduce((a,b)=>a+Number(b||0),0) - (profit.expenses || []).reduce((a,b)=>a+Number(b||0),0)) : 0;
  // Small sparkline series (last 8 months) from data when available
  const last8 = (arr) => (arr || []).slice(-8).map((v)=>Number(v)||0);
  const sparkSales = sales ? last8((sales.series?.['360']||[]).map((v,i)=> v + (sales.series?.Shopee?.[i]||0) + (sales.series?.['TikTok Shop']?.[i]||0))) : Array(8).fill(0);
  const sparkExpenses = profit ? last8(profit.expenses) : Array(8).fill(0);
  const sparkProfit = profit ? last8((profit.sales||[]).map((v,i)=> Number(v||0) - Number(profit.expenses?.[i]||0))) : Array(8).fill(0);
  // Percent deltas (simple YoY where available, else 0)
  const salesPct = typeof sales?.yoy === 'number' ? sales.yoy*100 : 0;
  const expPct = typeof profit?.yoyExpenses === 'number' ? profit.yoyExpenses*100 : 0;
  const ordersPct = 0; // baseline unknown — can add later
  const profitPct = typeof profit?.yoyProfit === 'number' ? profit.yoyProfit*100 : 0;

  return [
    {
      id: _mock.id(1),
      title: 'Total Sales',
      total: Math.round(salesTotal),
      percent: Number.isFinite(salesPct) ? Number(salesPct.toFixed(1)) : 0,
      color: 'success',
      chart: { categories: months.slice(-8), series: sparkSales, colors: ['#22c55e'] },
    },
    {
      id: _mock.id(2),
      title: 'Total Expenses',
      total: Math.round(expensesTotal),
      percent: expPct,
      color: 'error',
      chart: { categories: months.slice(-8), series: sparkExpenses, colors: ['#ef4444'] },
    },
    {
      id: _mock.id(3),
      title: 'Total Orders',
      total: ordersTotal,
      percent: ordersPct,
      color: 'primary',
      chart: { categories: months.slice(-8), series: sparkSales, colors: ['#3b82f6'] },
    },
    {
      id: _mock.id(4),
      title: 'Net Profit',
      total: Math.round(netProfitTotal),
      percent: profitPct,
      color: 'warning',
      chart: { categories: months.slice(-8), series: sparkProfit, colors: ['#f59e0b'] },
    },
  ];
}
