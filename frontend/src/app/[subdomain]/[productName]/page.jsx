'use client';

import { use } from 'react';

import { isStoreSubdomain } from 'src/utils/subdomain';

// import StoreProductPage from '../../stores/[storeId]/[productName]/page';

// ----------------------------------------------------------------------

export default function SubdomainProductPage({ params }) {
  const { subdomain, productName } = use(params);

  // Check if this is a store subdomain
  if (isStoreSubdomain()) {
    // Pass the subdomain as storeId to the existing store product page
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h1>{productName} - {subdomain}</h1>
        <p>Product page coming soon...</p>
      </div>
    );
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
      <p>Product page not found</p>
    </div>
  );
}
