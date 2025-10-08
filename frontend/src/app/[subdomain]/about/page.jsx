'use client';

import { use } from 'react';
import { useParams } from 'next/navigation';
import { isStoreSubdomain } from 'src/utils/subdomain';
import StoreAboutPage from '../../stores/[storeId]/about/page';

// ----------------------------------------------------------------------

export default function SubdomainAboutPage({ params }) {
  const resolvedParams = use(params);
  const subdomain = resolvedParams?.subdomain;

  // Check if this is a store subdomain
  if (isStoreSubdomain()) {
    // Pass the subdomain as storeId to the existing store about page
    return <StoreAboutPage params={{ storeId: subdomain }} />;
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
      <p>About page not found</p>
    </div>
  );
}
