'use client';

import { useState } from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardHeader, Stack, Chip, Alert } from '@mui/material';

import { DeliveryAddressForm } from 'src/components/delivery-address-form';
import { calculateShippingOptions, getRegionDisplayName, getShippingRegion, MOCK_SELLER_SHIPPING_CONFIG } from 'src/utils/shipping-calculator';

// ----------------------------------------------------------------------

export default function ShippingDemoPage() {
  const [customerAddress, setCustomerAddress] = useState(null);
  const [availableShipping, setAvailableShipping] = useState([]);
  const [customerRegion, setCustomerRegion] = useState(null);

  const handleAddressChange = (data) => {
    setCustomerAddress(data);
    
    if (data.province) {
      const region = getShippingRegion(data.province);
      setCustomerRegion(region);
      
      const options = calculateShippingOptions(data.province, data.city);
      setAvailableShipping(options);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Dynamic Shipping Calculator Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        See how delivery fees automatically calculate based on customer address and seller's shipping configuration.
      </Typography>

      <Grid container spacing={4}>
        {/* Seller Configuration Panel */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: 'fit-content' }}>
            <CardHeader 
              title="🏪 Seller's Shipping Configuration" 
              subheader="Kitsch Studio's configured couriers and rates"
              titleTypographyProps={{ fontWeight: 600 }}
            />
            
            <Box sx={{ p: 3, pt: 0 }}>
              <Stack spacing={3}>
                {/* Active Couriers */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Available Couriers:
                  </Typography>
                  <Stack spacing={1.5}>
                    {MOCK_SELLER_SHIPPING_CONFIG.couriers.map((courier) => (
                      <Box
                        key={courier.id}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: courier.active ? 'success.light' : 'grey.300',
                          borderRadius: 1,
                          bgcolor: courier.active ? 'success.lighter' : 'grey.50',
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {courier.name}
                          </Typography>
                          <Chip 
                            label={courier.active ? 'Active' : 'Inactive'} 
                            color={courier.active ? 'success' : 'default'}
                            size="small"
                          />
                        </Stack>
                        
                        {courier.active && (
                          <Stack spacing={1} sx={{ mt: 1 }}>
                            {courier.shippingTypes.map((shipping, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  px: 1,
                                  py: 0.5,
                                  bgcolor: 'background.paper',
                                  borderRadius: 0.5,
                                }}
                              >
                                <Typography variant="caption">
                                  {getRegionDisplayName(shipping.region)}
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  PHP {shipping.fee}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Regional Coverage Map */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Regional Coverage:
                  </Typography>
                  <Grid container spacing={1}>
                    {[
                      { region: 'metro-manila', name: 'Metro Manila', available: true },
                      { region: 'luzon', name: 'Luzon', available: true },
                      { region: 'visayas', name: 'Visayas', available: true },
                      { region: 'mindanao', name: 'Mindanao', available: true },
                      { region: 'islands', name: 'Islands', available: false },
                    ].map((region) => (
                      <Grid item xs={6} sm={4} key={region.region}>
                        <Chip
                          label={region.name}
                          color={region.available ? 'primary' : 'default'}
                          variant={region.available ? 'filled' : 'outlined'}
                          size="small"
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* Customer Address & Shipping Calculator */}
        <Grid item xs={12} lg={7}>
          <Stack spacing={3}>
            {/* Customer Address Form */}
            <DeliveryAddressForm 
              onSubmit={handleAddressChange}
              title="🏠 Customer Delivery Address"
              sx={{ mb: 3 }}
            />

            {/* Dynamic Shipping Results */}
            {customerAddress && customerRegion && (
              <Card>
                <CardHeader 
                  title="🚚 Calculated Shipping Options" 
                  subheader={`Delivery to ${getRegionDisplayName(customerRegion)}`}
                  titleTypographyProps={{ fontWeight: 600 }}
                />
                
                <Box sx={{ p: 3, pt: 0 }}>
                  {availableShipping.length > 0 ? (
                    <Stack spacing={2}>
                      {availableShipping.map((option, index) => (
                        <Paper
                          key={option.id}
                          sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: index === 0 ? 'primary.main' : 'divider',
                            bgcolor: index === 0 ? 'primary.lighter' : 'background.paper',
                          }}
                        >
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {option.courierName}
                                </Typography>
                                {index === 0 && (
                                  <Chip label="Recommended" color="primary" size="small" />
                                )}
                              </Stack>
                              <Typography variant="body2" color="text.secondary">
                                {option.description}
                              </Typography>
                              <Typography variant="caption" color="text.disabled">
                                Ships to: {getRegionDisplayName(option.region)}
                              </Typography>
                            </Stack>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {option.fee === 0 ? 'FREE' : `PHP ${option.fee}`}
                            </Typography>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="warning">
                      No shipping options available for this region. Please contact the seller.
                    </Alert>
                  )}
                </Box>
              </Card>
            )}

            {/* Address Summary */}
            {customerAddress && (
              <Card>
                <CardHeader 
                  title="📋 Order Summary" 
                  titleTypographyProps={{ fontWeight: 600 }}
                />
                
                <Box sx={{ p: 3, pt: 0 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Delivery Address:
                      </Typography>
                      <Typography variant="body2">
                        {customerAddress.street}, {customerAddress.barangay}<br />
                        {customerAddress.city}, {customerAddress.province} {customerAddress.zipCode}
                        {customerAddress.additionalInfo && (
                          <><br />Landmark: {customerAddress.additionalInfo}</>
                        )}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Shipping Region:
                      </Typography>
                      <Chip 
                        label={getRegionDisplayName(customerRegion)} 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>

                    {availableShipping.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Selected Shipping:
                        </Typography>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: 'success.lighter',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'success.light',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                            {availableShipping[0].courierName} - {availableShipping[0].fee === 0 ? 'FREE' : `PHP ${availableShipping[0].fee}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'success.main' }}>
                            {availableShipping[0].description}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* How It Works */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          🔧 How the Dynamic Shipping Calculator Works:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <li>✅ Customer selects their delivery address (Province → City → Barangay)</li>
          <li>✅ System automatically determines their shipping region (Metro Manila, Luzon, Visayas, Mindanao, Islands)</li>
          <li>✅ Available couriers and rates are filtered based on seller's configuration for that region</li>
          <li>✅ Cheapest option is automatically selected (Free shipping prioritized if available)</li>
          <li>✅ Real-time updates when address changes</li>
          <li>✅ Integrates seamlessly with checkout flow</li>
        </Box>
      </Alert>
    </Container>
  );
}
