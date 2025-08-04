import { Container, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export const metadata = { title: 'Reports | Bookkeeping | Kitsch Studio' };

export default function BookkeepingReportsPage() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Financial Reports
      </Typography>

      {/* Add your reports content here */}
      <Typography variant="body1" color="text.secondary">
        Generate and view your financial reports here.
      </Typography>
    </Container>
  );
} 