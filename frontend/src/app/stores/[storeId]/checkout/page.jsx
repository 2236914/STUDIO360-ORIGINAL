'use client';

import { use, useEffect } from 'react';

import { CONFIG } from 'src/config-global';

import { CheckoutView } from 'src/sections/checkout/view';
import { CheckoutProvider } from 'src/sections/checkout/context';

// ----------------------------------------------------------------------

export default function Page({ params }) {
  // Handle both Promise and resolved params
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const { storeId } = resolvedParams;

  // Set page title dynamically
  useEffect(() => {
    document.title = `Checkout - ${CONFIG.site.name}`;
  }, []);

  return (
    <CheckoutProvider>
      <CheckoutView storeId={storeId} />
    </CheckoutProvider>
  );
}
