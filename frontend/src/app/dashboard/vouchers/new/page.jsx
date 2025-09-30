import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export const metadata = { title: `Create Voucher | Dashboard - ${CONFIG.site.name}` };

export default function VoucherCreatePage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1>Create New Voucher</h1>
      <p>Voucher creation form is loading...</p>
      <div style={{ marginTop: '16px' }}>
        <button 
          onClick={() => window.location.href = '/dashboard/vouchers'}
          style={{
            padding: '8px 16px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          Back to Vouchers
        </button>
      </div>
    </div>
  );
}
