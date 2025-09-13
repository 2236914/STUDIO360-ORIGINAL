import { CONFIG } from 'src/config-global';

import { InventoryListView } from 'src/sections/inventory/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Inventory | Dashboard - ${CONFIG.site.name}` };

export default function InventoryPage() {
  return <InventoryListView />;
} 