'use client';

import { use } from 'react';
import { useParams } from 'next/navigation';
import { isStoreSubdomain } from 'src/utils/subdomain';
import StoreShippingPage from '../../stores/[storeId]/shipping/page';

// ----------------------------------------------------------------------

export default function SubdomainShippingPage({ params }) {
  const resolvedParams = use(params);
  const subdomain = resolvedParams?.subdomain;

  // Check if this is a store subdomain
  if (isStoreSubdomain()) {
    // Pass the subdomain as storeId to the existing store shipping page
    return <StoreShippingPage params={{ storeId: subdomain }} />;
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
      <p>Shipping page not found</p>
    </div>
  );
}
