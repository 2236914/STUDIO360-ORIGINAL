'use client';

import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
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

import { InventoryTableToolbar } from '../inventory-table-toolbar';
import { InventoryTableFiltersResult } from '../inventory-table-filters-result';
import {
  RenderCellStock,
  RenderCellPrice,
  RenderCellStatus,
  RenderCellProduct,
  RenderCellCreatedAt,
} from '../inventory-table-row';

// ----------------------------------------------------------------------

const STOCK_OPTIONS = [
  { value: 'in stock', label: 'In Stock' },
  { value: 'low stock', label: 'Low Stock' },
  { value: 'out of stock', label: 'Out of Stock' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// Sample inventory data
const INVENTORY_DATA = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    category: 'Electronics',
    sku: 'WBH-001-BLK',
    stock: 25,
    minStock: 10,
    price: 89.99,
    status: 'active',
    inventoryType: 'in stock',
    createdAt: new Date('2024-01-15'),
    coverUrl: '/assets/images/product/product_1.jpg',
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    category: 'Electronics',
    sku: 'SFW-202-SLV',
    stock: 8,
    minStock: 15,
    price: 199.99,
    status: 'active',
    inventoryType: 'low stock',
    createdAt: new Date('2024-01-10'),
    coverUrl: '/assets/images/product/product_2.jpg',
  },
  {
    id: '3',
    name: 'Portable Bluetooth Speaker',
    category: 'Electronics',
    sku: 'PBS-303-RED',
    stock: 0,
    minStock: 5,
    price: 59.99,
    status: 'active',
    inventoryType: 'out of stock',
    createdAt: new Date('2024-01-05'),
    coverUrl: '/assets/images/product/product_3.jpg',
  },
  {
    id: '4',
    name: 'Premium Phone Case',
    category: 'Accessories',
    sku: 'PPC-404-CLR',
    stock: 45,
    minStock: 20,
    price: 24.99,
    status: 'active',
    inventoryType: 'in stock',
    createdAt: new Date('2024-01-20'),
    coverUrl: '/assets/images/product/product_4.jpg',
  },
  {
    id: '5',
    name: 'Wireless Charging Pad',
    category: 'Electronics',
    sku: 'WCP-505-WHT',
    stock: 12,
    minStock: 15,
    price: 39.99,
    status: 'active',
    inventoryType: 'low stock',
    createdAt: new Date('2024-01-12'),
    coverUrl: '/assets/images/product/product_5.jpg',
  },
];

// ----------------------------------------------------------------------

export function InventoryListView() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const confirmRows = useBoolean();

  const router = useRouter();

  const filters = useSetState({ status: [], stock: [] });

  const [tableData, setTableData] = useState(INVENTORY_DATA);

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [filterButtonEl, setFilterButtonEl] = useState(null);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    ...HIDE_COLUMNS,
    // Hide less important columns on mobile
    category: isMobile,
    sku: isMobile,
    createdAt: isMobile,
  });

  const [density, setDensity] = useState('standard');

  const canReset = filters.state.status.length > 0 || filters.state.stock.length > 0;

  const dataFiltered = applyFilter({ inputData: tableData, filters: filters.state });

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      toast.success('Delete success!');

      setTableData(deleteRow);
    },
    [tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !selectedRowIds.includes(row.id));

    toast.success('Delete success!');

    setTableData(deleteRows);
  }, [selectedRowIds, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.inventory.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.inventory.details(id));
    },
    [router]
  );

  const handleDensityChange = useCallback(() => {
    setDensity(prev => prev === 'standard' ? 'compact' : 'standard');
  }, []);

  const CustomToolbarCallback = useCallback(
    () => (
      <CustomToolbar
        filters={filters}
        canReset={canReset}
        selectedRowIds={selectedRowIds}
        setFilterButtonEl={setFilterButtonEl}
        filteredResults={dataFiltered.length}
        onOpenConfirmDeleteRows={confirmRows.onTrue}
        isMobile={isMobile}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.state, selectedRowIds, isMobile]
  );

  const columns = [
    { 
      field: 'category', 
      headerName: 'Category', 
      filterable: false,
      width: isMobile ? 120 : 140,
      hideable: true,
    },
    {
      field: 'name',
      headerName: 'Product',
      flex: 1,
      minWidth: isMobile ? 200 : 360,
      hideable: false,
      renderCell: (params) => (
        <RenderCellProduct params={params} onViewRow={() => handleViewRow(params.row.id)} />
      ),
    },
    {
      field: 'sku',
      headerName: 'Product SKU',
      width: isMobile ? 120 : 140,
      hideable: true,
      renderCell: (params) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {params.row.sku}
        </span>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Create at',
      width: isMobile ? 120 : 160,
      hideable: true,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
    },
    {
      field: 'inventoryType',
      headerName: 'Stock',
      width: isMobile ? 100 : 160,
      type: 'singleSelect',
      valueOptions: STOCK_OPTIONS,
      renderCell: (params) => <RenderCellStock params={params} />,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: isMobile ? 100 : 140,
      editable: true,
      renderCell: (params) => <RenderCellPrice params={params} />,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: isMobile ? 80 : 110,
      type: 'singleSelect',
      editable: true,
      valueOptions: STATUS_OPTIONS,
      renderCell: (params) => <RenderCellStatus params={params} />,
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: isMobile ? 60 : 80,
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
          onClick={() => {
            handleDeleteRow(params.row.id);
          }}
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
          heading="Inventory"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Inventory' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.inventory.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              size={isMobile ? "small" : "medium"}
              sx={{
                minWidth: isMobile ? 'auto' : 140,
                px: isMobile ? 2 : 3,
              }}
            >
              {isMobile ? 'New' : 'New product'}
            </Button>
          }
          sx={{ 
            mb: { xs: 2, md: 5 },
            px: { xs: 2, md: 3 },
          }}
        />

        <Box sx={{ px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
          <Card
            sx={{
              flexGrow: { md: 1 },
              display: { md: 'flex' },
              minHeight: { xs: 500, md: 700 },
              flexDirection: { md: 'column' },
              '& .MuiDataGrid-root': {
                border: 'none',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: 'none',
              },
              '& .MuiDataGrid-columnHeaders': {
                borderBottom: 'none',
                bgcolor: 'background.neutral',
              },
            }}
          >
            <DataGrid
              checkboxSelection
              disableRowSelectionOnClick
              rows={dataFiltered}
              columns={columns}
              loading={false}
              density={density}
              getRowHeight={() => 'auto'}
              pageSizeOptions={isMobile ? [5, 10] : [5, 10, 25]}
              initialState={{ 
                pagination: { 
                  paginationModel: { 
                    pageSize: isMobile ? 5 : 10 
                  } 
                } 
              }}
              onRowSelectionModelChange={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
              slots={{
                toolbar: CustomToolbarCallback,
                footer: () => <CustomFooter density={density} onDensityChange={handleDensityChange} />,
                noRowsOverlay: () => <EmptyContent />,
                noResultsOverlay: () => <EmptyContent title="No results found" />,
              }}
              slotProps={{
                panel: { anchorEl: filterButtonEl },
                toolbar: { setFilterButtonEl },
                columnsManagement: { getTogglableColumns },
              }}
              sx={{ 
                [`& .${gridClasses.cell}`]: { 
                  alignItems: 'center', 
                  display: 'inline-flex',
                  px: { xs: 1, md: 2 },
                },
                [`& .${gridClasses.columnHeaders}`]: {
                  px: { xs: 1, md: 2 },
                },
                '& .MuiDataGrid-virtualScroller': {
                  px: { xs: 1, md: 2 },
                },
              }}
            />
          </Card>
        </Box>
      </DashboardContent>

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
    </>
  );
}

function CustomToolbar({
  filters,
  canReset,
  selectedRowIds,
  filteredResults,
  setFilterButtonEl,
  onOpenConfirmDeleteRows,
  isMobile,
}) {
  return (
    <>
      <GridToolbarContainer sx={{ 
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 1 },
        p: { xs: 2, md: 1 },
        alignItems: { xs: 'stretch', md: 'center' },
      }}>
        <InventoryTableToolbar
          filters={filters}
          options={{ stocks: STOCK_OPTIONS, status: STATUS_OPTIONS }}
        />

        <GridToolbarQuickFilter 
          sx={{ 
            width: { xs: '100%', md: 'auto' },
            minWidth: { xs: 'auto', md: 240 },
          }}
        />

        <Stack
          spacing={1}
          flexGrow={1}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', md: 'auto' },
            gap: { xs: 1, sm: 1 },
          }}
        >
          {!!selectedRowIds.length && (
            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={onOpenConfirmDeleteRows}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                minWidth: { xs: 'auto', sm: 120 },
              }}
            >
              {isMobile ? `Delete (${selectedRowIds.length})` : `Delete (${selectedRowIds.length})`}
            </Button>
          )}

          <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <GridToolbarColumnsButton />
            <Box ref={setFilterButtonEl}>
              <GridToolbarFilterButton />
            </Box>
            <GridToolbarExport />
          </Stack>
        </Stack>
      </GridToolbarContainer>

      {canReset && (
        <InventoryTableFiltersResult
          filters={filters}
          totalResults={filteredResults}
          sx={{ p: { xs: 2, md: 2.5 }, pt: 0 }}
        />
      )}
    </>
  );
}

function CustomFooter({ density, onDensityChange }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Left side - Density toggle */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title={density === 'compact' ? 'Switch to comfortable view' : 'Switch to compact view'}>
          <IconButton 
            onClick={onDensityChange}
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
          >
            <Iconify icon={density === 'compact' ? 'eva:expand-outline' : 'eva:compress-outline'} />
          </IconButton>
        </Tooltip>
        <Typography variant="body2" color="text.secondary">
          {density === 'compact' ? 'Compact' : 'Comfortable'}
        </Typography>
      </Stack>

      {/* Right side - will show default pagination */}
      <Box />
    </Box>
  );
}

function applyFilter({ inputData, filters }) {
  const { stock, status } = filters;

  if (stock.length) {
    inputData = inputData.filter((product) => stock.includes(product.inventoryType));
  }

  if (status.length) {
    inputData = inputData.filter((product) => status.includes(product.status));
  }

  return inputData;
}