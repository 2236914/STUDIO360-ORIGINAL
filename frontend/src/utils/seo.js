export function absoluteUrl(path = '') {
  if (typeof window !== 'undefined') {
    const base = `${window.location.protocol}//${window.location.host}`;
    return new URL(path, base).toString();
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
  return new URL(path, base).toString();
}

export function productJsonLd({ name, description, brand, sku, images = [], price, currency = 'USD', availability = 'https://schema.org/InStock', url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: brand ? { '@type': 'Brand', name: brand } : undefined,
    sku,
    image: images,
    offers: {
      '@type': 'Offer',
      priceCurrency: currency,
      price,
      availability,
      url,
    },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.item,
    })),
  };
}


