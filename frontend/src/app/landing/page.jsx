import { LandingView } from 'src/sections/landing/view';

// ----------------------------------------------------------------------

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
const canonical = `${base}/landing`;

export const metadata = {
  title: 'STUDIO360 | AI-Powered Business Management for Creative Entrepreneurs',
  description: 'Simplify your shop, track sales, and stay compliant—all in one platform. Complete e-commerce and bookkeeping solution with AI automation.',
  alternates: {
    canonical,
  },
  openGraph: {
    type: 'website',
    siteName: 'STUDIO360',
    title: 'STUDIO360 | AI-Powered Business Management for Creative Entrepreneurs',
    description: 'Simplify your shop, track sales, and stay compliant—all in one platform. Complete e-commerce and bookkeeping solution with AI automation.',
    url: canonical,
    images: [
      {
        url: `${base}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'STUDIO360 - AI-Powered Business Management',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STUDIO360 | AI-Powered Business Management for Creative Entrepreneurs',
    description: 'Simplify your shop, track sales, and stay compliant—all in one platform.',
    images: [`${base}/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    'e-commerce',
    'bookkeeping',
    'AI automation',
    'business management',
    'online store',
    'inventory management',
    'sales tracking',
    'financial management',
  ],
};

// Organization structured data
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'STUDIO360',
  description: 'AI-Powered Business Management for Creative Entrepreneurs',
  url: base,
  logo: `${base}/og-default.jpg`,
  sameAs: [
    // Add social media links here when available
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
  },
};

// SoftwareApplication structured data
const softwareApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'STUDIO360',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Complete e-commerce and bookkeeping solution with AI automation',
  url: base,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <LandingView />
    </>
  );
}
