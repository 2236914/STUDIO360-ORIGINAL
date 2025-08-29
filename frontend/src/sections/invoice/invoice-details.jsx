import PropTypes from 'prop-types';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';

import { fCurrencyPHPSymbol } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// PDF generation imports
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import NoSsr from '@mui/material/NoSsr';
import { InvoicePDFTemplate } from './invoice-pdf-template';

// ----------------------------------------------------------------------

export function InvoiceDetails({ invoice }) {
  const theme = useTheme();

  const [status, setStatus] = useState(invoice?.status || 'paid');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    invoiceNumber: invoice?.invoiceNumber || 'INV-1991',
    status: invoice?.status || 'paid',
    createDate: invoice?.createDate ? new Date(invoice.createDate).toISOString().split('T')[0] : '2025-08-20',
    dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '2025-09-06',
    invoiceFrom: {
      name: invoice?.invoiceFrom?.name || 'Lucian Obrien',
      address: invoice?.invoiceFrom?.address || '1147 Rohan Drive Suite 819 - Burlington, VT / 82021',
      phone: invoice?.invoiceFrom?.phone || '+1 416-555-0198',
    },
    invoiceTo: {
      name: invoice?.invoiceTo?.name || 'Deja Brady',
      address: invoice?.invoiceTo?.address || '18605 Thompson Circle Apt. 086 - Idaho Falls, WV / 50337',
      phone: invoice?.invoiceTo?.phone || '+44 20 7946 0958',
    },
    items: invoice?.items || [
      {
        id: 'item-1',
        title: 'Urban Explorer Sneakers',
        description: 'The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pi...',
        service: 'CEO',
        quantity: 11,
        price: 83.74,
        total: 921.14,
      },
      {
        id: 'item-2', 
        title: 'Classic Leather Loafers',
        description: 'She eagerly opened the gift, her eyes sparkling with excitement.',
        service: 'CTO',
        quantity: 10,
        price: 97.14,
        total: 971.4,
      },
      {
        id: 'item-3',
        title: 'Mountain Trekking Boots',
        description: 'The old oak tree stood tall and majestic, its branches swaying gently in the breeze.',
        service: 'Project Coordinator',
        quantity: 7,
        price: 68.71,
        total: 480.97,
      },
    ],
    shipping: invoice?.shipping || 52.17,
    discount: invoice?.discount || 85.21,
    taxes: invoice?.taxes || 68.71,
    subtotal: invoice?.subtotal || 2373.51,
    totalAmount: invoice?.totalAmount || 2304.84,
    notes: invoice?.notes || 'We appreciate your business. Should you need us to add VAT or extra notes let us know!',
    supportEmail: invoice?.supportEmail || 'support@abcapp.com',
  });

  const handleEditModalOpen = () => setEditModalOpen(true);
  const handleEditModalClose = () => setEditModalOpen(false);

  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedFormChange = (parent, field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    setEditFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSaveChanges = () => {
    // Here you would typically save the changes to your backend
    console.log('Saving changes:', editFormData);
    setEditModalOpen(false);
    // You could also update the invoice state here if needed
  };

  const handleDownloadPDF = async () => {
    try {
      // Pre-process invoice data to ensure all Date objects are converted to strings
      const safeInvoiceData = {
        ...invoice,
        createDate: invoice?.createDate instanceof Date 
          ? invoice.createDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : invoice?.createDate || '28 Aug 2023',
        dueDate: invoice?.dueDate instanceof Date 
          ? invoice.dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : invoice?.dueDate || '06 Sep 2023',
        // Ensure all other fields are safe
        invoiceNumber: String(invoice?.invoiceNumber || 'INV-1991'),
        status: String(invoice?.status || 'paid'),
        subtotal: invoice?.subtotal ? String(invoice.subtotal) : '2,373.51',
        taxes: invoice?.taxes ? String(invoice.taxes) : '68.71',
        shipping: invoice?.shipping ? String(invoice.shipping) : '52.17',
        discount: invoice?.discount ? String(invoice.discount) : '85.21',
        totalAmount: invoice?.totalAmount ? String(invoice.totalAmount) : '2,304.84',
      };

      const blob = await pdf(<InvoicePDFTemplate invoice={safeInvoiceData} currentStatus={status} />).toBlob();
      saveAs(blob, `${safeInvoiceData.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrint = () => {
    setPrintPreviewOpen(true);
  };

  const handleClosePrintPreview = () => {
    setPrintPreviewOpen(false);
  };

  const handlePrintFromPreview = () => {
    // Trigger print for the PDF viewer
    window.print();
  };

  const renderTop = (
    <Box sx={{ p: 3 }}>
      {/* Header with action buttons only */}
    <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        sx={{ mb: 4 }}
      >
        <Stack direction="row" spacing={1} alignItems="center" className="invoice-actions">
          <Tooltip title="Edit invoice">
            <IconButton
              onClick={handleEditModalOpen}
              sx={{
                width: 36,
                height: 36,
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Iconify icon="solar:pen-bold" width={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download invoice">
            <IconButton
              onClick={handleDownloadPDF}
              sx={{
                width: 36,
                height: 36,
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Iconify icon="solar:download-bold" width={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Print invoice">
            <IconButton
              onClick={handlePrint}
              sx={{
                width: 36,
                height: 36,
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Iconify icon="solar:printer-minimalistic-bold" width={18} />
            </IconButton>
          </Tooltip>

          <Label
            variant="filled"
            color={
              (status === 'paid' && 'success') ||
              (status === 'pending' && 'warning') ||
              (status === 'overdue' && 'error') ||
              'default'
            }
      sx={{
              textTransform: 'capitalize',
              fontWeight: 600,
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            {status}
          </Label>
        </Stack>
      </Stack>

      {/* Logo and Invoice Number Section */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        {invoice?.invoiceFrom?.profilePicture ? (
          <Box
            component="img"
            src={invoice.invoiceFrom.profilePicture}
            alt={invoice.invoiceFrom.name || 'Profile'}
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1.5,
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              bgcolor: 'success.main',
              color: 'common.white',
              typography: 'h5',
              fontWeight: 'bold',
            }}
          >
            {invoice?.invoiceFrom?.name ? invoice.invoiceFrom.name.charAt(0).toUpperCase() : 'M'}
          </Box>
        )}

        <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
            Paid
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {invoice?.invoiceNumber || 'INV-1991'}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );

  const renderInfo = (
    <Box sx={{ p: 3, pt: 0 }}>
      {/* Invoice from and Invoice to side by side */}
    <Stack
        spacing={4}
      direction={{ xs: 'column', md: 'row' }}
        sx={{ mb: 4 }}
    >
        {/* Invoice from */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2, fontWeight: 600 }}>
          Invoice from
        </Typography>

          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
            {invoice?.invoiceFrom?.name || 'Lucian Obrien'}
        </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            {invoice?.invoiceFrom?.address || '1147 Rohan Drive Suite 819 - Burlington, VT / 82021'}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Phone: {invoice?.invoiceFrom?.phone || '+1 416-555-0198'}
        </Typography>
        </Box>

        {/* Invoice to */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2, fontWeight: 600 }}>
          Invoice to
        </Typography>

          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
            {invoice?.invoiceTo?.name || 'Deja Brady'}
        </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            {invoice?.invoiceTo?.address || '18605 Thompson Circle Apt. 086 - Idaho Falls, WV / 50337'}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Phone: {invoice?.invoiceTo?.phone || '+44 20 7946 0958'}
        </Typography>
        </Box>
      </Stack>

      {/* Date created and Due date side by side */}
      <Stack
        spacing={4}
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ mb: 4 }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
            Date create
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            {fDate(invoice?.createDate) || '20 Aug 2025'}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
            Due date
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            {fDate(invoice?.dueDate) || '06 Sep 2025'}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );

  const renderTable = (
    <Box sx={{ p: 3, pt: 0 }}>
      {/* Table Header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { 
            xs: 'repeat(1, 1fr)', 
            md: '60px 2fr 80px 120px 120px' 
          },
          gap: 2,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          #
        </Typography>

        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Description
        </Typography>

        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, textAlign: 'center' }}>
          Qty
        </Typography>

        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, textAlign: 'right' }}>
          Unit price
        </Typography>

        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, textAlign: 'right' }}>
          Total
        </Typography>
      </Box>

      {/* Table Body */}
      {invoice?.items?.map((item, index) => (
          <Box
          key={item.id}
            sx={{
              display: 'grid',
            gridTemplateColumns: { 
              xs: 'repeat(1, 1fr)', 
              md: '60px 2fr 80px 120px 120px' 
            },
              gap: 2,
              py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': {
              borderBottom: 'none',
            },
            }}
          >
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            {index + 1}
          </Typography>

            <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                {item.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {item.description}
              </Typography>
            </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.primary' }}>
              {item.quantity}
            </Typography>

          <Typography variant="body2" sx={{ textAlign: 'right', color: 'text.primary' }}>
              {fCurrencyPHPSymbol(item.price, '₱', 2, '.', ',')}
            </Typography>

          <Typography variant="body2" sx={{ textAlign: 'right', color: 'text.primary', fontWeight: 600 }}>
              {fCurrencyPHPSymbol(item.total, '₱', 2, '.', ',')}
            </Typography>
          </Box>
      )) || (
        // Default empty state with prototype data structure
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { 
                xs: 'repeat(1, 1fr)', 
                md: '60px 2fr 80px 120px 120px' 
              },
              gap: 2,
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.primary' }}>1</Typography>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                Item 1
            </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Item description
            </Typography>
            </Box>
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.primary' }}>1</Typography>
            <Typography variant="body2" sx={{ textAlign: 'right', color: 'text.primary' }}>$100.00</Typography>
            <Typography variant="body2" sx={{ textAlign: 'right', color: 'text.primary', fontWeight: 600 }}>$100.00</Typography>
        </Box>
        </>
      )}

      {/* Financial Summary */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ minWidth: 300 }}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Subtotal
            </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {fCurrencyPHPSymbol(invoice?.subtotal || 2373.51, '₱', 2, '.', ',')}
              </Typography>
          </Stack>

            <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Shipping
            </Typography>
              <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                -{fCurrencyPHPSymbol(invoice?.shipping || 52.17, '₱', 2, '.', ',')}
            </Typography>
          </Stack>

            <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Discount
            </Typography>
              <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                -{fCurrencyPHPSymbol(invoice?.discount || 85.21, '₱', 2, '.', ',')}
            </Typography>
          </Stack>

            <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Taxes
            </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {fCurrencyPHPSymbol(invoice?.taxes || 68.71, '₱', 2, '.', ',')}
              </Typography>
          </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {fCurrencyPHPSymbol(invoice?.totalAmount || 2304.84, '₱', 2, '.', ',')}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  const renderNotes = (
    <Box sx={{ p: 3 }}>
    <Stack
      spacing={3}
      direction={{ xs: 'column', md: 'row' }}
    >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
          NOTES
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {invoice?.notes || 'We appreciate your business. Should you need us to add VAT or extra notes let us know!'}
        </Typography>
        </Box>

        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
          Have a question?
        </Typography>
        <Typography variant="body2" sx={{ color: 'primary.main' }}>
          {invoice?.supportEmail || 'support@abcapp.com'}
        </Typography>
        </Box>
      </Stack>
    </Box>
  );

  const renderEditModal = (
    <Dialog
      open={editModalOpen}
      onClose={handleEditModalClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Edit
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3 }}>
        {/* From and To Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>From:</Typography>
                <IconButton size="small">
                  <Iconify icon="solar:pen-bold" width={16} />
                </IconButton>
              </Stack>
              
              <TextField
                fullWidth
                label="Name"
                value={editFormData.invoiceFrom.name}
                onChange={(e) => handleNestedFormChange('invoiceFrom', 'name', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              
              <TextField
                fullWidth
                label="Address"
                value={editFormData.invoiceFrom.address}
                onChange={(e) => handleNestedFormChange('invoiceFrom', 'address', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              
              <TextField
                fullWidth
                label="Phone"
                value={editFormData.invoiceFrom.phone}
                onChange={(e) => handleNestedFormChange('invoiceFrom', 'phone', e.target.value)}
                size="small"
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>To:</Typography>
                <IconButton size="small">
                  <Iconify icon="solar:pen-bold" width={16} />
                </IconButton>
    </Stack>
              
              <TextField
                fullWidth
                label="Name"
                value={editFormData.invoiceTo.name}
                onChange={(e) => handleNestedFormChange('invoiceTo', 'name', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              
              <TextField
                fullWidth
                label="Address"
                value={editFormData.invoiceTo.address}
                onChange={(e) => handleNestedFormChange('invoiceTo', 'address', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              
              <TextField
                fullWidth
                label="Phone"
                value={editFormData.invoiceTo.phone}
                onChange={(e) => handleNestedFormChange('invoiceTo', 'phone', e.target.value)}
                size="small"
              />
            </Box>
          </Grid>
        </Grid>

        {/* Invoice Details */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Invoice number"
              value={editFormData.invoiceNumber}
              onChange={(e) => handleFormChange('invoiceNumber', e.target.value)}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={editFormData.status}
                label="Status"
                onChange={(e) => handleFormChange('status', e.target.value)}
              >
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Date create"
              type="date"
              value={editFormData.createDate}
              onChange={(e) => handleFormChange('createDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Due date"
              type="date"
              value={editFormData.dueDate}
              onChange={(e) => handleFormChange('dueDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
        </Grid>

        {/* Items Section */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Details:</Typography>
        
        {editFormData.items.map((item, index) => (
          <Box key={item.id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Title"
                  value={item.title}
                  onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Service</InputLabel>
                  <Select
                    value={item.service}
                    label="Service"
                    onChange={(e) => handleItemChange(index, 'service', e.target.value)}
                  >
                    <MenuItem value="CEO">CEO</MenuItem>
                    <MenuItem value="CTO">CTO</MenuItem>
                    <MenuItem value="Project Coordinator">Project Coordinator</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4} md={1.5}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={4} md={1.5}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                  size="small"
                  InputProps={{ startAdornment: '$' }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={1.5}>
                <TextField
                  fullWidth
                  label="Total"
                  value={item.total}
                  size="small"
                  InputProps={{ 
                    startAdornment: '$',
                    readOnly: true 
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={0.5}>
                <IconButton 
                  color="error" 
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setEditFormData(prev => ({
                      ...prev,
                      items: prev.items.filter((_, i) => i !== index)
                    }));
                  }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        ))}
        
        <Button
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => {
            setEditFormData(prev => ({
              ...prev,
              items: [...prev.items, {
                id: `item-${prev.items.length + 1}`,
                title: '',
                description: '',
                service: 'CEO',
                quantity: 1,
                price: 0,
                total: 0,
              }]
            }));
          }}
          sx={{ mb: 3 }}
        >
          Add Item
        </Button>

        {/* Financial Summary */}
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Shipping($)"
              type="number"
              value={editFormData.shipping}
              onChange={(e) => handleFormChange('shipping', parseFloat(e.target.value))}
              size="small"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Discount($)"
              type="number"
              value={editFormData.discount}
              onChange={(e) => handleFormChange('discount', parseFloat(e.target.value))}
              size="small"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Taxes(%)"
              type="number"
              value={editFormData.taxes}
              onChange={(e) => handleFormChange('taxes', parseFloat(e.target.value))}
              size="small"
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>

        {/* Notes and Support Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Notes & Support
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={editFormData.notes}
            onChange={(e) => handleFormChange('notes', e.target.value)}
            placeholder="We appreciate your business. Should you need us to add VAT or extra notes let us know!"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Support Email"
            type="email"
            value={editFormData.supportEmail}
            onChange={(e) => handleFormChange('supportEmail', e.target.value)}
            placeholder="support@abcapp.com"
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleEditModalClose}
          sx={{ mr: 1 }}
        >
          Save as draft
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSaveChanges}
          sx={{ bgcolor: 'grey.900', '&:hover': { bgcolor: 'grey.800' } }}
        >
          Update & send
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
      {renderTop}

        <Divider />

      {renderInfo}

        <Divider />

      {renderTable}

        <Divider />

        {renderNotes}
          </Card>

      {renderEditModal}

      {/* Print Preview Modal */}
      <Dialog
        fullScreen
        open={printPreviewOpen}
        onClose={handleClosePrintPreview}
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Print Preview - {invoice?.invoiceNumber || 'INV-1991'}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
                onClick={handlePrintFromPreview}
                sx={{
                  bgcolor: 'grey.900',
                  '&:hover': { bgcolor: 'grey.800' },
                }}
              >
                Print
              </Button>
              <Button
                variant="outlined"
                onClick={handleClosePrintPreview}
              >
                Close
              </Button>
            </Stack>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <NoSsr>
            <PDFViewer
              width="100%"
              height="100%"
              style={{ border: 'none', flex: 1 }}
            >
              {invoice && (
                <InvoicePDFTemplate 
                  invoice={{
                    ...invoice,
                    createDate: invoice?.createDate instanceof Date 
                      ? invoice.createDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : invoice?.createDate || '28 Aug 2023',
                    dueDate: invoice?.dueDate instanceof Date 
                      ? invoice.dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : invoice?.dueDate || '06 Sep 2023',
                  }} 
                  currentStatus={status} 
                />
              )}
            </PDFViewer>
          </NoSsr>
        </DialogContent>
      </Dialog>
    </>
  );
}

InvoiceDetails.propTypes = {
  invoice: PropTypes.object,
};
