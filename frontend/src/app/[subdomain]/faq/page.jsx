'use client';

import { use } from 'react';

import { isStoreSubdomain } from 'src/utils/subdomain';

import StoreFAQPage from '../../stores/[storeId]/faq/page';

// ----------------------------------------------------------------------

export default function SubdomainFAQPage({ params }) {
  const { subdomain } = use(params);

  // Check if this is a store subdomain
  if (isStoreSubdomain()) {
    // Pass the subdomain as storeId to the existing store FAQ page
    return <StoreFAQPage params={{ storeId: subdomain }} />;
  }

  // For non-store subdomains, show a 404
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1>404</h1>
      <p>FAQ page not found</p>
    </div>
  );
}
