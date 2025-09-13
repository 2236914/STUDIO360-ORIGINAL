import { useContext } from 'react';

import { CheckoutContext } from './checkout-provider';

// ----------------------------------------------------------------------

export function useCheckoutContext() {
  const context = useContext(CheckoutContext);

  if (!context) throw new Error('useCheckoutContext must be used within a CheckoutProvider');

  return context;
}