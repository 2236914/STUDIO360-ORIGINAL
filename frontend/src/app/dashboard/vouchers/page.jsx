import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export const metadata = { title: `Vouchers | Dashboard - ${CONFIG.site.name}` };

export default function VouchersPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1>Vouchers</h1>
      <p>Voucher management system is loading...</p>
      <div style={{ marginTop: '16px' }}>
        <button 
          onClick={() => window.location.href = '/dashboard/vouchers/new'}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create New Voucher
        </button>
      </div>
    </div>
  );
}
