import { use } from 'react';

import { CONFIG } from 'src/config-global';

import { VoucherDetailsView } from 'src/sections/vouchers/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Voucher Details | Dashboard - ${CONFIG.site.name}` };

export default function VoucherDetailsPage({ params }) {
  const { id } = use(params);
  return <VoucherDetailsView id={id} />;
}
