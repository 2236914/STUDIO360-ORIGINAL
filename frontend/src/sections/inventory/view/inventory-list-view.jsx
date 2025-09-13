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
  {
    id: '6',
    name: 'Bluetooth Gaming Mouse',
    category: 'Electronics',
    sku: 'BGM-606-BLK',
    stock: 33,
    minStock: 10,
    price: 79.99,
    status: 'active',
    inventoryType: 'in stock',
    createdAt: new Date('2024-01-08'),
    coverUrl: '/assets/images/product/product_6.jpg',
  },
  {
    id: '7',
    name: 'USB-C Hub',
    category: 'Electronics',
    sku: 'UCH-707-GRY',
    stock: 18,
    minStock: 12,
    price: 49.99,
    status: 'active',
    inventoryType: 'in stock',
    createdAt: new Date('2024-01-03'),
    coverUrl: '/assets/images/product/product_7.jpg',
  },
  {
    id: '8',
    name: 'Mechanical Keyboard',
    category: 'Electronics',
    sku: 'MKB-808-RGB',
    stock: 2,
    minStock: 8,
    price: 149.99,
    status: 'active',
    inventoryType: 'low stock',
    createdAt: new Date('2024-01-01'),
    coverUrl: '/assets/images/product/product_8.jpg',
  },
  {
    id: '9',
    name: 'Laptop Stand',
    category: 'Accessories',
    sku: 'LS-909-ALU',
    stock: 0,
    minStock: 6,
    price: 34.99,
    status: 'inactive',
    inventoryType: 'out of stock',
    createdAt: new Date('2023-12-28'),
    coverUrl: '/assets/images/product/product_9.jpg',
  },
  {
    id: '10',
    name: 'Wireless Earbuds',
    category: 'Electronics',
    sku: 'WEB-101-WHT',
    stock: 67,
    minStock: 25,
    price: 119.99,
    status: 'active',
    inventoryType: 'in stock',
    createdAt: new Date('2023-12-25'),
    coverUrl: '/assets/images/product/product_10.jpg',
  },
];

// ----------------------------------------------------------------------

export function InventoryListView() {
  const confirmRows = useBoolean();

  const router = useRouter();

  const filters = useSetState({ status: [], stock: [] });

  const [tableData, setTableData] = useState(INVENTORY_DATA);

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [filterButtonEl, setFilterButtonEl] = useState(null);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.state, selectedRowIds]
  );

  const columns = [
    { field: 'category', headerName: 'Category', filterable: false },
    {
      field: 'name',
      headerName: 'Product',
      flex: 1,
      minWidth: 360,
      hideable: false,
      renderCell: (params) => (
        <RenderCellProduct params={params} onViewRow={() => handleViewRow(params.row.id)} />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Create at',
      width: 160,
      renderCell: (params) => <RenderCellCreatedAt params={params} />,
    },
    {
      field: 'inventoryType',
      headerName: 'Stock',
      width: 160,
      type: 'singleSelect',
      valueOptions: STOCK_OPTIONS,
      renderCell: (params) => <RenderCellStock params={params} />,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 140,
      editable: true,
      renderCell: (params) => <RenderCellPrice params={params} />,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
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
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Inventory', href: paths.dashboard.inventory.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.inventory.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New product
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

          <Card
            sx={{
              flexGrow: { md: 1 },
              display: { md: 'flex' },
            height: { xs: 800, md: 'auto' },
            minHeight: 600,
              flexDirection: { md: 'column' },
            }}
          >
            <DataGrid
              checkboxSelection
              disableRowSelectionOnClick
              rows={dataFiltered}
              columns={columns}
              loading={false}
              getRowHeight={() => 'auto'}
            pageSizeOptions={[5, 10, 25]}
              initialState={{ 
                pagination: { 
                  paginationModel: { 
                  pageSize: 10 
                  } 
                } 
              }}
              onRowSelectionModelChange={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
              slots={{
                toolbar: CustomToolbarCallback,
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
                display: 'inline-flex' 
              },
              height: '100%',
              '& .MuiDataGrid-main': {
                minHeight: 400,
              }
              }}
            />
          </Card>
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
}) {
  return (
    <>
      <GridToolbarContainer>
        <InventoryTableToolbar
          filters={filters}
          options={{ stocks: STOCK_OPTIONS, status: STATUS_OPTIONS }}
        />

        <GridToolbarQuickFilter />

        <Stack
          spacing={1}
          flexGrow={1}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          {!!selectedRowIds.length && (
            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={onOpenConfirmDeleteRows}
            >
              Delete ({selectedRowIds.length})
            </Button>
          )}

            <GridToolbarColumnsButton />
          <GridToolbarFilterButton ref={setFilterButtonEl} />
            <GridToolbarExport />
        </Stack>
      </GridToolbarContainer>

      {canReset && (
        <InventoryTableFiltersResult
          filters={filters}
          totalResults={filteredResults}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}
    </>
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