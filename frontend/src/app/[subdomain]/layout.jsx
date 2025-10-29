'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import { isStoreSubdomain, getCurrentStoreId } from 'src/utils/subdomain';
import { CheckoutProvider } from 'src/sections/checkout/context';
import { Snackbar } from 'src/components/snackbar';
import CouponModal from 'src/components/coupon-modal';

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

  return (
    <CheckoutProvider>
      <Snackbar />
      {subdomain && isStoreSubdomain() ? (
        <CouponModal storeId={subdomain} />
      ) : null}
      {children}
    </CheckoutProvider>
  );
}
