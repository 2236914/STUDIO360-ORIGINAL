import { CheckoutProvider } from 'src/sections/checkout/context';
import { Snackbar } from 'src/components/snackbar';

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

export default function SubdomainLayout({ children }) {
  return (
    <CheckoutProvider>
      <Snackbar />
      {children}
    </CheckoutProvider>
  );
}
