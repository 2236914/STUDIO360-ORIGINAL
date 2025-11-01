import { CheckoutProvider } from 'src/sections/checkout/context';
import { Snackbar } from 'src/components/snackbar';
import { StoreFavicon } from 'src/components/store-favicon';
import { ChatWidgetWrapper } from 'src/components/chat-widget-wrapper';
import { absoluteUrl, storeJsonLd } from 'src/utils/seo';
import { storefrontApi } from 'src/utils/api/storefront';

// ----------------------------------------------------------------------

export async function generateMetadata({ params }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const subdomain = resolvedParams?.subdomain;
  const displayName = (subdomain || '')
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  const canonical = `${base}/${subdomain || ''}`;

  // Compute simple metadata without API calls to avoid duplicate requests
  const seo = {
    title: displayName || 'Storefront',
    description: displayName
      ? `Shop ${displayName} products. Curated collection available now.`
      : 'Shop curated products.',
    image: null,
  };

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonical,
      images: [{ url: `/api/og?title=${encodeURIComponent(seo.title)}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function SubdomainLayout({ children, params }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const subdomain = resolvedParams?.subdomain;

  // Fetch store info for structured data
  let shopInfo = null;
  try {
    const resp = await storefrontApi.getShopInfo(subdomain);
    shopInfo = resp?.data || resp;
  } catch (_) {
    // Silently fail - structured data will use fallback values
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  const storeUrl = absoluteUrl(`/${subdomain || ''}`);
  const displayName = (subdomain || '')
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'Store';

  const storeJson = storeJsonLd({
    name: shopInfo?.shop_name || displayName,
    description: shopInfo?.seo_description || shopInfo?.short_description || `Shop ${displayName} products. Curated collection available now.`,
    url: storeUrl,
    logo: shopInfo?.logo_url || undefined,
    email: shopInfo?.email || undefined,
    phone: shopInfo?.phone || undefined,
  });

  // Read CSP nonce from request headers (set by middleware)
  const { headers } = await import('next/headers');
  const nonce = headers().get('x-nonce') || undefined;

  return (
    <CheckoutProvider>
      <StoreFavicon storeId={subdomain} />
      <Snackbar />
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJson) }}
      />
      {children}
      <ChatWidgetWrapper storeName={subdomain} />
    </CheckoutProvider>
  );
}
