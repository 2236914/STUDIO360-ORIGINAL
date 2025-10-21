'use client';

import { use } from 'react';

import { isStoreSubdomain } from 'src/utils/subdomain';

import StoreCollectionsPage from '../../stores/[storeId]/collections/page';

// ----------------------------------------------------------------------

export default function SubdomainCollectionsPage({ params }) {
  const { subdomain } = use(params);

  // Check if this is a store subdomain
  if (isStoreSubdomain()) {
    // Pass the subdomain as storeId to the existing store collections page
    return <StoreCollectionsPage params={{ storeId: subdomain }} />;
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
      <p>Collections page not found</p>
    </div>
  );
}
