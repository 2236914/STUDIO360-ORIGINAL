'use client';

import { use } from 'react';
import { useParams } from 'next/navigation';
import { isStoreSubdomain } from 'src/utils/subdomain';
import StoreCheckoutPage from '../../stores/[storeId]/checkout/page';

// ----------------------------------------------------------------------

export default function SubdomainCheckoutPage({ params }) {
  const resolvedParams = use(params);
  const subdomain = resolvedParams?.subdomain;

  // Check if this is a store subdomain
  if (isStoreSubdomain()) {
    // Pass the subdomain as storeId to the existing store checkout page
    return <StoreCheckoutPage params={{ storeId: subdomain }} />;
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
      <p>Checkout page not found</p>
    </div>
  );
}
