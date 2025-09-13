import { CONFIG } from 'src/config-global';

import { OrdersListView } from 'src/sections/orders/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Orders | Dashboard - ${CONFIG.site.name}` };

export default function OrdersPage() {
  return <OrdersListView />;
}
