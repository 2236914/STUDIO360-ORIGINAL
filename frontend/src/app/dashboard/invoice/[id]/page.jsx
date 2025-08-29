import { InvoiceDetailsView } from 'src/sections/invoice/view';

// Mock data - replace with your actual data fetching
const _invoices = [
  {
    id: 'INV-1991',
    invoiceNumber: 'INV-1991',
    createDate: new Date('2025-08-20'),
    dueDate: new Date('2025-09-06'),
    invoiceTo: {
      name: 'Deja Brady',
      email: 'deja.brady@example.com',
      address: '18605 Thompson Circle Apt. 086 - Idaho Falls, WV / 50337',
      phone: '+44 20 7946 0958',
    },
    invoiceFrom: {
      name: 'Lucian Obrien',
      email: 'lucian.obrien@example.com',
      address: '1147 Rohan Drive Suite 819 - Burlington, VT / 82021',
      phone: '+1 416-555-0198',
      profilePicture: '/assets/images/avatar/avatar_1.jpg', // Add this to test with a profile picture
    },
    items: [
      {
        id: 'item-1',
        title: 'Urban Explorer Sneakers',
        description: 'The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pi...',
        service: 'CEO',
        quantity: 11,
        price: 83.74,
        total: 921.14,
      },
      {
        id: 'item-2',
        title: 'Classic Leather Loafers',
        description: 'She eagerly opened the gift, her eyes sparkling with excitement.',
        service: 'CTO',
        quantity: 10,
        price: 97.14,
        total: 971.4,
      },
      {
        id: 'item-3',
        title: 'Mountain Trekking Boots',
        description: 'The old oak tree stood tall and majestic, its branches swaying gently in the breeze.',
        service: 'Project Coordinator',
        quantity: 7,
        price: 68.71,
        total: 480.97,
      },
    ],
    subtotal: 2373.51,
    taxes: 68.71,
    shipping: 52.17,
    discount: 85.21,
    totalAmount: 2304.84,
    status: 'paid',
    sent: 9,
    notes: 'We appreciate your business. Should you need us to add VAT or extra notes let us know!',
    supportEmail: 'support@studio360.com',
  },
];

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Invoice Details | Dashboard',
};

export default function Page({ params }) {
  const { id } = params;

  const currentInvoice = _invoices.find((invoice) => invoice.id === id) || _invoices[0];

  return <InvoiceDetailsView invoice={currentInvoice} />;
}
