import { Container, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export const metadata = { title: 'Settings | Invoices | Kitsch Studio' };

export default function InvoiceSettingsPage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Invoice Settings
      </Typography>

      {/* Add your invoice settings content here */}
      <Typography variant="body1" color="text.secondary">
        Configure your invoice settings here.
      </Typography>
    </Container>
  );
} 