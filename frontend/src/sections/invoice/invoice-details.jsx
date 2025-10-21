import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';

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
import { useTheme } from '@mui/material/styles';

import { fCurrencyPHPSymbol } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { invoicesApi } from 'src/services/invoicesService';

// PDF generation imports
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import NoSsr from '@mui/material/NoSsr';
import { InvoicePDFTemplate } from './invoice-pdf-template';

// ----------------------------------------------------------------------

export function InvoiceDetails({ invoice, open, onClose, onEditSuccess }) {
  const theme = useTheme();

  const [status, setStatus] = useState(invoice?.status || 'paid');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    invoiceNumber: invoice?.invoiceNumber || '',
    status: invoice?.status || 'draft',
    createDate: invoice?.createDate ? new Date(invoice.createDate).toISOString().split('T')[0] : '',
    dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
    invoiceFrom: {
      name: invoice?.invoiceFrom?.name || '',
      address: invoice?.invoiceFrom?.address || '',
      phone: invoice?.invoiceFrom?.phone || '',
    },
    invoiceTo: {
      name: invoice?.invoiceTo?.name || '',
      address: invoice?.invoiceTo?.address || '',
      phone: invoice?.invoiceTo?.phone || '',
    },
    items: invoice?.items || [],
    shipping: invoice?.shipping || 0,
    discount: invoice?.discount || 0,
    taxes: invoice?.taxes || 0,
    subtotal: invoice?.subtotal || 0,
    totalAmount: invoice?.totalAmount || 0,
    notes: invoice?.notes || '',
    supportEmail: invoice?.supportEmail || '',
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

  const handleSaveAsDraft = async () => {
    try {
      // Calculate totals
      const subtotal = editFormData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const totalAmount = subtotal + editFormData.shipping - editFormData.discount + editFormData.taxes;

      // Prepare update data with draft status
      const updateData = {
        invoice_number: editFormData.invoiceNumber,
        status: 'draft',
        invoice_date: editFormData.createDate ? new Date(editFormData.createDate).toISOString() : null,
        due_date: editFormData.dueDate ? new Date(editFormData.dueDate).toISOString() : null,
        invoice_from_name: editFormData.invoiceFrom.name,
        invoice_from_address: editFormData.invoiceFrom.address,
        invoice_from_phone: editFormData.invoiceFrom.phone,
        invoice_to_name: editFormData.invoiceTo.name,
        invoice_to_address: editFormData.invoiceTo.address,
        invoice_to_phone: editFormData.invoiceTo.phone,
        items: editFormData.items,
        subtotal,
        shipping: editFormData.shipping,
        discount: editFormData.discount,
        taxes: editFormData.taxes,
        total_amount: totalAmount,
        notes: editFormData.notes || '',
        support_email: editFormData.supportEmail || '',
      };

      console.log('Updating invoice with ID:', invoice.id);
      console.log('Update data:', updateData);

      // Update the invoice
      await invoicesApi.updateInvoice(invoice.id, updateData);
      
      // Close modal and notify parent
      setEditModalOpen(false);
      if (onEditSuccess) {
        onEditSuccess();
      }
    } catch (error) {
      console.error('Error saving invoice as draft:', error);
      // You could add a toast notification here for error handling
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Calculate totals
      const subtotal = editFormData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const totalAmount = subtotal + editFormData.shipping - editFormData.discount + editFormData.taxes;

      // Prepare update data
      const updateData = {
        invoice_number: editFormData.invoiceNumber,
        status: editFormData.status,
        invoice_date: editFormData.createDate ? new Date(editFormData.createDate).toISOString() : null,
        due_date: editFormData.dueDate ? new Date(editFormData.dueDate).toISOString() : null,
        invoice_from_name: editFormData.invoiceFrom.name,
        invoice_from_address: editFormData.invoiceFrom.address,
        invoice_from_phone: editFormData.invoiceFrom.phone,
        invoice_to_name: editFormData.invoiceTo.name,
        invoice_to_address: editFormData.invoiceTo.address,
        invoice_to_phone: editFormData.invoiceTo.phone,
        items: editFormData.items,
        subtotal,
        shipping: editFormData.shipping,
        discount: editFormData.discount,
        taxes: editFormData.taxes,
        total_amount: totalAmount,
        notes: editFormData.notes || '',
        support_email: editFormData.supportEmail || '',
      };

      // Update the invoice
      await invoicesApi.updateInvoice(invoice.id, updateData);
      
      // Close modal and notify parent
      setEditModalOpen(false);
      if (onEditSuccess) {
        onEditSuccess();
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      // You could add a toast notification here for error handling
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Pre-process invoice data to ensure all Date objects are converted to strings
      const safeInvoiceData = {
        ...invoice,
        createDate: invoice?.createDate instanceof Date 
          ? invoice.createDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : invoice?.createDate || '',
        dueDate: invoice?.dueDate instanceof Date 
          ? invoice.dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : invoice?.dueDate || '',
        // Ensure all other fields are safe
        invoiceNumber: String(invoice?.invoiceNumber || ''),
        status: String(invoice?.status || 'draft'),
        subtotal: invoice?.subtotal ? String(invoice.subtotal) : '0',
        taxes: invoice?.taxes ? String(invoice.taxes) : '0',
        shipping: invoice?.shipping ? String(invoice.shipping) : '0',
        discount: invoice?.discount ? String(invoice.discount) : '0',
        totalAmount: invoice?.totalAmount ? String(invoice.totalAmount) : '0',
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
            {invoice?.invoiceNumber || ''}
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
            {invoice?.invoiceFrom?.name || ''}
        </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            {invoice?.invoiceFrom?.address || ''}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Phone: {invoice?.invoiceFrom?.phone || ''}
        </Typography>
        </Box>

        {/* Invoice to */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2, fontWeight: 600 }}>
          Invoice to
        </Typography>

          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
            {invoice?.invoiceTo?.name || ''}
        </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            {invoice?.invoiceTo?.address || ''}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Phone: {invoice?.invoiceTo?.phone || ''}
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
            {fDate(invoice?.createDate) || ''}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
            Due date
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            {fDate(invoice?.dueDate) || ''}
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
      {invoice?.items?.length > 0 ? (
        invoice.items.map((item, index) => (
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
        ))
      ) : (
        // Empty state when no items
        <Box
          sx={{
            py: 4,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">
            No items to display
          </Typography>
        </Box>
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
                {fCurrencyPHPSymbol(invoice?.subtotal || 0, '₱', 2, '.', ',')}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Shipping
              </Typography>
              <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                -{fCurrencyPHPSymbol(invoice?.shipping || 0, '₱', 2, '.', ',')}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Discount
              </Typography>
              <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                -{fCurrencyPHPSymbol(invoice?.discount || 0, '₱', 2, '.', ',')}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Taxes
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {fCurrencyPHPSymbol(invoice?.taxes || 0, '₱', 2, '.', ',')}
              </Typography>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {fCurrencyPHPSymbol(invoice?.totalAmount || 0, '₱', 2, '.', ',')}
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
          {invoice?.notes || ''}
        </Typography>
        </Box>

        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
          Have a question?
        </Typography>
        <Typography variant="body2" sx={{ color: 'primary.main' }}>
          {invoice?.supportEmail || ''}
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
      <DialogTitle sx={{ fontWeight: 700 }}>
        Edit
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
              
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Name"
                  value={editFormData.invoiceFrom.name}
                  onChange={(e) => handleNestedFormChange('invoiceFrom', 'name', e.target.value)}
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Address"
                  value={editFormData.invoiceFrom.address}
                  onChange={(e) => handleNestedFormChange('invoiceFrom', 'address', e.target.value)}
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Phone"
                  value={editFormData.invoiceFrom.phone}
                  onChange={(e) => handleNestedFormChange('invoiceFrom', 'phone', e.target.value)}
                  size="small"
                />
              </Stack>
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
              
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Name"
                  value={editFormData.invoiceTo.name}
                  onChange={(e) => handleNestedFormChange('invoiceTo', 'name', e.target.value)}
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Address"
                  value={editFormData.invoiceTo.address}
                  onChange={(e) => handleNestedFormChange('invoiceTo', 'address', e.target.value)}
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Phone"
                  value={editFormData.invoiceTo.phone}
                  onChange={(e) => handleNestedFormChange('invoiceTo', 'phone', e.target.value)}
                  size="small"
                />
              </Stack>
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
                  value={item.quantity || ''}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 0)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={4} md={1.5}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={item.price || ''}
                  onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
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
              value={editFormData.shipping || ''}
              onChange={(e) => handleFormChange('shipping', parseFloat(e.target.value) || 0)}
              size="small"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Discount($)"
              type="number"
              value={editFormData.discount || ''}
              onChange={(e) => handleFormChange('discount', parseFloat(e.target.value) || 0)}
              size="small"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Taxes(%)"
              type="number"
              value={editFormData.taxes || ''}
              onChange={(e) => handleFormChange('taxes', parseFloat(e.target.value) || 0)}
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
          onClick={handleSaveAsDraft}
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
              Print Preview - {invoice?.invoiceNumber || ''}
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
                      : invoice?.createDate || '',
                    dueDate: invoice?.dueDate instanceof Date 
                      ? invoice.dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : invoice?.dueDate || '',
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
  invoice: PropTypes.shape({
    id: PropTypes.string,
    invoiceNumber: PropTypes.string,
    createDate: PropTypes.string,
    dueDate: PropTypes.string,
    status: PropTypes.string,
    invoiceFrom: PropTypes.shape({
      name: PropTypes.string,
      address: PropTypes.string,
      phone: PropTypes.string,
    }),
    invoiceTo: PropTypes.shape({
      name: PropTypes.string,
      address: PropTypes.string,
      phone: PropTypes.string,
    }),
    items: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      quantity: PropTypes.number,
      price: PropTypes.number,
      total: PropTypes.number,
    })),
    subtotal: PropTypes.number,
    shipping: PropTypes.number,
    discount: PropTypes.number,
    taxes: PropTypes.number,
    totalAmount: PropTypes.number,
  }),
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onEditSuccess: PropTypes.func,
};
