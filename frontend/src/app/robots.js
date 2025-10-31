export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/dashboard', '/api'] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}


