'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { sumBy } from 'src/utils/helper';
import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { invoicesApi } from 'src/services/invoicesService';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { InvoiceAnalytic } from '../invoice-analytic';
import { InvoiceTableRow } from '../invoice-table-row';
import { InvoiceNewEditForm } from '../invoice-new-edit-form';
import { InvoiceDetails } from '../invoice-details';

const INVOICE_SERVICE_OPTIONS = [
  { id: 1, name: 'Development' },
  { id: 2, name: 'Design' },
  { id: 3, name: 'Consulting' },
  { id: 4, name: 'Marketing' },
  { id: 5, name: 'Support' },
];

const TABLE_HEAD = [
  { id: 'invoiceNumber', label: 'Customer' },
  { id: 'createDate', label: 'Create' },
  { id: 'dueDate', label: 'Due' },
  { id: 'price', label: 'Amount' },
  { id: 'sent', label: 'Sent', align: 'center' },
  { id: 'status', label: 'Status' },
  { id: '' },
];

// ----------------------------------------------------------------------

export function InvoiceListView() {
  const theme = useTheme();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'createDate' });
  const confirm = useBoolean();
  const confirmDelete = useBoolean();
  const [deleteId, setDeleteId] = useState(null);

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [printMenuAnchor, setPrintMenuAnchor] = useState(null);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filters = useSetState({
    name: '',
    service: [],
    status: 'all',
    startDate: null,
    endDate: null,
  });

  // Load invoices from database
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const invoices = await invoicesApi.getInvoices();
      
      // Transform database data to match component format
      const transformedInvoices = invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        createDate: invoice.invoice_date,
        dueDate: invoice.due_date,
        status: invoice.status,
        sent: invoice.sent || 0,
        invoiceFrom: {
          name: invoice.invoice_from_name,
          address: invoice.invoice_from_address,
          company: invoice.invoice_from_company,
          email: invoice.invoice_from_email,
          phone: invoice.invoice_from_phone,
        },
        invoiceTo: {
          name: invoice.invoice_to_name,
          address: invoice.invoice_to_address,
          company: invoice.invoice_to_company,
          email: invoice.invoice_to_email,
          phone: invoice.invoice_to_phone,
        },
        items: (invoice.invoice_items || []).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          service: item.service,
          quantity: item.quantity,
          price: parseFloat(item.unit_price || 0),
          total: parseFloat(item.total || 0),
        })),
        subtotal: parseFloat(invoice.subtotal || 0),
        shipping: parseFloat(invoice.shipping || 0),
        discount: parseFloat(invoice.discount || 0),
        taxes: parseFloat(invoice.taxes || 0),
        totalAmount: parseFloat(invoice.total_amount || 0),
        notes: invoice.notes,
        supportEmail: invoice.support_email,
      }));
      
      setTableData(transformedInvoices);
      setInitialLoad(false);
      
      if (transformedInvoices.length > 0) {
        toast.success(`${transformedInvoices.length} invoice(s) loaded successfully!`);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load invoices');
      setInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  const dateError = fIsAfter(filters.state.startDate, filters.state.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: { ...filters.state, searchQuery },
    dateError,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.name ||
    filters.state.service.length > 0 ||
    filters.state.status !== 'all' ||
    (!!filters.state.startDate && !!filters.state.endDate) ||
    !!searchQuery;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const getInvoiceLength = (status) => tableData.filter((item) => item.status === status).length;

  const getTotalAmount = (status) =>
    sumBy(
      tableData.filter((item) => item.status === status),
      (invoice) => invoice.totalAmount
    );

  const getPercentByStatus = (status) => (getInvoiceLength(status) / tableData.length) * 100;

  const TABS = [
    {
      value: 'all',
      label: 'All',
      color: 'default',
      count: tableData.length,
    },
    {
      value: 'paid',
      label: 'Paid',
      color: 'success',
      count: getInvoiceLength('paid'),
    },
    {
      value: 'pending',
      label: 'Pending',
      color: 'warning',
      count: getInvoiceLength('pending'),
    },
    {
      value: 'overdue',
      label: 'Overdue',
      color: 'error',
      count: getInvoiceLength('overdue'),
    },
    {
      value: 'draft',
      label: 'Draft',
      color: 'default',
      count: getInvoiceLength('draft'),
    },
  ];

  const handleDeleteRow = useCallback(
    (id) => {
      setDeleteId(id);
      confirmDelete.onTrue();
    },
    [confirmDelete]
  );

  const confirmDeleteRow = async () => {
    try {
      setLoading(true);
      await invoicesApi.deleteInvoice(deleteId);
      
      const deleteRow = tableData.filter((row) => row.id !== deleteId);
      setTableData(deleteRow);
      table.onUpdatePageDeleteRow(dataInPage.length);
      
      toast.success('Invoice deleted successfully!');
      confirmDelete.onFalse();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRows = useCallback(async () => {
    try {
      setLoading(true);
      await invoicesApi.deleteInvoices(table.selected);
      
      const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
      setTableData(deleteRows);
      table.onUpdatePageDeleteRows({
        totalRowsInPage: dataInPage.length,
        totalRowsFiltered: dataFiltered.length,
      });
      
      toast.success(`${table.selected.length} invoice(s) deleted successfully!`);
      confirm.onFalse();
    } catch (error) {
      console.error('Error deleting invoices:', error);
      toast.error('Failed to delete invoices');
    } finally {
      setLoading(false);
    }
  }, [dataFiltered.length, dataInPage.length, table, tableData, confirm]);

  const handleEditRow = useCallback(
    (id) => {
      const invoice = tableData.find(item => item.id === id);
      setSelectedInvoice(invoice);
      setEditModalOpen(true);
    },
    [tableData]
  );

  const handleViewRow = useCallback(
    (id) => {
      const invoice = tableData.find(item => item.id === id);
      setSelectedInvoice(invoice);
      setViewModalOpen(true);
    },
    [tableData]
  );

  const handleCreateInvoice = useCallback(() => {
    setSelectedInvoice(null);
    setCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    setSelectedInvoice(null);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setViewModalOpen(false);
    setSelectedInvoice(null);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false);
    setSelectedInvoice(null);
  }, []);

  const handleFilterStatus = useCallback(
    (status) => {
      table.onResetPage();
      filters.setState({ status });
    },
    [filters, table]
  );

  // Search handler
  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
    table.onResetPage();
  }, [table]);

  // Print menu handlers
  const handlePrintMenuOpen = useCallback((event) => {
    setPrintMenuAnchor(event.currentTarget);
  }, []);

  const handlePrintMenuClose = useCallback(() => {
    setPrintMenuAnchor(null);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
    handlePrintMenuClose();
  }, [handlePrintMenuClose]);

  const handleExport = useCallback(() => {
    console.log('Export data');
    handlePrintMenuClose();
  }, [handlePrintMenuClose]);

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Invoice', href: paths.dashboard.invoice.root },
            { name: 'List' },
          ]}
          action={
            <Button
              onClick={handleCreateInvoice}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: 'grey.900',
                color: 'common.white',
                '&:hover': {
                  bgcolor: 'grey.800',
                },
                px: 3,
                py: 1.5,
                borderRadius: 1.5,
                fontWeight: 600,
              }}
            >
              New invoice
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Analytics Cards */}
        <Card sx={{ mb: { xs: 3, md: 5 } }}>
          <Scrollbar sx={{ minHeight: 108 }}>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              <InvoiceAnalytic
                title="Total"
                total={tableData.length}
                percent={100}
                price={sumBy(tableData, (invoice) => invoice.totalAmount)}
                icon="solar:bill-list-bold-duotone"
                color="info"
              />

              <InvoiceAnalytic
                title="Paid"
                total={getInvoiceLength('paid')}
                percent={getPercentByStatus('paid')}
                price={getTotalAmount('paid')}
                icon="solar:file-check-bold-duotone"
                color="success"
              />

              <InvoiceAnalytic
                title="Pending"
                total={getInvoiceLength('pending')}
                percent={getPercentByStatus('pending')}
                price={getTotalAmount('pending')}
                icon="solar:sort-by-time-bold-duotone"
                color="warning"
              />

              <InvoiceAnalytic
                title="Overdue"
                total={getInvoiceLength('overdue')}
                percent={getPercentByStatus('overdue')}
                price={getTotalAmount('overdue')}
                icon="solar:bell-bing-bold-duotone"
                color="error"
              />

              <InvoiceAnalytic
                title="Draft"
                total={getInvoiceLength('draft')}
                percent={getPercentByStatus('draft')}
                price={getTotalAmount('draft')}
                icon="solar:file-corrupted-bold-duotone"
                color="grey"
              />
            </Stack>
          </Scrollbar>
        </Card>

        {/* Status Filter Tabs */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          {TABS.map((tab) => {
            const isActive = filters.state.status === tab.value;
            
            return (
              <Button
                key={tab.value}
                variant={isActive ? 'contained' : 'outlined'}
                onClick={() => handleFilterStatus(tab.value)}
            sx={{
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  borderColor: 'grey.300',
                  color: isActive ? 'white' : 'text.primary',
                  borderRadius: '20px',
                  textTransform: 'none',
                  px: 2,
                  '&:hover': { bgcolor: isActive ? 'primary.dark' : 'grey.50' }
                }}
              >
                {tab.label} <Chip 
                  label={tab.count} 
                  size="small" 
                  sx={{ 
                    ml: 1, 
                    bgcolor: isActive ? 'rgba(255,255,255,0.3)' : 'grey.100',
                    color: isActive ? 'white' : 'text.secondary'
                  }} 
                />
              </Button>
            );
          })}
        </Stack>

        {/* Search and Print Toolbar */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Start date
            </Typography>
            <IconButton size="small" sx={{ bgcolor: 'grey.100' }}>
              <Iconify icon="eva:calendar-fill" width={16} />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              End date
            </Typography>
            <IconButton size="small" sx={{ bgcolor: 'grey.100' }}>
              <Iconify icon="eva:calendar-fill" width={16} />
            </IconButton>
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <TextField
            placeholder="Search customer or invoice number..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />

          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:printer-fill" />}
            endIcon={<Iconify icon="eva:chevron-down-fill" />}
            onClick={handlePrintMenuOpen}
            sx={{
              borderColor: 'grey.300',
              color: 'text.primary',
              textTransform: 'none',
            }}
          >
            Print
          </Button>

          <Menu
            anchorEl={printMenuAnchor}
            open={Boolean(printMenuAnchor)}
            onClose={handlePrintMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <MenuItem onClick={handlePrint}>
              <Iconify icon="eva:printer-fill" sx={{ mr: 2 }} />
              Print
            </MenuItem>
            <MenuItem onClick={handleExport}>
              <Iconify icon="eva:download-fill" sx={{ mr: 2 }} />
              Import
            </MenuItem>
            <MenuItem onClick={handleExport}>
              <Iconify icon="eva:upload-fill" sx={{ mr: 2 }} />
              Export
            </MenuItem>
          </Menu>

          <IconButton>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>

        <Card>

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) => {
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                );
              }}
              action={
                <Stack direction="row">
                  <Tooltip title="Sent">
                    <IconButton color="primary">
                      <Iconify icon="iconamoon:send-fill" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton color="primary">
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="solar:printer-minimalistic-bold" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar sx={{ minHeight: 444 }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <InvoiceTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      {/* Delete Multiple Invoices Confirmation */}
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Invoices"
        content={
          <>
            Are you sure you want to delete <strong>{table.selected.length}</strong> invoice(s)? This action cannot be undone.
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteRows}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        }
      />

      {/* Delete Single Invoice Confirmation */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete Invoice"
        content="Are you sure you want to delete this invoice? This action cannot be undone."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteRow}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        }
      />

      {/* Create Invoice Modal */}
      <Dialog
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Create New Invoice</Typography>
            <IconButton onClick={handleCloseCreateModal}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <InvoiceNewEditForm 
            currentInvoice={null}
            onClose={handleCloseCreateModal}
            onSuccess={() => {
              handleCloseCreateModal();
              loadInvoices(); // Refresh the list
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Invoice Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={handleCloseViewModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Invoice Details</Typography>
            <IconButton onClick={handleCloseViewModal}>
              <Iconify icon="eva:close-fill" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedInvoice && (
            <InvoiceDetails 
              invoice={selectedInvoice}
              open={viewModalOpen}
              onClose={handleCloseViewModal}
              onEditSuccess={() => {
                handleCloseViewModal();
                loadInvoices(); // Refresh the list
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Edit
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedInvoice && (
            <InvoiceNewEditForm 
              currentInvoice={selectedInvoice}
              onClose={handleCloseEditModal}
              onSuccess={() => {
                handleCloseEditModal();
                loadInvoices(); // Refresh the list
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, status, service, startDate, endDate, searchQuery } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        invoice.invoiceTo.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (searchQuery) {
    inputData = inputData.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceTo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoiceTo.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === status);
  }

  if (service.length) {
    inputData = inputData.filter((invoice) =>
      invoice.items.some((filterItem) => service.includes(filterItem.service))
    );
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((invoice) => fIsBetween(invoice.createDate, startDate, endDate));
    }
  }

  return inputData;
}
