import { CONFIG } from 'src/config-global';

import { InventoryCreateView } from 'src/sections/inventory/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Create a new product | Dashboard - ${CONFIG.site.name}` };

export default function InventoryNewPage() {
  return <InventoryCreateView />;
}