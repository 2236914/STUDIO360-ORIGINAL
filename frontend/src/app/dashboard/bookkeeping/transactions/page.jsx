import { Container, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export const metadata = { title: 'Transactions | Bookkeeping | Kitsch Studio' };

export default function BookkeepingTransactionsPage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Transactions
      </Typography>

      {/* Add your transactions content here */}
      <Typography variant="body1" color="text.secondary">
        View and manage your financial transactions here.
      </Typography>
    </Container>
  );
} 