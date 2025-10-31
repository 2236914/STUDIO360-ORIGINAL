import { absoluteUrl, productJsonLd, breadcrumbJsonLd } from 'src/utils/seo';
import { storefrontApi } from 'src/utils/api/storefront';

export async function generateMetadata({ params }) {
  const { subdomain, productName } = params;
  const slug = productName;
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  const canonical = `${base}/${subdomain}/${slug}`;

  try {
    const resp = await storefrontApi.getProductBySlug(subdomain, slug);
    const p = resp?.data || resp;
    const title = p?.seo_title || p?.name || slug.replace(/-/g, ' ');
    const description = p?.seo_description || p?.short_description || `Buy ${title} from ${subdomain}.`;
    const image = p?.social_image_url || p?.cover_image_url || (p?.images?.[0]) || '/assets/images/product/product-placeholder.png';

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        images: [{ url: image, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      robots: { index: true, follow: true },
    };
  } catch (_) {
    const name = decodeURIComponent(slug).replace(/-/g, ' ');
    return {
      title: name,
      description: `Buy ${name} from ${subdomain}.`,
      alternates: { canonical },
      openGraph: { title: name, description: `Buy ${name} from ${subdomain}.`, url: canonical },
      twitter: { card: 'summary_large_image', title: name, description: `Buy ${name} from ${subdomain}.` },
    };
  }
}

export default async function ProductLayout({ children, params }) {
  const { subdomain, productName } = params;
  const slug = productName;
  const url = absoluteUrl(`/${subdomain}/${slug}`);

  let p = null;
  try {
    const resp = await storefrontApi.getProductBySlug(subdomain, slug);
    p = resp?.data || resp;
  } catch (_) { /* noop */ }

  const name = p?.name || decodeURIComponent(slug).replace(/-/g, ' ');
  const jsonLd = productJsonLd({
    name,
    description: p?.seo_description || p?.short_description || `Buy ${name} from ${subdomain}.`,
    price: (p?.price != null ? String(p.price) : '0.00'),
    currency: 'USD',
    images: p?.images && p.images.length ? p.images : ['/assets/images/product/product-placeholder.png'],
    sku: p?.sku || slug,
    brand: subdomain,
    url,
  });

  const crumbs = breadcrumbJsonLd([
    { name: 'Home', item: absoluteUrl(`/${subdomain}`) },
    { name: 'Products', item: absoluteUrl(`/${subdomain}/products`) },
    { name, item: url },
  ]);

  // Read CSP nonce from request headers (set by middleware)
  const { headers } = await import('next/headers');
  const nonce = headers().get('x-nonce') || undefined;

  return (
    <>
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      {children}
    </>
  );
}


