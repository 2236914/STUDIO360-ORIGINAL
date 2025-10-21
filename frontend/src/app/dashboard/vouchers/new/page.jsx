import { CONFIG } from 'src/config-global';

import { VoucherCreateView } from 'src/sections/vouchers/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Create Voucher | Dashboard - ${CONFIG.site.name}` };

export default function VoucherCreatePage() {
  return <VoucherCreateView />;
}
