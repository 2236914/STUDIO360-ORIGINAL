'use client';

import { use } from 'react';

import { isStoreSubdomain } from 'src/utils/subdomain';

import StoreHomePage from '../stores/[storeId]/page';

// ----------------------------------------------------------------------

export default function SubdomainPage({ params }) {
  const { subdomain } = use(params);

  // Check if this is a store subdomain
  if (isStoreSubdomain()) {
    // Pass the subdomain as storeId to the existing store page
    return <StoreHomePage params={{ storeId: subdomain }} />;
  }

  // For non-store subdomains, show a 404 or redirect
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1>404</h1>
      <p>Subdomain not found</p>
    </div>
  );
}
