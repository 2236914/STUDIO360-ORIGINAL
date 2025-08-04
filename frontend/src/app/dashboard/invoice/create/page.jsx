import { Container, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export const metadata = { title: 'Create Invoice | Invoices | Kitsch Studio' };

export default function InvoiceCreatePage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Create New Invoice
      </Typography>

      {/* Add your invoice creation form here */}
      <Typography variant="body1" color="text.secondary">
        Create a new invoice here.
      </Typography>
    </Container>
  );
} 