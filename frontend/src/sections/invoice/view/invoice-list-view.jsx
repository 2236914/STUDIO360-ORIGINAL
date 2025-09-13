'use client';

import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { sumBy } from 'src/utils/helper';
import { fIsAfter, fIsBetween } from 'src/utils/format-time';


import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
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
import { InvoiceTableToolbar } from '../invoice-table-toolbar';
import { InvoiceTableFiltersResult } from '../invoice-table-filters-result';

// Mock data matching the prototype design
const _invoices = [
  {
    id: 'INV-19919',
    invoiceNumber: 'INV-19919',
    createDate: new Date('2025-07-30'),
    dueDate: new Date('2025-09-22'),
    invoiceTo: {
      name: 'Amiah Pruitt',
      email: 'amiah.pruitt@example.com',
      address: '123 Main St, City, State',
      phone: '+1 555-0123',
    },
    invoiceFrom: {
      name: 'Company Name',
      email: 'contact@company.com',
      address: '456 Business Ave, City, State',
      phone: '+1 555-0456',
    },
    items: [
      {
        id: 'item-1',
        title: 'Web Development',
        description: 'Website development services',
        service: 'Development',
        quantity: 1,
        price: 2331.63,
        total: 2331.63,
      },
    ],
    subtotal: 2331.63,
    taxes: 0,
    shipping: 0,
    discount: 0,
    totalAmount: 2331.63,
    status: 'paid',
    sent: 9,
  },
  {
    id: 'INV-19918',
    invoiceNumber: 'INV-19918',
    createDate: new Date('2025-07-31'),
    dueDate: new Date('2025-09-21'),
    invoiceTo: {
      name: 'Ariana Lang',
      email: 'ariana.lang@example.com',
      address: '456 Oak St, City, State',
      phone: '+1 555-0124',
    },
    invoiceFrom: {
      name: 'Company Name',
      email: 'contact@company.com',
      address: '456 Business Ave, City, State',
      phone: '+1 555-0456',
    },
    items: [
      {
        id: 'item-2',
        title: 'Design Services',
        description: 'UI/UX design work',
        service: 'Design',
        quantity: 1,
        price: 2372.93,
        total: 2372.93,
      },
    ],
    subtotal: 2372.93,
    taxes: 0,
    shipping: 0,
    discount: 0,
    totalAmount: 2372.93,
    status: 'overdue',
    sent: 4,
  },
  {
    id: 'INV-19917',
    invoiceNumber: 'INV-19917',
    createDate: new Date('2025-07-20'),
    dueDate: new Date('2025-09-08'),
    invoiceTo: {
      name: 'Lawson Bass',
      email: 'lawson.bass@example.com',
      address: '789 Pine St, City, State',
      phone: '+1 555-0125',
    },
    invoiceFrom: {
      name: 'Company Name',
      email: 'contact@company.com',
      address: '456 Business Ave, City, State',
      phone: '+1 555-0456',
    },
    items: [
      {
        id: 'item-3',
        title: 'Consulting',
        description: 'Business consulting services',
        service: 'Consulting',
        quantity: 1,
        price: 2283.97,
        total: 2283.97,
      },
    ],
    subtotal: 2283.97,
    taxes: 0,
    shipping: 0,
    discount: 0,
    totalAmount: 2283.97,
    status: 'paid',
    sent: 9,
  },
  {
    id: 'INV-19916',
    invoiceNumber: 'INV-19916',
    createDate: new Date('2025-07-21'),
    dueDate: new Date('2025-09-07'),
    invoiceTo: {
      name: 'Selina Boyer',
      email: 'selina.boyer@example.com',
      address: '321 Elm St, City, State',
      phone: '+1 555-0126',
    },
    invoiceFrom: {
      name: 'Company Name',
      email: 'contact@company.com',
      address: '456 Business Ave, City, State',
      phone: '+1 555-0456',
    },
    items: [
      {
        id: 'item-4',
        title: 'Marketing',
        description: 'Digital marketing services',
        service: 'Marketing',
        quantity: 1,
        price: 2251.84,
        total: 2251.84,
      },
    ],
    subtotal: 2251.84,
    taxes: 0,
    shipping: 0,
    discount: 0,
    totalAmount: 2251.84,
    status: 'pending',
    sent: 8,
  },
  // Add more invoices to match prototype numbers
  {
    id: 'INV-19915',
    invoiceNumber: 'INV-19915',
    createDate: new Date('2025-07-15'),
    dueDate: new Date('2025-09-05'),
    invoiceTo: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      address: '123 Oak Ave, City, State',
      phone: '+1 555-0128',
    },
    invoiceFrom: {
      name: 'Company Name',
      email: 'contact@company.com',
      address: '456 Business Ave, City, State',
      phone: '+1 555-0456',
    },
    items: [
      {
        id: 'item-5',
        title: 'Consulting',
        description: 'Business consulting services',
        service: 'Consulting',
        quantity: 1,
        price: 3245.12,
        total: 3245.12,
      },
    ],
    subtotal: 3245.12,
    taxes: 0,
    shipping: 0,
    discount: 0,
    totalAmount: 3245.12,
    status: 'paid',
    sent: 12,
  },
  {
    id: 'INV-19914',
    invoiceNumber: 'INV-19914',
    createDate: new Date('2025-07-10'),
    dueDate: new Date('2025-09-01'),
    invoiceTo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      address: '456 Pine St, City, State',
      phone: '+1 555-0129',
    },
    invoiceFrom: {
      name: 'Company Name',
      email: 'contact@company.com',
      address: '456 Business Ave, City, State',
      phone: '+1 555-0456',
    },
    items: [
      {
        id: 'item-6',
        title: 'Marketing Campaign',
        description: 'Digital marketing services',
        service: 'Marketing',
        quantity: 1,
        price: 4125.45,
        total: 4125.45,
      },
    ],
    subtotal: 4125.45,
    taxes: 0,
    shipping: 0,
    discount: 0,
    totalAmount: 4125.45,
    status: 'pending',
    sent: 5,
  },
  {
    id: 'INV-19913',
    invoiceNumber: 'INV-19913',
    createDate: new Date('2025-07-05'),
    dueDate: new Date('2025-08-25'),
    invoiceTo: {
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      address: '789 Cedar St, City, State',
      phone: '+1 555-0130',
    },
    invoiceFrom: {
      name: 'Company Name',
      email: 'contact@company.com',
      address: '456 Business Ave, City, State',
      phone: '+1 555-0456',
    },
    items: [
      {
        id: 'item-7',
        title: 'Website Maintenance',
        description: 'Monthly website maintenance',
        service: 'Support',
        quantity: 1,
        price: 2890.67,
        total: 2890.67,
      },
    ],
    subtotal: 2890.67,
    taxes: 0,
    shipping: 0,
    discount: 0,
    totalAmount: 2890.67,
    status: 'overdue',
    sent: 8,
  },
  {
    id: 'INV-19912',
    invoiceNumber: 'INV-19912',
    createDate: new Date('2025-07-01'),
    dueDate: new Date('2025-08-20'),
    invoiceTo: {
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      address: '321 Birch St, City, State',
      phone: '+1 555-0131',
    },
    invoiceFrom: {
      name: 'Company Name',
      email: 'contact@company.com',
      address: '456 Business Ave, City, State',
      phone: '+1 555-0456',
    },
    items: [
      {
        id: 'item-8',
        title: 'Logo Design',
        description: 'Brand identity design',
        service: 'Design',
        quantity: 1,
        price: 1875.34,
        total: 1875.34,
      },
    ],
    subtotal: 1875.34,
    taxes: 0,
    shipping: 0,
    discount: 0,
    totalAmount: 1875.34,
    status: 'draft',
    sent: 0,
  },
  {
    id: 'INV-19911',
    invoiceNumber: 'INV-19911',
    createDate: new Date('2025-06-28'),
    dueDate: new Date('2025-08-15'),
    invoiceTo: {
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      address: '987 Spruce St, City, State',
      phone: '+1 555-0132',
    },
    invoiceFrom: {
      name: 'Company Name',
      email: 'contact@company.com',
      address: '456 Business Ave, City, State',
      phone: '+1 555-0456',
    },
    items: [
      {
        id: 'item-9',
        title: 'Database Setup',
        description: 'Database design and setup',
        service: 'Development',
        quantity: 1,
        price: 3456.78,
        total: 3456.78,
      },
    ],
    subtotal: 3456.78,
    taxes: 0,
    shipping: 0,
    discount: 0,
    totalAmount: 3456.78,
    status: 'draft',
    sent: 0,
  },
];

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

  const [tableData, setTableData] = useState(_invoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [printMenuAnchor, setPrintMenuAnchor] = useState(null);

  const filters = useSetState({
    name: '',
    service: [],
    status: 'all',
    startDate: null,
    endDate: null,
  });

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
      const deleteRow = tableData.filter((row) => row.id !== id);
      toast.success('Delete success!');
      setTableData(deleteRow);
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    toast.success('Delete success!');
    setTableData(deleteRows);
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (status) => {
      table.onResetPage();
      filters.setState({ status: status });
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
              component={RouterLink}
              href={paths?.dashboard?.invoice?.new || '/dashboard/invoice/new'}
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
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
