'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function InvoiceCreateFormNew() {
  const router = useRouter();
  
  // Simple state management without complex watching
  const [formData, setFormData] = useState({
    invoiceNumber: 'INV-1990',
    status: 'draft',
    createDate: '20/08/2025',
    dueDate: '',
    currency: 'USD',
    shipping: 0,
    discount: 0,
    taxes: 0,
    fromCustomer: {
      name: 'Jayvion Simon',
      company: 'Gleichner, Mueller and Tromp',
      address: '19034 Verna Unions Apt. 164 - Honolulu, RI / 87535',
      phone: '+1 202-555-0143',
      isDefault: true
    },
    toCustomer: null,
    items: [{
      title: '',
      description: '',
      service: '',
      quantity: 1,
      price: 0,
      total: 0
    }],
    notes: 'We appreciate your business. Should you need us to add VAT or extra notes let us know!',
    supportEmail: 'support@studio360.com'
  });

  // Customer selection modal state
  const [openCustomerModal, setOpenCustomerModal] = useState(false);
  const [openFromCustomerModal, setOpenFromCustomerModal] = useState(false);

  // Mock customer data (in real app, this would come from API)
  const customers = [
    {
      id: 1,
      name: 'Jayvion Simon',
      company: 'Gleichner, Mueller and Tromp',
      address: '19034 Verna Unions Apt. 164 - Honolulu, RI / 87535',
      phone: '+1 202-555-0143',
      isDefault: true
    },
    {
      id: 2,
      name: 'Lucian Obrien',
      company: 'Nikolaus-Leuschke',
      address: '27137 Ashlee Court - Portland, OR / 97205',
      phone: '+1 503-555-0123'
    },
    {
      id: 3,
      name: 'Deja Brady',
      company: 'Hegmann, Kreiger and Bayer',
      address: '12345 Business Ave - New York, NY / 10001',
      phone: '+1 212-555-0199'
    },
    {
      id: 4,
      name: 'Harrison Stein',
      company: 'Grimes Inc',
      address: '67890 Corporate Blvd - Los Angeles, CA / 90210',
      phone: '+1 310-555-0167'
    }
  ];

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({ ...prev, toCustomer: customer }));
    setOpenCustomerModal(false);
  };

  const handleFromCustomerSelect = (customer) => {
    setFormData(prev => ({ ...prev, fromCustomer: customer }));
    setOpenFromCustomerModal(false);
  };

  // Get currency symbol
  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      PHP: '₱'
    };
    return symbols[currency] || '$';
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateTaxAmount = () => {
    return (calculateSubtotal() * (formData.taxes || 0)) / 100;
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = parseFloat(formData.shipping) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const taxAmount = calculateTaxAmount();
    return subtotal + shipping - discount + taxAmount;
  };

  // Update form data
  const updateFormData = useCallback((path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (keys[i].includes('[') && keys[i].includes(']')) {
          const [key, indexStr] = keys[i].split('[');
          const index = parseInt(indexStr.replace(']', ''));
          if (!current[key]) current[key] = [];
          if (!current[key][index]) current[key][index] = {};
          current = current[key][index];
        } else {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
      }
      
      const lastKey = keys[keys.length - 1];
      if (lastKey.includes('[') && lastKey.includes(']')) {
        const [key, indexStr] = lastKey.split('[');
        const index = parseInt(indexStr.replace(']', ''));
        if (!current[key]) current[key] = [];
        current[key][index] = value;
      } else {
        current[lastKey] = value;
      }
      
      return newData;
    });
  }, []);

  // Update item and recalculate total
  const updateItem = useCallback((index, field, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const items = [...newData.items];
      
      if (field === 'quantity' || field === 'price') {
        const numValue = parseFloat(value) || 0;
        items[index] = { ...items[index], [field]: numValue };
        items[index].total = (items[index].quantity || 0) * (items[index].price || 0);
      } else {
        items[index] = { ...items[index], [field]: value };
      }
      
      return { ...newData, items };
    });
  }, []);

  const addItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        title: '',
        description: '',
        service: '',
        quantity: 1,
        price: 0,
        total: 0
      }]
    }));
  }, []);

  const removeItem = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    
    // Validate that a customer is selected
    if (!formData.toCustomer) {
      alert('Please select a customer for the invoice');
      return;
    }
    
    // Validate notes and support email
    if (!formData.notes.trim()) {
      alert('Please add notes for the invoice');
      return;
    }
    
    if (!formData.supportEmail.trim()) {
      alert('Please add a support email address');
      return;
    }
    
    router.push(paths.dashboard.invoice.root);
  };

  const currencySymbol = getCurrencySymbol(formData.currency);

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        {/* From and To Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* From Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontSize: '1rem' }}>
                From:
              </Typography>
              <Button
                size="small"
                startIcon={<Iconify icon="solar:pen-bold" width={18} />}
                onClick={() => setOpenFromCustomerModal(true)}
                sx={{ fontSize: '0.875rem', px: 1.5, py: 0.5 }}
              >
                Edit
              </Button>
            </Box>
            <Box sx={{ color: 'text.primary' }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {formData.fromCustomer.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                {formData.fromCustomer.company}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                {formData.fromCustomer.address}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {formData.fromCustomer.phone}
              </Typography>
            </Box>
          </Grid>

          {/* To Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontSize: '1rem' }}>
                To:
              </Typography>
              <Button
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" width={18} />}
                onClick={() => setOpenCustomerModal(true)}
                sx={{ fontSize: '0.875rem', px: 1.5, py: 0.5 }}
              >
                Select Customer
              </Button>
            </Box>
            {formData.toCustomer ? (
              <Box sx={{ color: 'text.primary' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {formData.toCustomer.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  {formData.toCustomer.company}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  {formData.toCustomer.address}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {formData.toCustomer.phone}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                <Typography variant="body2">
                  No customer selected
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Invoice Details */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              label="Invoice number"
              fullWidth
              size="small"
              value={formData.invoiceNumber}
              onChange={(e) => updateFormData('invoiceNumber', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Currency</InputLabel>
              <Select 
                value={formData.currency} 
                label="Currency"
                onChange={(e) => updateFormData('currency', e.target.value)}
              >
                <MenuItem value="USD">USD ($)</MenuItem>
                <MenuItem value="EUR">EUR (€)</MenuItem>
                <MenuItem value="GBP">GBP (£)</MenuItem>
                <MenuItem value="JPY">JPY (¥)</MenuItem>
                <MenuItem value="CAD">CAD (C$)</MenuItem>
                <MenuItem value="AUD">AUD (A$)</MenuItem>
                <MenuItem value="PHP">PHP (₱)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select 
                value={formData.status} 
                label="Status"
                onChange={(e) => updateFormData('status', e.target.value)}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Create date"
              fullWidth
              size="small"
              value={formData.createDate}
              onChange={(e) => updateFormData('createDate', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Due date"
              fullWidth
              size="small"
              value={formData.dueDate}
              onChange={(e) => updateFormData('dueDate', e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Details Section */}
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1.125rem', fontWeight: 600 }}>
          Details:
        </Typography>

        {/* Column Headers */}
        <Grid container spacing={2} sx={{ mb: 2, px: 1 }}>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
              Title
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
              Description
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
              Service
            </Typography>
          </Grid>
          <Grid item xs={12} sm={1}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
              Quantity
            </Typography>
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
              Price
            </Typography>
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
              Total
            </Typography>
          </Grid>
        </Grid>

        {/* Items */}
        {formData.items.map((item, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2, px: 1, alignItems: 'flex-start' }}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                value={item.title}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Service"
                value={item.service}
                onChange={(e) => updateItem(index, 'service', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={1.5}>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={item.price.toFixed(2)}
                onChange={(e) => updateItem(index, 'price', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                  {currencySymbol} {item.total.toFixed(2)}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => removeItem(index)}
                  startIcon={<Iconify icon="solar:trash-bin-minimalistic-bold" width={16} />}
                  sx={{ fontSize: '0.75rem', minWidth: 'auto' }}
                >
                  Remove
                </Button>
              </Box>
            </Grid>
          </Grid>
        ))}

        {/* Add Item Button */}
        <Button
          variant="outlined"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={addItem}
          sx={{ mt: 1, mb: 4 }}
        >
          Add Item
        </Button>

        {/* Bottom Section - Shipping, Discount, Taxes, Subtotal */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={3} justifyContent="flex-end">
            <Grid item xs={12} sm={8} md={5}>
              <Stack spacing={2}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      Shipping({currencySymbol})
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      inputProps={{ min: 0 }}
                      value={formData.shipping}
                      onChange={(e) => updateFormData('shipping', e.target.value)}
                      sx={{ 
                        '& .MuiInputBase-input': { 
                          textAlign: 'right',
                          fontSize: '0.875rem'
                        } 
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      Discount({currencySymbol})
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      inputProps={{ min: 0 }}
                      value={formData.discount}
                      onChange={(e) => updateFormData('discount', e.target.value)}
                      sx={{ 
                        '& .MuiInputBase-input': { 
                          textAlign: 'right',
                          fontSize: '0.875rem'
                        } 
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      Taxes(%)
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      inputProps={{ min: 0, max: 100 }}
                      value={formData.taxes}
                      onChange={(e) => updateFormData('taxes', e.target.value)}
                      sx={{ 
                        '& .MuiInputBase-input': { 
                          textAlign: 'right',
                          fontSize: '0.875rem'
                        } 
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      Tax Amount
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ textAlign: 'right', fontSize: '0.875rem' }}>
                      {currencySymbol}{calculateTaxAmount().toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      Subtotal
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'right', fontSize: '1rem' }}>
                      {currencySymbol}{calculateSubtotal().toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      Grand Total
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'right', fontSize: '1rem', color: 'primary.main' }}>
                      {currencySymbol}{calculateGrandTotal().toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Notes and Support Section */}
        <Box sx={{ 
          mt: 4, 
          pt: 3, 
          borderTop: '1px solid', 
          borderColor: 'divider',
          bgcolor: 'grey.50',
          p: 3,
          borderRadius: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Iconify icon="solar:chat-round-dots-bold" width={20} sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Notes & Support Information
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                NOTES
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="We appreciate your business. Should you need us to add VAT or extra notes let us know!"
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                inputProps={{ maxLength: 500 }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem'
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                This message will appear at the bottom of your invoice
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block', textAlign: 'right' }}>
                {formData.notes.length}/500 characters
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                Have a question?
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="support@studio360.com"
                value={formData.supportEmail}
                onChange={(e) => updateFormData('supportEmail', e.target.value)}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem'
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                Contact email for customer support inquiries
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Notes Preview Section */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Iconify icon="solar:eye-bold" width={20} sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Preview
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 1, fontWeight: 600 }}>
                  NOTES
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  {formData.notes}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 1, fontWeight: 600 }}>
                  Have a question?
                </Typography>
                <Typography variant="body2" sx={{ color: 'primary.main', fontSize: '0.875rem' }}>
                  {formData.supportEmail}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => router.push(paths.dashboard.invoice.root)}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Create & Send
          </Button>
        </Box>
      </Card>

      {/* Customer Selection Modal */}
      {openCustomerModal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
          onClick={() => setOpenCustomerModal(false)}
        >
          <Card
            sx={{
              maxWidth: 600,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Customers</Typography>
                <Button
                  size="small"
                  sx={{ fontSize: '0.875rem' }}
                >
                  + New
                </Button>
              </Box>
              
              {/* Search Bar */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
                InputProps={{
                  startAdornment: <Iconify icon="eva:search-fill" width={20} sx={{ mr: 1, color: 'text.disabled' }} />,
                }}
                sx={{ mb: 2 }}
              />
            </Box>

            {/* Customer List */}
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', p: 0 }}>
              {customers.map((customer) => (
                <Box
                  key={customer.id}
                  sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {customer.name}
                    </Typography>
                    {customer.isDefault && (
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          backgroundColor: 'primary.lighter',
                          color: 'primary.main',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        Default
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: 'success.main', mb: 0.5 }}>
                    {customer.company}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    {customer.address}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {customer.phone}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      )}

      {/* From Customer Selection Modal */}
      {openFromCustomerModal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
          onClick={() => setOpenFromCustomerModal(false)}
        >
          <Card
            sx={{
              maxWidth: 600,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Select From Address</Typography>
                <Button
                  size="small"
                  sx={{ fontSize: '0.875rem' }}
                >
                  + New
                </Button>
              </Box>
              
              {/* Search Bar */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
                InputProps={{
                  startAdornment: <Iconify icon="eva:search-fill" width={20} sx={{ mr: 1, color: 'text.disabled' }} />,
                }}
                sx={{ mb: 2 }}
              />
            </Box>

            {/* Customer List */}
            <Box sx={{ maxHeight: '60vh', overflow: 'auto', p: 0 }}>
              {customers.map((customer) => (
                <Box
                  key={customer.id}
                  sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                  onClick={() => handleFromCustomerSelect(customer)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {customer.name}
                    </Typography>
                    {customer.isDefault && (
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          backgroundColor: 'primary.lighter',
                          color: 'primary.main',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        Default
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: 'success.main', mb: 0.5 }}>
                    {customer.company}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    {customer.address}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {customer.phone}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  );
}