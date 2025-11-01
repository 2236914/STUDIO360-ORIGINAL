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

export function storeJsonLd({ name, description, url, logo, email, phone }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name,
    description,
    url,
    logo: logo ? { '@type': 'ImageObject', url: logo } : undefined,
    contactPoint: email || phone ? {
      '@type': 'ContactPoint',
      ...(email ? { email } : {}),
      ...(phone ? { telephone: phone } : {}),
      contactType: 'Customer Service',
    } : undefined,
  };
}

export function itemListJsonLd({ name, description, url, items = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: item.name,
        url: item.url,
        image: item.image,
        description: item.description,
        offers: item.price ? {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: item.currency || 'USD',
          availability: 'https://schema.org/InStock',
          url: item.url,
        } : undefined,
      },
    })),
  };
}


