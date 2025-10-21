import { CONFIG } from 'src/config-global';

import { VoucherListViewInvoiceStyle } from 'src/sections/vouchers/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Vouchers | Dashboard - ${CONFIG.site.name}` };

export default function VouchersPage() {
  return <VoucherListViewInvoiceStyle />;
}
