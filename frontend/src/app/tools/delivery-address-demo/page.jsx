import { useState } from 'react';

import { Box, Paper, Alert, Container, Typography } from '@mui/material';

import { DeliveryAddressForm } from 'src/components/delivery-address-form';

// ----------------------------------------------------------------------

export default function DeliveryAddressDemoPage() {
  const [submittedData, setSubmittedData] = useState(null);

  const handleAddressSubmit = (data) => {
    console.log('Delivery Address Data:', data);
    setSubmittedData(data);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Delivery Address Form Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        A comprehensive Philippine address form with cascading dropdowns for Province → City/Municipality → Barangay selection.
      </Typography>

      <DeliveryAddressForm 
        onSubmit={handleAddressSubmit}
        sx={{ mb: 4 }}
      />

      {submittedData && (
        <Paper sx={{ p: 3, backgroundColor: 'success.lighter' }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'success.dark' }}>
            ✅ Address Submitted Successfully!
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Complete Address:
            </Typography>
            <Typography variant="body1">
              {submittedData.street}, {submittedData.barangay}, {submittedData.city}, {submittedData.province} {submittedData.zipCode}
            </Typography>
            {submittedData.additionalInfo && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Landmark: {submittedData.additionalInfo}
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Raw Data:
            </Typography>
            <Box
              component="pre"
              sx={{
                backgroundColor: 'background.neutral',
                p: 2,
                borderRadius: 1,
                fontSize: '0.875rem',
                overflow: 'auto',
                maxHeight: 300,
              }}
            >
              {JSON.stringify(submittedData, null, 2)}
            </Box>
          </Box>
        </Paper>
      )}

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Features:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <li>✅ Philippine address hierarchy (Province → City → Barangay)</li>
          <li>✅ Cascading dropdowns with validation</li>
          <li>✅ Real-time address preview</li>
          <li>✅ Responsive design with dark mode support</li>
          <li>✅ Form validation with helpful error messages</li>
          <li>✅ Comprehensive address database (35+ provinces, 800+ cities, 2000+ barangays)</li>
        </Box>
      </Alert>
    </Container>
  );
}
