'use client';

import { use } from 'react';
import { useParams } from 'next/navigation';
import { isStoreSubdomain } from 'src/utils/subdomain';
import StoreCategoryPage from '../../../stores/[storeId]/collections/[category]/page';

// ----------------------------------------------------------------------

export default function SubdomainCategoryPage({ params }) {
  const resolvedParams = use(params);
  const subdomain = resolvedParams?.subdomain;
  const category = resolvedParams?.category;

  // Check if this is a store subdomain
  if (isStoreSubdomain()) {
    // Pass the subdomain as storeId to the existing store category page
    return <StoreCategoryPage params={{ storeId: subdomain, category }} />;
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
      <p>Category page not found</p>
    </div>
  );
}
