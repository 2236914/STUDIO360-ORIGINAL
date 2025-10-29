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

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';
import { vouchersApi } from 'src/services/vouchersService';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { VoucherStatsCard } from '../voucher-stats-card';
import { VoucherTableToolbar } from '../voucher-table-toolbar';
import { VoucherTableFiltersResult } from '../voucher-table-filters-result';
import { VoucherModal } from '../voucher-modal';
import {
  RenderCellCreatedAt,
  RenderCellVoucherCode,
  RenderCellVoucherType,
  RenderCellVoucherValue,
  RenderCellVoucherUsage,
  RenderCellVoucherStatus,
  RenderCellVoucherValidity,
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
  const confirmDelete = useBoolean();
  const [deleteId, setDeleteId] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [modalVoucherId, setModalVoucherId] = useState(null);

  // Load vouchers from database
  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading vouchers...');
      const vouchers = await vouchersApi.getVouchers();
      console.log('📋 Received vouchers from API:', vouchers);
      console.log('📊 Voucher count:', vouchers?.length || 0);
      
      // Transform database data to match component format
      const transformedVouchers = vouchers.map(voucher => ({
        id: voucher.id,
        name: voucher.name,
        code: voucher.code,
        description: voucher.description || '',
        type: voucher.type,
        value: parseFloat(voucher.discount_value || 0),
        discount_value: parseFloat(voucher.discount_value || 0),
        minOrderAmount: parseFloat(voucher.min_purchase_amount || 0),
        min_purchase_amount: parseFloat(voucher.min_purchase_amount || 0),
        max_discount_amount: voucher.max_discount_amount ? parseFloat(voucher.max_discount_amount) : null,
        usageLimit: voucher.usage_limit,
        usage_limit: voucher.usage_limit,
        usedCount: voucher.usage_count || 0,
        usage_count: voucher.usage_count || 0,
        usage_limit_per_user: voucher.usage_limit_per_user || 1,
        validFrom: voucher.start_date ? new Date(voucher.start_date) : new Date(),
        validUntil: voucher.end_date ? new Date(voucher.end_date) : undefined,
        start_date: voucher.start_date,
        end_date: voucher.end_date,
        status: voucher.status,
        is_active: voucher.is_active,
        created_at: voucher.created_at,
        createdAt: voucher.created_at,
        applicableTo: voucher.applicable_product_ids ? 'products' : (voucher.applicable_category_ids ? 'categories' : 'all'),
        applicableIds: voucher.applicable_product_ids || voucher.applicable_category_ids || [],
      }));
      
      setTableData(transformedVouchers);
      setInitialLoad(false);
      
      if (transformedVouchers.length > 0) {
        toast.success(`${transformedVouchers.length} voucher(s) loaded successfully!`);
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error('Failed to load vouchers');
      setInitialLoad(false);
    } finally {
      setLoading(false);
    }
  };

  const { state: filters, setState: setFilters } = useSetState({
    status: [],
    type: [],
    search: '',
  });

  const canReset = !!filters.status.length || !!filters.type.length || !!filters.search;

  const handleFilters = useCallback((name, value) => {
    setFilters({
      [name]: value,
    });
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
      setDeleteId(id);
      confirmDelete.onTrue();
    },
    []
  );

  const confirmDeleteRow = async () => {
    try {
      setLoading(true);
      await vouchersApi.deleteVoucher(deleteId);
      
      const deleteRow = tableData.filter((row) => row.id !== deleteId);
      setTableData(deleteRow);
      
      toast.success('Voucher deleted successfully!');
      confirmDelete.onFalse();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error('Failed to delete voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRows = useCallback(async () => {
    try {
      setLoading(true);
      await vouchersApi.deleteVouchers(selectedRowIds);
      
      const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));
      setTableData(deleteRows);
      setSelectedRowIds([]);
      
      toast.success(`${selectedRowIds.length} voucher(s) deleted successfully!`);
      confirmRows.onFalse();
    } catch (error) {
      console.error('Error deleting vouchers:', error);
      toast.error('Failed to delete vouchers');
    } finally {
      setLoading(false);
    }
  }, [selectedRowIds, tableData, confirmRows]);

  const handleEditRow = useCallback(
    (id) => {
      setModalMode('edit');
      setModalVoucherId(id);
      setModalOpen(true);
    },
    []
  );

  const handleViewRow = useCallback(
    (id) => {
      setModalMode('view');
      setModalVoucherId(id);
      setModalOpen(true);
    },
    []
  );

  const handleCreateVoucher = useCallback(() => {
    setModalMode('create');
    setModalVoucherId(null);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setModalVoucherId(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    // Reload vouchers after successful create/edit
    loadVouchers();
  }, [loadVouchers]);

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
              onClick={handleCreateVoucher}
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
            loading={loading}
            getRowHeight={() => 'auto'}
            onRowSelectionModelChange={(newSelectionModel) => {
              setSelectedRowIds(newSelectionModel);
            }}
            slots={{
              toolbar: CustomToolbarCallback,
              noRowsOverlay: () => <EmptyContent filled title={initialLoad ? 'Loading...' : 'No Vouchers'} />,
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

      {/* Delete Multiple Vouchers Confirmation */}
      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Delete Vouchers"
        content={
          <>
            Are you sure you want to delete <strong>{selectedRowIds.length}</strong> voucher(s)? This action cannot be undone.
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

      {/* Delete Single Voucher Confirmation */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete Voucher"
        content="Are you sure you want to delete this voucher? This action cannot be undone."
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

      {/* Voucher Modal */}
      <VoucherModal
        open={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        voucherId={modalVoucherId}
        onSuccess={handleModalSuccess}
      />
    </>
  );
}
