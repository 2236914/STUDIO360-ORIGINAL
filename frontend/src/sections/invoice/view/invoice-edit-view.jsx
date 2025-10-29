'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fCurrencyPHPSymbol } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

// Empty invoices data - will be populated from database
const _invoices = [];

const TABLE_HEAD = [
  { id: 'customer', label: 'Customer' },
  { id: 'createDate', label: 'Create', align: 'center' },
  { id: 'dueDate', label: 'Due', align: 'center' },
  { id: 'amount', label: 'Amount', align: 'center' },
  { id: 'sent', label: 'Sent', align: 'center' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: '', width: 88 },
];

// Analytics Component
function InvoiceAnalytic({ title, total, amount, color, icon }) {
  const getIconColor = () => {
    switch (color) {
      case 'info': return '#00B8D9';
      case 'success': return '#22C55E';
      case 'warning': return '#FFAB00';
      case 'error': return '#FF5630';
      default: return '#919EAB';
    }
  };

  const getBgColor = () => {
    switch (color) {
      case 'info': return 'rgba(0, 184, 217, 0.08)';
      case 'success': return 'rgba(34, 197, 94, 0.08)';
      case 'warning': return 'rgba(255, 171, 0, 0.08)';
      case 'error': return 'rgba(255, 86, 48, 0.08)';
      default: return 'rgba(145, 158, 171, 0.08)';
    }
  };

  return (
         <Box sx={{ py: 2, px: 2.5, flex: 1, minWidth: 200 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
                 <Box
           sx={{
             width: 48,
             height: 48,
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             borderRadius: '50%',
             bgcolor: getBgColor(),
             color: getIconColor(),
           }}
         >
           <Iconify icon={icon} width={24} />
         </Box>

                 <Box sx={{ flexGrow: 1, minWidth: 0 }}>
           <Box sx={{ typography: 'subtitle1', color: 'text.primary', fontWeight: 600, fontSize: '0.875rem' }}>
             {title}
           </Box>
           <Box sx={{ typography: 'caption', color: 'text.secondary', mt: 0.25, fontSize: '0.75rem' }}>
             {total} invoices
           </Box>
           <Box sx={{ typography: 'h6', color: 'text.primary', fontWeight: 600, mt: 0.5, fontSize: '1.125rem' }}>
             {amount}
           </Box>
         </Box>
      </Stack>
    </Box>
  );
}

// Table Row Component
function InvoiceTableRow({ row, selected, onSelectRow }) {
  const { invoiceNumber, createDate, dueDate, invoiceTo, totalAmount, status, sent } = row;

  return (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar alt={invoiceTo.name} sx={{ mr: 2 }}>
          {invoiceTo.name.charAt(0).toUpperCase()}
        </Avatar>
        <ListItemText
          primary={invoiceTo.name}
          secondary={invoiceNumber}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
        />
      </TableCell>

      <TableCell align="center">
        <ListItemText
          primary={fDate(createDate)}
          secondary={fDate(createDate, 'p')}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{ typography: 'caption', color: 'text.disabled' }}
        />
      </TableCell>

      <TableCell align="center">
        <ListItemText
          primary={fDate(dueDate)}
          secondary={fDate(dueDate, 'p')}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{ typography: 'caption', color: 'text.disabled' }}
        />
      </TableCell>

              <TableCell align="center">{fCurrencyPHPSymbol(totalAmount, '₱', 2, '.', ',')}</TableCell>

      <TableCell align="center">{sent}</TableCell>

      <TableCell align="center">
        <Label
          variant="soft"
          color={
            (status === 'paid' && 'success') ||
            (status === 'pending' && 'warning') ||
            (status === 'overdue' && 'error') ||
            'default'
          }
        >
          {status}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Button size="small" color="inherit" startIcon={<Iconify icon="solar:eye-bold" />}>
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}

// Main Component
export function InvoiceListViewFixed() {
  const table = useTable({ defaultOrderBy: 'createDate' });
  const [tableData] = useState(_invoices);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [printMenuAnchor, setPrintMenuAnchor] = useState(null);

  const getInvoicesByStatus = (status) => {
    let filtered = status === 'all' ? tableData : tableData.filter((invoice) => invoice.status === status);
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.invoiceTo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.invoiceTo.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getInvoiceLength = (status) => {
    if (status === 'all') return tableData.length;
    return tableData.filter((item) => item.status === status).length;
  };

  const getTotalAmount = (status) => {
    const filtered = status === 'all' ? tableData : tableData.filter((item) => item.status === status);
    return filtered.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  };

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

  const dataFiltered = getInvoicesByStatus(statusFilter);
  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const TABS = [
    {
      value: 'all',
      label: 'All',
      color: 'default',
      count: getInvoiceLength('all'),
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

  const handleFilterStatus = useCallback((newValue) => {
    table.onResetPage();
    setStatusFilter(newValue);
  }, [table]);

  return (
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
             size="small"
             sx={{
               bgcolor: 'grey.900',
               color: 'common.white',
               '&:hover': {
                 bgcolor: 'grey.800',
               },
               px: 2,
               py: 1,
               borderRadius: 1,
               fontWeight: 500,
               fontSize: '0.875rem',
               minHeight: '36px',
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
              total={getInvoiceLength('all')}
                              amount={fCurrencyPHPSymbol(getTotalAmount('all'), '₱', 2, '.', ',')}
              icon="solar:bill-list-bold-duotone"
              color="info"
            />
            <InvoiceAnalytic
              title="Paid"
              total={getInvoiceLength('paid')}
                              amount={fCurrencyPHPSymbol(getTotalAmount('paid'), '₱', 2, '.', ',')}
              icon="solar:file-check-bold-duotone"
              color="success"
            />
            <InvoiceAnalytic
              title="Pending"
              total={getInvoiceLength('pending')}
                              amount={fCurrencyPHPSymbol(getTotalAmount('pending'), '₱', 2, '.', ',')}
              icon="solar:sort-by-time-bold-duotone"
              color="warning"
            />
            <InvoiceAnalytic
              title="Overdue"
              total={getInvoiceLength('overdue')}
                              amount={fCurrencyPHPSymbol(getTotalAmount('overdue'), '₱', 2, '.', ',')}
              icon="solar:bell-bing-bold-duotone"
              color="error"
            />
            <InvoiceAnalytic
              title="Draft"
              total={getInvoiceLength('draft')}
                              amount={fCurrencyPHPSymbol(getTotalAmount('draft'), '₱', 2, '.', ',')}
              icon="solar:file-corrupted-bold-duotone"
              color="grey"
            />
          </Stack>
        </Scrollbar>
      </Card>

      {/* Status Filter Tabs */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          
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

        <Scrollbar>
          <Table size="medium" sx={{ minWidth: 800 }}>
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
              {dataInPage.map((row) => (
                <InvoiceTableRow
                  key={row.id}
                  row={row}
                  selected={table.selected.includes(row.id)}
                  onSelectRow={() => table.onSelectRow(row.id)}
                />
              ))}

              <TableEmptyRows
                height={table.dense ? 56 : 56 + 20}
                emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
              />

              <TableNoData notFound={!dataFiltered.length} />
            </TableBody>
          </Table>
        </Scrollbar>

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
  );
}
