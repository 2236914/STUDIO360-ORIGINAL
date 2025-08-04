import { Container, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export const metadata = { title: 'Tax Calculator | Kitsch Studio' };

export default function TaxCalculatorPage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Tax Calculator
      </Typography>

      {/* Add your tax calculator content here */}
      <Typography variant="body1" color="text.secondary">
        Calculate your taxes here.
      </Typography>
    </Container>
  );
} 