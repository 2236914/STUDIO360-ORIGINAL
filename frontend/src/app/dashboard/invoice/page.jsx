import { Container, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export const metadata = { title: 'Invoices | Kitsch Studio' };

export default function InvoicePage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Invoices
      </Typography>

      <Typography variant="body1" color="text.secondary">
        Invoice functionality has been removed from this application.
      </Typography>
    </Container>
  );
} 