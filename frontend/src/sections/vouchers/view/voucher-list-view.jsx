'use client';

import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
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
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { VoucherTableToolbar } from '../voucher-table-toolbar';
import { VoucherTableFiltersResult } from '../voucher-table-filters-result';
import { VoucherStatsCard } from '../voucher-stats-card';
import {
  RenderCellVoucherCode,
  RenderCellVoucherType,
  RenderCellVoucherValue,
  RenderCellVoucherStatus,
  RenderCellVoucherUsage,
  RenderCellVoucherValidity,
  RenderCellCreatedAt,
} from '../voucher-table-row';

// ----------------------------------------------------------------------

const VOUCHER_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage Discount' },
  { value: 'fixed_amount', label: 'Fixed Amount' },
  { value: 'free_shipping', label: 'Free Shipping' },
  { value: 'buy_x_get_y', label: 'Buy X Get Y' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'expired', label: 'Expired' },
  { value: 'used', label: 'Used' },
];

const HIDE_COLUMNS_TOGGLABLE = ['actions'];

// Sample voucher data
const VOUCHER_DATA = [
  {
    id: 1,
    code: 'WELCOME10',
    name: 'Welcome Discount',
    description: '10% off for new customers',
    type: 'percentage',
    value: 10,
    minOrderAmount: 50,
    maxDiscount: 20,
    usageLimit: 100,
    usedCount: 25,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    applicableTo: 'all',
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 2,
    code: 'SAVE20',
    name: 'Save $20',
    description: '$20 off orders over $100',
    type: 'fixed_amount',
    value: 20,
    minOrderAmount: 100,
    usageLimit: 50,
    usedCount: 12,
    validFrom: '2024-02-01T00:00:00Z',
    validUntil: '2024-06-30T23:59:59Z',
    applicableTo: 'all',
    status: 'active',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 3,
    code: 'FREESHIP',
    name: 'Free Shipping',
    description: 'Free shipping on all orders',
    type: 'free_shipping',
    value: 0,
    minOrderAmount: 0,
    usageLimit: null,
    usedCount: 45,
    validFrom: '2024-01-15T00:00:00Z',
    validUntil: null,
    applicableTo: 'all',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 4,
    code: 'SUMMER25',
    name: 'Summer Sale',
    description: '25% off summer collection',
    type: 'percentage',
    value: 25,
    minOrderAmount: 75,
    maxDiscount: 50,
    usageLimit: 200,
    usedCount: 200,
    validFrom: '2024-06-01T00:00:00Z',
    validUntil: '2024-08-31T23:59:59Z',
    applicableTo: 'categories',
    status: 'used',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-08-31T10:00:00Z',
  },
];

// ----------------------------------------------------------------------

function CustomToolbar({ filters, canReset, selectedRowIds, setFilterButtonEl, filteredResults, onOpenConfirmDeleteRows }) {
  return (
    <GridToolbarContainer sx={{ p: 2 }}>
      <GridToolbarQuickFilter placeholder="Search vouchers..." />
      
      <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
        <GridToolbarFilterButton ref={setFilterButtonEl} />
        <GridToolbarColumnsButton />
        <GridToolbarExport />
        
        {selectedRowIds.length > 0 && (
          <Button
            color="error"
            variant="contained"
            onClick={onOpenConfirmDeleteRows}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          >
            Delete ({selectedRowIds.length})
          </Button>
        )}
      </Stack>
    </GridToolbarContainer>
  );
}

function applyFilter({ inputData, filters }) {
  const { status, type, search } = filters;

  if (status && status.length !== 0) {
    inputData = inputData.filter((voucher) => status.includes(voucher.status));
  }

  if (type && type.length !== 0) {
    inputData = inputData.filter((voucher) => type.includes(voucher.type));
  }

  if (search) {
    const searchLower = search.toLowerCase();
    inputData = inputData.filter(
      (voucher) =>
        voucher.name.toLowerCase().includes(searchLower) ||
        voucher.code.toLowerCase().includes(searchLower) ||
        voucher.description.toLowerCase().includes(searchLower)
    );
  }

  return inputData;
}

// ----------------------------------------------------------------------

export function VoucherListView() {
  const router = useRouter();
  const confirmRows = useBoolean();
  const [tableData, setTableData] = useState(VOUCHER_DATA);
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [filters, setFilters] = useSetState({
    status: [],
    type: [],
    search: '',
  });

  const canReset = !!filters.status.length || !!filters.type.length || !!filters.search;

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, [setFilters]);

  const handleResetFilters = useCallback(() => {
    setFilters({
      status: [],
      type: [],
      search: '',
    });
  }, [setFilters]);

  const dataFiltered = applyFilter({ inputData: tableData, filters });

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      toast.success('Voucher deleted successfully!');
      setTableData(deleteRow);
    },
    [tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));
    toast.success('Vouchers deleted successfully!');
    setTableData(deleteRows);
    setSelectedRowIds([]);
    confirmRows.onFalse();
  }, [selectedRowIds, tableData, confirmRows]);

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

  const handleToggleStatus = useCallback(
    (id) => {
      setTableData((prevData) =>
        prevData.map((voucher) =>
          voucher.id === id
            ? {
                ...voucher,
                status: voucher.status === 'active' ? 'inactive' : 'active',
                updatedAt: new Date().toISOString(),
              }
            : voucher
        )
      );
      toast.success('Voucher status updated!');
    },
    []
  );

  const CustomToolbarCallback = useCallback(
    () => (
      <CustomToolbar
        filters={filters}
        canReset={canReset}
        selectedRowIds={selectedRowIds}
        setFilterButtonEl={setFilterButtonEl}
        filteredResults={dataFiltered.length}
        onOpenConfirmDeleteRows={confirmRows.onTrue}
      />
    ),
    [filters, canReset, selectedRowIds, dataFiltered.length, confirmRows]
  );

  const columns = [
    {
      field: 'code',
      headerName: 'Code',
      width: 120,
      hideable: false,
      renderCell: (params) => (
        <RenderCellVoucherCode params={params} onViewRow={() => handleViewRow(params.row.id)} />
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      hideable: false,
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      type: 'singleSelect',
      valueOptions: VOUCHER_TYPE_OPTIONS,
      renderCell: (params) => <RenderCellVoucherType params={params} />,
    },
    {
      field: 'value',
      headerName: 'Value',
      width: 120,
      renderCell: (params) => <RenderCellVoucherValue params={params} />,
    },
    {
      field: 'usage',
      headerName: 'Usage',
      width: 120,
      renderCell: (params) => <RenderCellVoucherUsage params={params} />,
    },
    {
      field: 'validity',
      headerName: 'Validity',
      width: 140,
      renderCell: (params) => <RenderCellVoucherValidity params={params} />,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      type: 'singleSelect',
      valueOptions: STATUS_OPTIONS,
      renderCell: (params) => <RenderCellVoucherStatus params={params} />,
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 160,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
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
          icon={
            <Iconify 
              icon={params.row.status === 'active' ? 'solar:pause-circle-bold' : 'solar:play-circle-bold'} 
            />
          }
          label={params.row.status === 'active' ? 'Deactivate' : 'Activate'}
          onClick={() => handleToggleStatus(params.row.id)}
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
          heading="Vouchers"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Vouchers', href: paths.dashboard.vouchers.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.vouchers.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Voucher
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <VoucherStatsCard />

        <Card sx={{ flexGrow: { md: 1 }, display: 'flex', flexDirection: 'column' }}>
          <VoucherTableToolbar
            filters={filters}
            onFilters={handleFilters}
            canReset={canReset}
            onResetFilters={handleResetFilters}
          />

          {canReset && (
            <VoucherTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              canReset={canReset}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
            />
          )}

          <DataGrid
            checkboxSelection
            disableRowSelectionOnClick
            rows={dataFiltered}
            columns={columns}
            loading={false}
            getRowHeight={() => 'auto'}
            onRowSelectionModelChange={(newSelectionModel) => {
              setSelectedRowIds(newSelectionModel);
            }}
            slots={{
              toolbar: CustomToolbarCallback,
              noRowsOverlay: () => <EmptyContent filled title="No Vouchers" />,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: {
                  placeholder: 'Search vouchers...',
                },
              },
            }}
            sx={{
              [`& .${gridClasses.cell}`]: {
                py: 1,
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            pageSizeOptions={[25, 50, 100]}
          />
        </Card>
      </DashboardContent>

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selectedRowIds.length} </strong> vouchers?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteRows}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}
