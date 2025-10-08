'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getCurrentStoreId, isStoreSubdomain } from 'src/utils/subdomain';

// ----------------------------------------------------------------------

export default function SubdomainLayout({ children }) {
  const params = useParams();
  const subdomain = params?.subdomain;

  useEffect(() => {
    // Set page title based on subdomain
    if (subdomain && isStoreSubdomain()) {
      const storeId = getCurrentStoreId();
      if (storeId) {
        // Capitalize first letter of each word for display
        const displayName = storeId
          .split(/[-_]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        document.title = `${displayName} | STUDIO360`;
      }
    }
  }, [subdomain]);

  return <>{children}</>;
}
