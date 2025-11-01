import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://styiinzwhhdmvogyokgk.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0eWlpbnp3aGhkbXZvZ3lva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODEwMzIsImV4cCI6MjA2OTk1NzAzMn0.2AnJRjmOG0dBS0Mo94KqhRjyMdpQCmFoPMlMKjAAaFY';

async function getAllStores() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from('shop_info')
      .select('shop_name, updated_at')
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching stores for sitemap:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllStores:', error);
    return [];
  }
}

async function getProductsForStore(shopName) {
  try {
    // First get the user_id for this shop
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: shopData } = await supabase
      .from('shop_info')
      .select('user_id')
      .eq('shop_name', shopName)
      .is('deleted_at', null)
      .maybeSingle();

    if (!shopData?.user_id) {
      return [];
    }

    // Get active products for this store
    const { data: products, error } = await supabase
      .from('inventory_products')
      .select('slug, updated_at')
      .eq('user_id', shopData.user_id)
      .eq('status', 'active')
      .not('slug', 'is', null);

    if (error) {
      console.error(`Error fetching products for ${shopName}:`, error);
      return [];
    }

    return products || [];
  } catch (error) {
    console.error(`Error in getProductsForStore for ${shopName}:`, error);
    return [];
  }
}

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

  // Static routes
  const staticRoutes = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/landing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Fetch all stores
  const stores = await getAllStores();

  // Fetch products for each store and build routes
  const storeRoutes = [];
  
  for (const store of stores) {
    const shopName = store.shop_name;
    if (!shopName) continue;

    // Store homepage
    storeRoutes.push({
      url: `${base}/${shopName}`,
      lastModified: store.updated_at ? new Date(store.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });

    // Products listing page
    storeRoutes.push({
      url: `${base}/${shopName}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });

    // Individual product pages
    try {
      const products = await getProductsForStore(shopName);
      for (const product of products) {
        if (product.slug) {
          storeRoutes.push({
            url: `${base}/${shopName}/${encodeURIComponent(product.slug)}`,
            lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    } catch (error) {
      console.error(`Error processing products for store ${shopName}:`, error);
    }
  }

  return [...staticRoutes, ...storeRoutes];
}


