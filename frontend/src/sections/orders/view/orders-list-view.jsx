'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import { Collapse } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import {
  GridActionsCellItem,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { ordersApi } from 'src/services/ordersService';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { OrderDetailsView } from './order-details-view';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
  { value: 'refunded', label: 'Refunded', color: 'info' },
];

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

const SYSTEM_LOGO = '/assets/logo/system-logo.png'; // Adjust path as needed

// ----------------------------------------------------------------------

export function OrdersListView() {
  const confirmRows = useBoolean();
  const confirmDelete = useBoolean();
  const [deleteId, setDeleteId] = useState(null);
  const router = useRouter();

  const filters = useSetState({ status: [] });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);
  const [dense, setDense] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [printMenuAnchor, setPrintMenuAnchor] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeStatus, setActiveStatus] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedOrderForAction, setSelectedOrderForAction] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [orderForInvoice, setOrderForInvoice] = useState(null);
  const [bulkStatusMenuAnchor, setBulkStatusMenuAnchor] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewOrderId, setViewOrderId] = useState(null);

  // Load orders from database
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orders = await ordersApi.getOrders();
      
      // Transform database data to match component format
      const transformedOrders = orders.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        date: order.order_date,
        time: fTime(order.order_date),
        customer: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone || '',
          avatarUrl: order.customer_avatar_url || '',
        },
        total: parseFloat(order.total || 0),
        status: order.status,
        paymentStatus: order.payment_status,
        items: order.order_items || [],
        shippingAddress: order.shipping_address_line1 ? {
          line1: order.shipping_address_line1,
          line2: order.shipping_address_line2,
          city: order.shipping_city,
          state: order.shipping_state,
          postalCode: order.shipping_postal_code,
          country: order.shipping_country,
        } : null,
        paymentMethod: order.payment_method,
        trackingNumber: order.tracking_number,
      }));
      
      setTableData(transformedOrders);
      setInitialLoad(false);
      
      if (transformedOrders.length > 0) {
        toast.success(`${transformedOrders.length} order(s) loaded successfully!`);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
      setInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search and status
  const dataFiltered = useMemo(() => {
    let filtered = tableData;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (activeStatus !== 'all') {
      filtered = filtered.filter((order) => order.status === activeStatus);
    }

    return filtered;
  }, [tableData, searchQuery, activeStatus]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = currentPage * rowsPerPage;
    return dataFiltered.slice(startIndex, startIndex + rowsPerPage);
  }, [dataFiltered, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(dataFiltered.length / rowsPerPage);

  const handleDeleteRow = useCallback(
    (id) => {
      setDeleteId(id);
      confirmDelete.onTrue();
    },
    []
  );

  const confirmDeleteRow = async () => {
    try {
      setLoading(true);
      await ordersApi.deleteOrder(deleteId);
      
      const deleteRow = tableData.filter((row) => row.id !== deleteId);
      setTableData(deleteRow);
      
      toast.success('Order deleted successfully!');
      confirmDelete.onFalse();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRows = useCallback(async () => {
    try {
      setLoading(true);
      await ordersApi.deleteOrders(selectedRowIds);
      
      const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));
      setTableData(deleteRows);
      
      toast.success(`${selectedRowIds.length} order(s) deleted successfully!`);
      confirmRows.onFalse();
      setSelectedRowIds([]);
    } catch (error) {
      console.error('Error deleting orders:', error);
      toast.error('Failed to delete orders');
    } finally {
      setLoading(false);
    }
  }, [selectedRowIds, tableData, confirmRows]);

  const handleViewRow = useCallback(
    (id) => {
      setViewOrderId(id.toString().replace('#', ''));
      setViewDialogOpen(true);
    },
    []
  );

  const handleEditRow = useCallback(
    (id) => {
      // Open the same modal for now; edit flow can be wired inside the details view
      setViewOrderId(id.toString().replace('#', ''));
      setViewDialogOpen(true);
    },
    []
  );

  // Status filter handlers
  const handleStatusFilter = useCallback((status) => {
    setActiveStatus(status);
    setCurrentPage(0); // Reset to first page
  }, []);

  // Search handler
  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(0); // Reset to first page
  }, []);

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
    try {
      const header = ['order_number','date','customer_name','customer_email','total','status','payment_status','payment_method'];
      const lines = [header.join(',')];
      for (const o of dataFiltered) {
        const row = [
          (o.id||'').toString().replace(/,/g,' '),
          (o.date||'').toString().slice(0,10),
          (o.customer?.name||'').replace(/,/g,' '),
          (o.customer?.email||'').replace(/,/g,' '),
          Number(o.total || o.price || 0).toFixed(2),
          (o.status||'').replace(/,/g,' '),
          (o.paymentStatus||'').replace(/,/g,' '),
          (o.paymentMethod||'').replace(/,/g,' '),
        ];
        lines.push(row.join(','));
      }
      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders_export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) {}
    handlePrintMenuClose();
  }, [dataFiltered, handlePrintMenuClose]);

  // Pagination handlers
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  }, []);

  // Dense toggle handler
  const handleDenseToggle = useCallback(() => {
    setDense(prev => !prev);
  }, []);

  // Checkbox handlers
  const handleSelectAllClick = useCallback((event) => {
    if (event.target.checked) {
      const newSelected = paginatedData.map((order) => order.id);
      setSelectedRowIds(newSelected);
    } else {
      setSelectedRowIds([]);
    }
  }, [paginatedData]);

  const handleRowSelect = useCallback((id) => {
    const selectedIndex = selectedRowIds.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedRowIds, id];
    } else {
      newSelected = selectedRowIds.filter((selectedId) => selectedId !== id);
    }

    setSelectedRowIds(newSelected);
  }, [selectedRowIds]);

  const isSelected = useCallback((id) => selectedRowIds.includes(id), [selectedRowIds]);

  // Expand/collapse order details
  const handleToggleOrderExpansion = useCallback((orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }, []);

  const isOrderExpanded = useCallback((orderId) => expandedOrders.has(orderId), [expandedOrders]);

  // Action menu handlers
  const handleActionMenuOpen = useCallback((event, order) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedOrderForAction(order);
  }, []);

  const handleActionMenuClose = useCallback(() => {
    setActionMenuAnchor(null);
    setSelectedOrderForAction(null);
  }, []);

  const handleViewOrder = useCallback(() => {
    if (selectedOrderForAction) {
      setViewOrderId(selectedOrderForAction.id.replace('#', ''));
      setViewDialogOpen(true);
    }
    handleActionMenuClose();
  }, [selectedOrderForAction, handleActionMenuClose]);

  const handleDeleteOrder = useCallback(() => {
    if (selectedOrderForAction) {
      handleDeleteRow(selectedOrderForAction.id);
    }
    handleActionMenuClose();
  }, [selectedOrderForAction, handleDeleteRow, handleActionMenuClose]);

  const handlePrintLabel = useCallback(() => {
    setOrderForInvoice(selectedOrderForAction);
    setInvoiceModalOpen(true);
    handleActionMenuClose();
  }, [selectedOrderForAction, handleActionMenuClose]);

  const handleCloseInvoiceModal = useCallback(() => {
    setInvoiceModalOpen(false);
    setOrderForInvoice(null);
  }, []);

  const handlePrintInvoice = useCallback(() => {
    window.print();
  }, []);

  // Bulk status update handlers
  const handleBulkStatusChange = useCallback(async (newStatus) => {
    try {
      setLoading(true);
      await ordersApi.updateOrdersStatus(selectedRowIds, newStatus);
      
      setTableData(prevData => 
        prevData.map(order => 
          selectedRowIds.includes(order.id) 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      toast.success(`${selectedRowIds.length} order(s) status updated to ${newStatus}!`);
      setSelectedRowIds([]);
      setBulkStatusMenuAnchor(null);
    } catch (error) {
      console.error('Error updating orders status:', error);
      toast.error('Failed to update orders status');
    } finally {
      setLoading(false);
    }
  }, [selectedRowIds]);


  // Bulk status menu handlers
  const handleBulkStatusMenuOpen = useCallback((event) => {
    setBulkStatusMenuAnchor(event.currentTarget);
  }, []);

  const handleBulkStatusMenuClose = useCallback(() => {
    setBulkStatusMenuAnchor(null);
  }, []);


  const columns = [
    {
      field: 'id',
      headerName: 'Order',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {params.row.id}
        </Typography>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      minWidth: 280,
      hideable: false,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1 }}>
          <Avatar
            alt={params.row.customer.name}
            src={params.row.customer.avatar}
            sx={{ width: 40, height: 40 }}
          />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {params.row.customer.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {params.row.customer.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 140,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {fDate(params.row.date, 'dd MMM yyyy')}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.row.time}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'items',
      headerName: 'Items',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.items}
        </Typography>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {fCurrency(params.row.price)}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      type: 'singleSelect',
      valueOptions: STATUS_OPTIONS,
      renderCell: (params) => {
        const status = STATUS_OPTIONS.find((option) => option.value === params.row.status);
        return (
          <Label variant="soft" color={status?.color || 'default'}>
            {status?.label || params.row.status}
          </Label>
        );
      },
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={(params.row.paymentStatus||'pending').toString().toUpperCase()}
          size="small"
          color={params.row.paymentStatus === 'completed' ? 'success' : (params.row.paymentStatus === 'pending' ? 'warning' : 'default')}
          variant="soft"
        />
      ),
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="View"
          onClick={() => handleViewRow(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Edit"
          onClick={() => handleEditRow(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Delete"
          onClick={() => handleDeleteRow(params.row.id)}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Order' },
            { name: 'List' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Status Filter Tabs */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Button
            variant={activeStatus === 'all' ? 'contained' : 'outlined'}
            onClick={() => handleStatusFilter('all')}
            sx={{
              bgcolor: activeStatus === 'all' ? 'primary.main' : 'transparent',
              borderColor: 'grey.300',
              color: activeStatus === 'all' ? 'white' : 'text.primary',
              borderRadius: '20px',
              textTransform: 'none',
              px: 2,
              '&:hover': { bgcolor: activeStatus === 'all' ? 'primary.dark' : 'grey.50' }
            }}
          >
            All <Chip 
              label={dataFiltered.length} 
              size="small" 
              sx={{ 
                ml: 1, 
                bgcolor: activeStatus === 'all' ? 'rgba(255,255,255,0.3)' : 'grey.100',
                color: activeStatus === 'all' ? 'white' : 'text.secondary'
              }} 
            />
          </Button>
          
          {STATUS_OPTIONS.map((status) => {
            const count = tableData.filter(order => order.status === status.value).length;
            const isActive = activeStatus === status.value;
            
            return (
              <Button
                key={status.value}
                variant={isActive ? 'contained' : 'outlined'}
                onClick={() => handleStatusFilter(status.value)}
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
                {status.label} <Chip 
                  label={count} 
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


        {/* Filters and Search Toolbar */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          {selectedRowIds.length === 0 ? (
            <>
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
                placeholder="Search customer or order number..."
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
            </>
          ) : (
            <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {selectedRowIds.length} order{selectedRowIds.length > 1 ? 's' : ''} selected
              </Typography>
            </Stack>
          )}

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

          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:edit-fill" />}
            endIcon={<Iconify icon="eva:chevron-down-fill" />}
            onClick={handleBulkStatusMenuOpen}
            sx={{
              borderColor: 'grey.300',
              color: 'text.primary',
              textTransform: 'none',
            }}
          >
            Change Status
          </Button>

          <Menu
            anchorEl={bulkStatusMenuAnchor}
            open={Boolean(bulkStatusMenuAnchor)}
            onClose={handleBulkStatusMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            {STATUS_OPTIONS.map((status) => (
              <MenuItem 
                key={status.value}
                onClick={() => handleBulkStatusChange(status.value)}
                sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                <Label variant="soft" color={status.color} sx={{ mr: 2, minWidth: 80 }}>
                  {status.label}
                </Label>
                <Typography variant="body2">
                  Mark as {status.label}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        </Stack>

        {/* Table */}
        <Card>
          {/* Table Header */}
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ width: 40 }}>
                <input 
                  type="checkbox" 
                  onChange={handleSelectAllClick}
                  checked={paginatedData.length > 0 && selectedRowIds.length === paginatedData.length}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = selectedRowIds.length > 0 && selectedRowIds.length < paginatedData.length;
                    }
                  }}
                />
              </Box>
              <Box sx={{ width: 100 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Order
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Customer
                </Typography>
              </Box>
              <Box sx={{ width: 120 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Date
                </Typography>
              </Box>
              <Box sx={{ width: 80, textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Items
                </Typography>
              </Box>
              <Box sx={{ width: 100, textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Price
                </Typography>
              </Box>
              <Box sx={{ width: 100 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Status
                </Typography>
              </Box>
              <Box sx={{ width: 40 }} />
            </Stack>
          </Box>

          {/* Table Rows */}
          {paginatedData.map((order, index) => (
            <Box key={order.id}>
               {/* Main Order Row */}
               <Box
                 sx={{
                   p: dense ? 1 : 2,
                   borderBottom: index < paginatedData.length - 1 ? 1 : 0,
                   borderColor: 'divider',
                   '&:hover': { bgcolor: 'grey.50' },
                   borderRadius: isOrderExpanded(order.id) ? '12px 12px 0 0' : 0,
                   borderTop: isOrderExpanded(order.id) ? '1px solid' : 'none',
                   borderLeft: isOrderExpanded(order.id) ? '1px solid' : 'none',
                   borderRight: isOrderExpanded(order.id) ? '1px solid' : 'none',
                   borderColor: isOrderExpanded(order.id) ? 'divider' : 'transparent',
                 }}
               >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ width: 40 }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected(order.id)}
                      onChange={() => handleRowSelect(order.id)}
                    />
                  </Box>
                  <Box sx={{ width: 100 }}>
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      {order.id}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          width: dense ? 32 : 40,
                          height: dense ? 32 : 40,
                          bgcolor: 'grey.400',
                          fontSize: dense ? '0.875rem' : '1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {order.customer.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant={dense ? 'caption' : 'body2'} 
                          sx={{ fontWeight: 'bold' }}
                        >
                          {order.customer.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: dense ? '0.65rem' : '0.75rem'
                          }}
                        >
                          {order.customer.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  <Box sx={{ width: 120 }}>
                    <Typography variant="body2">
                      {fDate(order.date, 'dd MMM yyyy')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {order.time}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 80, textAlign: 'center' }}>
                    <Typography variant="body2">
                      {order.items}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 100, textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {fCurrency(order.price)}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 100 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={order.status === 'pending' ? 'Pending' :
                              order.status === 'completed' ? 'Completed' :
                              order.status === 'refunded' ? 'Refunded' : order.status}
                        size="small"
                        color={order.status === 'pending' ? 'warning' :
                               order.status === 'completed' ? 'success' :
                               order.status === 'refunded' ? 'info' : 'default'}
                        variant="soft"
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleToggleOrderExpansion(order.id)}
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        <Iconify 
                          icon={isOrderExpanded(order.id) ? "eva:chevron-up-fill" : "eva:chevron-down-fill"} 
                          width={16} 
                        />
                      </IconButton>
                    </Stack>
                  </Box>
                                     <Box sx={{ width: 40 }}>
                     <IconButton 
                       size="small"
                       onClick={(event) => handleActionMenuOpen(event, order)}
                       sx={{ 
                         color: 'text.secondary',
                         '&:hover': { color: 'primary.main' }
                       }}
                     >
                       <Iconify icon="eva:more-vertical-fill" />
                     </IconButton>
                   </Box>
                </Stack>
              </Box>

                             {/* Expanded Order Items */}
               <Collapse in={isOrderExpanded(order.id)} timeout={300} easing="ease-in-out">
                 {order.orderItems && (
                   <Box 
                     sx={{ 
                       bgcolor: 'white',
                       borderBottom: 1, 
                       borderTop: 1,
                       borderColor: 'divider',
                       borderRadius: '0 0 12px 12px',
                       overflow: 'hidden',
                       boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                     }}
                   >
                     <Box sx={{ p: 2 }}>
                       <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 500 }}>
                         Order Items ({order.orderItems.length})
                       </Typography>
                       <Stack spacing={1.5}>
                         {order.orderItems.map((item, itemIndex) => (
                           <Box
                             key={item.id}
                             sx={{
                               display: 'flex',
                               alignItems: 'center',
                               p: 1.5,
                               bgcolor: 'grey.50',
                               borderRadius: 2,
                               border: '1px solid',
                               borderColor: 'divider',
                               '&:hover': {
                                 bgcolor: 'grey.100',
                                 transition: 'background-color 0.2s ease-in-out',
                               },
                             }}
                           >
                             <Box
                               sx={{
                                 width: 48,
                                 height: 48,
                                 borderRadius: 2,
                        background: 'linear-gradient(135deg, #BDBDBD, #9E9E9E)',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 mr: 2,
                                 overflow: 'hidden',
                                 boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                               }}
                             >
                               <Iconify 
                                 icon="eva:shopping-bag-fill"
                                 width={28} 
                                 sx={{ color: 'white' }}
                               />
                             </Box>
                             <Box sx={{ flex: 1 }}>
                               <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
                                 {item.name}
                               </Typography>
                               <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                 {item.id}
                               </Typography>
                             </Box>
                             <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                               <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                 x{item.quantity}
                               </Typography>
                             </Box>
                             <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                               <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                 {fCurrency(item.price)}
                               </Typography>
                             </Box>
                           </Box>
                         ))}
                       </Stack>
                     </Box>
                   </Box>
                 )}
               </Collapse>
            </Box>
          ))}

          {/* Table Footer */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton 
                size="small" 
                onClick={handleDenseToggle}
                sx={{ color: dense ? 'primary.main' : 'text.secondary' }}
              >
                <Iconify 
                  icon={dense ? "eva:toggle-right-fill" : "eva:toggle-left-outline"} 
                  width={20} 
                />
              </IconButton>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Dense
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Rows per page:
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {rowsPerPage}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {dataFiltered.length === 0 
                  ? '0-0 of 0' 
                  : `${currentPage * rowsPerPage + 1}-${Math.min((currentPage + 1) * rowsPerPage, dataFiltered.length)} of ${dataFiltered.length}`
                }
              </Typography>
              <IconButton 
                size="small" 
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <Iconify icon="eva:chevron-left-fill" />
              </IconButton>
              <IconButton 
                size="small"
                disabled={currentPage >= totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <Iconify icon="eva:chevron-right-fill" />
              </IconButton>
            </Stack>
          </Stack>
        </Card>

      </DashboardContent>

             {/* Action Menu */}
       <Menu
         anchorEl={actionMenuAnchor}
         open={Boolean(actionMenuAnchor)}
         onClose={handleActionMenuClose}
         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
         transformOrigin={{ vertical: 'top', horizontal: 'right' }}
         PaperProps={{
           sx: {
             borderRadius: 2,
             boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
             border: '1px solid',
             borderColor: 'divider',
             minWidth: 140,
           },
         }}
       >
         <MenuItem 
           onClick={handleViewOrder}
           sx={{ 
             py: 1.5, 
             px: 2,
             '&:hover': { bgcolor: 'grey.100' }
           }}
         >
           <Iconify 
             icon="eva:eye-fill" 
             sx={{ mr: 2, color: 'text.primary' }} 
             width={18} 
           />
           <Typography variant="body2" sx={{ color: 'text.primary' }}>
             View
           </Typography>
         </MenuItem>
         <MenuItem 
           onClick={handlePrintLabel}
           sx={{ 
             py: 1.5, 
             px: 2,
             '&:hover': { bgcolor: 'grey.100' }
           }}
         >
           <Iconify 
             icon="eva:printer-fill" 
             sx={{ mr: 2, color: 'primary.main' }} 
             width={18} 
           />
           <Typography variant="body2" sx={{ color: 'primary.main' }}>
             Print Label
           </Typography>
         </MenuItem>
         <MenuItem 
           onClick={handleDeleteOrder}
           sx={{ 
             py: 1.5, 
             px: 2,
             '&:hover': { bgcolor: 'error.light' }
           }}
         >
           <Iconify 
             icon="eva:trash-2-fill" 
             sx={{ mr: 2, color: 'error.main' }} 
             width={18} 
           />
           <Typography variant="body2" sx={{ color: 'error.main' }}>
             Delete
           </Typography>
         </MenuItem>
       </Menu>

      {/* Delete Multiple Orders Confirmation */}
      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Delete Orders"
        content={
          <>
            Are you sure you want to delete <strong>{selectedRowIds.length}</strong> order(s)? This action cannot be undone.
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

      {/* Delete Single Order Confirmation */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete Order"
        content="Are you sure you want to delete this order? This action cannot be undone."
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

       <Dialog open={invoiceModalOpen} onClose={handleCloseInvoiceModal} maxWidth="md" fullWidth>
         <DialogContent sx={{ p: 0 }}>
           {/* Invoice Header with system and seller logo */}
           <Box sx={{ display: 'flex', alignItems: 'center', p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
             <Box sx={{ mr: 2 }}>
               <img src={SYSTEM_LOGO} alt="System Logo" style={{ height: 40 }} />
             </Box>
             {orderForInvoice && (
               <Box>
                 <Avatar src={orderForInvoice.customer.avatar} alt="Seller Logo" sx={{ width: 40, height: 40 }} />
               </Box>
             )}
             <Box sx={{ flexGrow: 1 }} />
             <Typography variant="h6" sx={{ fontWeight: 700 }}>
               Invoice
             </Typography>
           </Box>
           {/* Placeholder for invoice content - to be replaced with full invoice layout */}
           <Box sx={{ p: 3 }}>
             <Typography variant="body1">Invoice content for order: {orderForInvoice?.id}</Typography>
           </Box>
         </DialogContent>
         <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
           <Button onClick={handleCloseInvoiceModal} variant="outlined" startIcon={<Iconify icon="eva:arrow-back-fill" />}>Back</Button>
           <Button onClick={handlePrintInvoice} variant="contained" startIcon={<Iconify icon="eva:printer-fill" />}>Print</Button>
         </DialogActions>
       </Dialog>

      {/* View / Edit Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {viewOrderId && (
            <OrderDetailsView
              id={viewOrderId}
              inDialog
              onClose={() => setViewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

    </>
  );
}

// ----------------------------------------------------------------------

function StatusFilterButton({ label, count, active, onClick, ...other }) {
  return (
    <Button
      variant={active ? 'contained' : 'text'}
      color={active ? 'primary' : 'inherit'}
      onClick={onClick}
      sx={{
        borderRadius: 1.5,
        textTransform: 'none',
        fontWeight: active ? 'bold' : 'normal',
        '&:hover': {
          bgcolor: active ? 'primary.dark' : 'action.hover',
        },
      }}
      {...other}
    >
      {label}
      <Chip
        label={count}
        size="small"
        sx={{
          ml: 1,
          bgcolor: active ? 'primary.light' : 'grey.300',
          color: active ? 'primary.contrastText' : 'text.secondary',
          fontWeight: 'bold',
        }}
      />
    </Button>
  );
}

function applyFilter({ inputData, filters }) {
  const { status } = filters;

  if (status.length) {
    inputData = inputData.filter((order) => status.includes(order.status));
  }

  return inputData;
}
