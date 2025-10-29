'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function HistoricalDataImport() {
  const [importType, setImportType] = useState('sales');
  const [importData, setImportData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleImport = async () => {
    try {
      setLoading(true);
      setError('');
      setResult(null);

      let endpoint = '';
      let payload = {};

      switch (importType) {
        case 'sales':
          endpoint = '/api/analytics/import/historical-sales';
          payload = { sales: JSON.parse(importData) };
          break;
        case 'orders':
          endpoint = '/api/analytics/import/historical-orders';
          payload = { orders: JSON.parse(importData) };
          break;
        case 'products':
          endpoint = '/api/analytics/import/historical-products';
          payload = { products: JSON.parse(importData) };
          break;
        case 'csv':
          endpoint = '/api/analytics/import/csv-sales';
          payload = { csvData: importData };
          break;
        default:
          throw new Error('Invalid import type');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await response.json();
      
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Import failed');
      }

      setResult(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getTemplate = () => {
    switch (importType) {
      case 'sales':
        return JSON.stringify([
          {
            date: '2024-01-15',
            invoice_no: 'INV-001',
            source: 'Shopee',
            reference: 'REF-001',
            total_revenue: 1000.00,
            fees: 50.00,
            cash_received: 950.00,
            remarks: 'Historical sale'
          }
        ], null, 2);
      case 'orders':
        return JSON.stringify([
          {
            order_number: 'ORD-001',
            order_date: '2024-01-15',
            customer_name: 'John Doe',
            customer_email: 'john@example.com',
            status: 'completed',
            subtotal: 100.00,
            total: 100.00,
            items: [
              {
                product_name: 'Product A',
                product_sku: 'SKU-001',
                unit_price: 50.00,
                quantity: 2,
                subtotal: 100.00,
                total: 100.00
              }
            ]
          }
        ], null, 2);
      case 'products':
        return JSON.stringify([
          {
            name: 'Product A',
            sku: 'SKU-001',
            category: 'Electronics',
            price: 50.00,
            cost: 25.00,
            stock_quantity: 100,
            low_stock_threshold: 10,
            stock_status: 'in stock',
            description: 'Product description'
          }
        ], null, 2);
      case 'csv':
        return 'date,invoice_no,source,total_revenue,fees,cash_received\n2024-01-15,INV-001,Shopee,1000.00,50.00,950.00';
      default:
        return '';
    }
  };

  const loadTemplate = () => {
    setImportData(getTemplate());
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Import Historical Data
      </Typography>

      <Grid container spacing={3}>
        {/* Import Type Selection */}
        <Grid xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Import Type
            </Typography>
            
            <Stack spacing={2}>
              {[
                { value: 'sales', label: 'Sales Data', icon: 'eva:trending-up-fill' },
                { value: 'orders', label: 'Orders & Products', icon: 'eva:shopping-cart-fill' },
                { value: 'products', label: 'Product Inventory', icon: 'eva:cube-fill' },
                { value: 'csv', label: 'CSV Sales Data', icon: 'eva:file-text-fill' }
              ].map((type) => (
                <Button
                  key={type.value}
                  variant={importType === type.value ? 'contained' : 'outlined'}
                  onClick={() => setImportType(type.value)}
                  startIcon={<Iconify icon={type.icon} />}
                  fullWidth
                >
                  {type.label}
                </Button>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Data Input */}
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Data Input
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={loadTemplate}
                startIcon={<Iconify icon="eva:file-text-fill" />}
              >
                Load Template
              </Button>
            </Stack>

            <TextField
              multiline
              rows={12}
              fullWidth
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your data here or click 'Load Template' for format example"
              sx={{ mb: 2 }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={loading || !importData.trim()}
                startIcon={<Iconify icon="eva:upload-fill" />}
              >
                Import Data
              </Button>
              <Button
                variant="outlined"
                onClick={() => setImportData('')}
                disabled={loading}
              >
                Clear
              </Button>
            </Stack>

            {loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Importing data...
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {result && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Successfully imported {result.imported} records out of {result.total || 'unknown'} total.
                </Typography>
                {result.errors && result.errors.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="error">
                      Errors: {result.errors.join(', ')}
                    </Typography>
                  </Box>
                )}
              </Alert>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Instructions */}
      <Card sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Import Instructions
        </Typography>
        
        <Grid container spacing={2}>
          <Grid xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              📊 Sales Data Format:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Include: date, invoice_no, source, total_revenue, fees, cash_received
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              🛒 Orders Format:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Include: order_number, order_date, customer info, items array
            </Typography>
          </Grid>
          
          <Grid xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              📦 Products Format:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Include: name, sku, category, price, cost, stock_quantity
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              📄 CSV Format:
            </Typography>
            <Typography variant="body2">
              Headers: date,invoice_no,source,total_revenue,fees,cash_received
            </Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
