'use client';

import { use } from 'react';

import { isStoreSubdomain } from 'src/utils/subdomain';

// ----------------------------------------------------------------------

export default function SubdomainCategoryPage({ params }) {
  const { subdomain, category } = use(params);

  // Check if this is a store subdomain
  if (isStoreSubdomain()) {
    // TODO: Implement category page content
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h1>{category} Collection - {subdomain}</h1>
        <p>Category page coming soon...</p>
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
      <p>Category page not found</p>
    </div>
  );
}
