'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

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

import { VoucherTableRow } from '../voucher-table-row-new';

// Empty voucher data - will be populated from database
const VOUCHER_DATA = [];

const TABLE_HEAD = [
  { id: 'code', label: 'Voucher' },
  { id: 'createdAt', label: 'Created' },
  { id: 'validity', label: 'Validity' },
  { id: 'value', label: 'Value' },
  { id: 'usage', label: 'Usage', align: 'center' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: 'Actions', align: 'right' },
];

// ----------------------------------------------------------------------

export function VoucherListViewInvoiceStyle() {
  const theme = useTheme();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'createdAt' });
  const confirm = useBoolean();

  const [tableData, setTableData] = useState(VOUCHER_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [printMenuAnchor, setPrintMenuAnchor] = useState(null);

  const { state: filters, setState: setFilters } = useSetState({
    name: '',
    type: [],
    status: 'all',
    startDate: null,
    endDate: null,
  });

  const dateError = fIsAfter(filters.startDate, filters.endDate);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: { ...filters, searchQuery },
    dateError,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.name ||
    filters.type.length > 0 ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate) ||
    !!searchQuery;

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;


  const TABS = [
    {
      value: 'all',
      label: 'All',
      color: 'default',
      count: tableData.length,
    },
    {
      value: 'active',
      label: 'Active',
      color: 'success',
      count: tableData.filter((item) => item.status === 'active').length,
    },
    {
      value: 'inactive',
      label: 'Inactive',
      color: 'default',
      count: tableData.filter((item) => item.status === 'inactive').length,
    },
    {
      value: 'expired',
      label: 'Expired',
      color: 'error',
      count: tableData.filter((item) => item.status === 'expired').length,
    },
    {
      value: 'used',
      label: 'Used',
      color: 'warning',
      count: tableData.filter((item) => item.status === 'used').length,
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
      router.push(paths.dashboard.vouchers.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.vouchers.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (status) => {
      table.onResetPage();
      setFilters({ status });
    },
    [setFilters, table]
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
          heading="Vouchers"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Vouchers', href: paths.dashboard.vouchers.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths?.dashboard?.vouchers?.new || '/dashboard/vouchers/new'}
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
              New voucher
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />


        {/* Status Filter Tabs */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          {TABS.map((tab) => {
            const isActive = filters.status === tab.value;
            
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
            placeholder="Search voucher code or name..."
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
                  <Tooltip title="Duplicate">
                    <IconButton color="primary">
                      <Iconify icon="eva:copy-fill" />
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
              <Table 
                size={table.dense ? 'small' : 'medium'} 
                sx={{ 
                  minWidth: 800,
                  '& .MuiTableRow-root': {
                    '&:not(:last-child)': {
                      borderBottom: 'none',
                    }
                  },
                  '& .MuiTableCell-root': {
                    borderBottom: 'none',
                  }
                }}
              >
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
                      <VoucherTableRow
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

                  <TableNoData 
                    notFound={notFound}
                    slotProps={{
                      img: {
                        maxWidth: 100,
                        opacity: 0.7
                      }
                    }}
                  />
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
  const { name, status, type, startDate, endDate, searchQuery } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (voucher) =>
        voucher.code.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        voucher.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (searchQuery) {
    inputData = inputData.filter(
      (voucher) =>
        voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voucher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voucher.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((voucher) => voucher.status === status);
  }

  if (type.length) {
    inputData = inputData.filter((voucher) => type.includes(voucher.type));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((voucher) => fIsBetween(voucher.createdAt, startDate, endDate));
    }
  }

  return inputData;
}
