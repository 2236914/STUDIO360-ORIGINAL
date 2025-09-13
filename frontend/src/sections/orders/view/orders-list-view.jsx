'use client';

import { useState, useCallback, useMemo } from 'react';
import { Collapse } from '@mui/material';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import {
  DataGrid,
  gridClasses,
  GridToolbarExport,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

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

// Sample orders data
const ORDERS_DATA = [
  {
    id: '#6010',
    customer: {
      name: 'Jayvion Simon',
      email: 'nannie.abernathy70@yahoo.com',
      avatar: '/assets/images/avatar/avatar_1.jpg',
    },
    date: new Date('2025-08-06'),
    time: '6:54 am',
    items: 6,
    price: 484.15,
    status: 'refunded',
    orderItems: [
      {
        id: '16H9UR0',
        name: 'Urban Explorer Sneakers',
        image: '/assets/images/products/sneakers-green.jpg',
        quantity: 1,
        price: 83.74,
      },
      {
        id: '16H9UR1',
        name: 'Classic Leather Loafers',
        image: '/assets/images/products/loafers-black.jpg',
        quantity: 2,
        price: 97.14,
      },
      {
        id: '16H9UR2',
        name: 'Mountain Trekking Boots',
        image: '/assets/images/products/boots-orange.jpg',
        quantity: 3,
        price: 68.71,
      },
    ],
  },
  {
    id: '#6011',
    customer: {
      name: 'Lucian Obrien',
      email: 'ashlynn.ohara62@gmail.com',
      avatar: '/assets/images/avatar/avatar_2.jpg',
    },
    date: new Date('2025-08-05'),
    time: '8:54 am',
    items: 1,
    price: 83.74,
    status: 'completed',
    orderItems: [
      {
        id: '16H9UR3',
        name: 'Casual Canvas Sneakers',
        image: '/assets/images/products/sneakers-white.jpg',
        quantity: 1,
        price: 83.74,
      },
    ],
  },
  {
    id: '#6012',
    customer: {
      name: 'Soren Durham',
      email: 'vergie.block2@hotmail.com',
      avatar: '/assets/images/avatar/avatar_3.jpg',
    },
    date: new Date('2025-07-26'),
    time: '11:54 pm',
    items: 5,
    price: 400.41,
    status: 'pending',
    orderItems: [
      {
        id: '16H9UR4',
        name: 'Premium Leather Jacket',
        image: '/assets/images/products/jacket-brown.jpg',
        quantity: 1,
        price: 199.99,
      },
      {
        id: '16H9UR5',
        name: 'Denim Jeans',
        image: '/assets/images/products/jeans-blue.jpg',
        quantity: 2,
        price: 89.99,
      },
      {
        id: '16H9UR6',
        name: 'Cotton T-Shirt',
        image: '/assets/images/products/tshirt-white.jpg',
        quantity: 2,
        price: 29.99,
      },
    ],
  },
  {
    id: '#6013',
    customer: {
      name: 'Cortez Herring',
      email: 'vito.hudson@hotmail.com',
      avatar: '/assets/images/avatar/avatar_4.jpg',
    },
    date: new Date('2025-07-25'),
    time: '10:54 pm',
    items: 1,
    price: 83.74,
    status: 'completed',
    orderItems: [
      {
        id: '16H9UR7',
        name: 'Wireless Headphones',
        image: '/assets/images/products/headphones-black.jpg',
        quantity: 1,
        price: 83.74,
      },
    ],
  },
  {
    id: '#6014',
    customer: {
      name: 'Brycen Jimenez',
      email: 'tyrel.greenholt@gmail.com',
      avatar: '/assets/images/avatar/avatar_5.jpg',
    },
    date: new Date('2025-07-24'),
    time: '8:54 pm',
    items: 6,
    price: 484.15,
    status: 'refunded',
    orderItems: [
      {
        id: '16H9UR8',
        name: 'Running Shoes',
        image: '/assets/images/products/running-shoes.jpg',
        quantity: 2,
        price: 129.99,
      },
      {
        id: '16H9UR9',
        name: 'Sports Socks',
        image: '/assets/images/products/socks.jpg',
        quantity: 4,
        price: 15.99,
      },
    ],
  },
  {
    id: '#6015',
    customer: {
      name: 'Giana Brandt',
      email: 'dejon.block5@yahoo.com',
      avatar: '/assets/images/avatar/avatar_6.jpg',
    },
    date: new Date('2025-07-23'),
    time: '8:54 pm',
    items: 1,
    price: 83.74,
    status: 'completed',
    orderItems: [
      {
        id: '16H9UR10',
        name: 'Designer Handbag',
        image: '/assets/images/products/handbag.jpg',
        quantity: 1,
        price: 83.74,
      },
    ],
  },
  {
    id: '#6016',
    customer: {
      name: 'Aspen Schmitt',
      email: 'revoya73@hotmail.com',
      avatar: '/assets/images/avatar/avatar_7.jpg',
    },
    date: new Date('2025-07-22'),
    time: '7:54 am',
    items: 5,
    price: 400.41,
    status: 'pending',
    orderItems: [
      {
        id: '16H9UR11',
        name: 'Smartphone',
        image: '/assets/images/products/smartphone.jpg',
        quantity: 1,
        price: 299.99,
      },
      {
        id: '16H9UR12',
        name: 'Phone Case',
        image: '/assets/images/products/phone-case.jpg',
        quantity: 2,
        price: 19.99,
      },
      {
        id: '16H9UR13',
        name: 'Screen Protector',
        image: '/assets/images/products/screen-protector.jpg',
        quantity: 2,
        price: 15.99,
      },
    ],
  },
  {
    id: '#6017',
    customer: {
      name: 'Colten Aguilar',
      email: 'dasia.jenkins@hotmail.com',
      avatar: '/assets/images/avatar/avatar_8.jpg',
    },
    date: new Date('2025-07-21'),
    time: '6:54 pm',
    items: 1,
    price: 83.74,
    status: 'completed',
  },
  {
    id: '#6018',
    customer: {
      name: 'Angelique Morse',
      email: 'bonny89@yahoo.com',
      avatar: '/assets/images/avatar/avatar_9.jpg',
    },
    date: new Date('2025-07-20'),
    time: '5:54 pm',
    items: 5,
    price: 400.41,
    status: 'pending',
  },
  {
    id: '#6019',
    customer: {
      name: 'Selina Boyer',
      email: 'dawn.goyette@gmail.com',
      avatar: '/assets/images/avatar/avatar_10.jpg',
    },
    date: new Date('2025-07-19'),
    time: '4:54 pm',
    items: 1,
    price: 83.74,
    status: 'completed',
  },
];

// ----------------------------------------------------------------------

export function OrdersListView() {
  const confirmRows = useBoolean();
  const router = useRouter();

  const filters = useSetState({ status: [] });
  const [tableData, setTableData] = useState(ORDERS_DATA);
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
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);
    },
    [tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));
    setTableData(deleteRows);
  }, [selectedRowIds, tableData]);

  const handleViewRow = useCallback(
    (id) => {
      console.log('View order:', id);
    },
    []
  );

  const handleEditRow = useCallback(
    (id) => {
      console.log('Edit order:', id);
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
    console.log('Export data');
    handlePrintMenuClose();
  }, [handlePrintMenuClose]);

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
      router.push(`/dashboard/orders/${selectedOrderForAction.id.replace('#', '')}`);
    }
    handleActionMenuClose();
  }, [selectedOrderForAction, handleActionMenuClose, router]);

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
              <Box sx={{ width: 40 }}></Box>
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
                          bgcolor: order.customer.name === 'Soren Durham' ? 'warning.main' :
                                  order.customer.name === 'Cortez Herring' ? 'primary.main' :
                                  'grey.400',
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
                       borderColor: 'divider',
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
                                 background: item.name.includes('Urban Explorer') ? 'linear-gradient(135deg, #4CAF50, #45a049)' :
                                          item.name.includes('Classic Leather') ? 'linear-gradient(135deg, #424242, #212121)' :
                                          item.name.includes('Mountain Trekking') ? 'linear-gradient(135deg, #FF9800, #F57C00)' :
                                          item.name.includes('Casual Canvas') ? 'linear-gradient(135deg, #2196F3, #1976D2)' :
                                          item.name.includes('Premium Leather') ? 'linear-gradient(135deg, #795548, #5D4037)' :
                                          item.name.includes('Denim') ? 'linear-gradient(135deg, #3F51B5, #303F9F)' :
                                          item.name.includes('Cotton T-Shirt') ? 'linear-gradient(135deg, #9C27B0, #7B1FA2)' :
                                          item.name.includes('Wireless Headphones') ? 'linear-gradient(135deg, #607D8B, #455A64)' :
                                          item.name.includes('Running Shoes') ? 'linear-gradient(135deg, #E91E63, #C2185B)' :
                                          item.name.includes('Sports Socks') ? 'linear-gradient(135deg, #00BCD4, #0097A7)' :
                                          item.name.includes('Designer Handbag') ? 'linear-gradient(135deg, #FF5722, #D84315)' :
                                          item.name.includes('Smartphone') ? 'linear-gradient(135deg, #9E9E9E, #757575)' :
                                          item.name.includes('Phone Case') ? 'linear-gradient(135deg, #FFC107, #FF8F00)' :
                                          item.name.includes('Screen Protector') ? 'linear-gradient(135deg, #8BC34A, #689F38)' :
                                          'linear-gradient(135deg, #BDBDBD, #9E9E9E)',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 mr: 2,
                                 overflow: 'hidden',
                                 boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                               }}
                             >
                               <Iconify 
                                 icon={item.name.includes('Sneakers') ? "eva:shopping-bag-fill" :
                                      item.name.includes('Loafers') ? "eva:shopping-bag-fill" :
                                      item.name.includes('Boots') ? "eva:shopping-bag-fill" :
                                      item.name.includes('Jacket') ? "eva:shopping-bag-fill" :
                                      item.name.includes('Jeans') ? "eva:shopping-bag-fill" :
                                      item.name.includes('T-Shirt') ? "eva:shopping-bag-fill" :
                                      item.name.includes('Headphones') ? "eva:headphones-fill" :
                                      item.name.includes('Running') ? "eva:shopping-bag-fill" :
                                      item.name.includes('Socks') ? "eva:shopping-bag-fill" :
                                      item.name.includes('Handbag') ? "eva:shopping-bag-fill" :
                                      item.name.includes('Smartphone') ? "eva:smartphone-fill" :
                                      item.name.includes('Case') ? "eva:shopping-bag-fill" :
                                      item.name.includes('Protector') ? "eva:shopping-bag-fill" :
                                      "eva:shopping-bag-fill"} 
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

       <ConfirmDialog
         open={confirmRows.value}
         onClose={confirmRows.onFalse}
         title="Delete"
         content={
           <>
             Are you sure want to delete <strong> {selectedRowIds.length} </strong> items?
           </>
         }
         action={
           <Button
             variant="contained"
             color="error"
             onClick={() => {
               handleDeleteRows();
               confirmRows.onFalse();
             }}
           >
             Delete
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
