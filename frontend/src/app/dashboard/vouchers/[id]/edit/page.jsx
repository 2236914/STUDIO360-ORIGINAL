import { CONFIG } from 'src/config-global';

import { VoucherEditView } from 'src/sections/vouchers/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Edit Voucher | Dashboard - ${CONFIG.site.name}` };

export default function VoucherEditPage({ params }) {
  return <VoucherEditView id={params.id} />;
}
