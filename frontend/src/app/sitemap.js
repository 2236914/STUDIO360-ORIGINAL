export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

  // TODO: Replace with real data from your API
  const stores = []; // e.g., [{ id: 'mystore' }]
  const productsByStore = {}; // e.g., { mystore: [{ slug: 'product-slug' }] }

  const routes = [
    '',
    '/landing',
  ].map((p) => ({
    url: `${base}${p || '/'}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));

  const storeRoutes = stores.flatMap((s) => ([
    { url: `${base}/${s.id}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/${s.id}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    ...(productsByStore[s.id] || []).map((prod) => ({
      url: `${base}/${s.id}/${prod.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })),
  ]));

  return [...routes, ...storeRoutes];
}


