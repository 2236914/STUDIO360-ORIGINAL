// Route segment layout for products listing - server component

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

export default function ProductsLayout({ children }) {
  return children;
}


