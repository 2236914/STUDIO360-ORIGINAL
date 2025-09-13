import { CONFIG } from 'src/config-global';

import { CheckoutView } from 'src/sections/checkout/view';
import { CheckoutProvider } from 'src/sections/checkout/context';

// ----------------------------------------------------------------------

export const metadata = { title: `Checkout - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <CheckoutProvider>
      <CheckoutView />
    </CheckoutProvider>
  );
}
