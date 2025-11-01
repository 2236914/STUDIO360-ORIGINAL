// Route segment layout for products listing - server component

import { absoluteUrl, itemListJsonLd, breadcrumbJsonLd } from 'src/utils/seo';
import { storefrontApi } from 'src/utils/api/storefront';

export async function generateMetadata({ params }) {
  const subdomain = params?.subdomain;
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  const canonical = `${base}/${subdomain}/products`;

  const title = 'Our Collection';
  const description = `Browse the latest products from ${subdomain}.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductsLayout({ children, params }) {
  const subdomain = params?.subdomain;
  
  // Fetch products for structured data (limit to first 20 for performance)
  let products = [];
  try {
    const resp = await storefrontApi.getProducts(subdomain);
    const productsData = resp?.success ? resp.data : resp;
    products = Array.isArray(productsData) ? productsData.slice(0, 20) : [];
  } catch (_) {
    // Silently fail - structured data will be empty
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  const productsUrl = absoluteUrl(`/${subdomain}/products`);
  const displayName = (subdomain || '')
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'Store';

  // Create ItemList structured data
  const itemListItems = products.map((product, idx) => ({
    name: product.name || `Product ${idx + 1}`,
    url: absoluteUrl(`/${subdomain}/${product.slug || product.name?.toLowerCase().replace(/\s+/g, '-')}`),
    image: product.cover_image_url || product.images?.[0] || product.image_url,
    description: product.short_description || product.description,
    price: product.price ? String(product.price) : undefined,
    currency: 'USD',
  }));

  const itemListJson = itemListJsonLd({
    name: `${displayName} - Product Collection`,
    description: `Browse all products from ${displayName}`,
    url: productsUrl,
    items: itemListItems,
  });

  // Breadcrumb structured data
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Home', item: absoluteUrl(`/${subdomain}`) },
    { name: 'Products', item: productsUrl },
  ]);

  // Read CSP nonce from request headers (set by middleware)
  const { headers } = await import('next/headers');
  const nonce = headers().get('x-nonce') || undefined;

  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJson) }}
      />
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {children}
    </>
  );
}


