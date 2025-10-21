import { useState } from 'react';

import { Alert, Button, Container, Typography } from '@mui/material';

import { DeliveryAddressForm } from './delivery-address-form';

// ----------------------------------------------------------------------

export function DeliveryAddressExample() {
  const [submittedData, setSubmittedData] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const handleAddressSubmit = (data) => {
    console.log('Address submitted:', data);
    setSubmittedData(data);
    setShowForm(false);
  };

  const handleReset = () => {
    setSubmittedData(null);
    setShowForm(true);
  };

  if (!showForm && submittedData) {
    return (
      <Container maxWidth="md">
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            ✅ Address Submitted Successfully!
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Complete Address:</strong><br />
            {submittedData.street}, {submittedData.barangay}, {submittedData.city}, {submittedData.province} {submittedData.zipCode}
            {submittedData.additionalInfo && (
              <><br /><strong>Landmark:</strong> {submittedData.additionalInfo}</>
            )}
          </Typography>
          <Button variant="outlined" onClick={handleReset}>
            Enter Another Address
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mb: 1 }}>
        Delivery Address Form
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Enter your complete delivery address using the Philippine address hierarchy.
      </Typography>
      
      <DeliveryAddressForm 
        onSubmit={handleAddressSubmit}
        defaultValues={{
          // You can pre-fill values here if needed
          // province: 'BATANGAS',
          // city: 'LIPA CITY'
        }}
      />
    </Container>
  );
}
