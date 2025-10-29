"use client";

import { useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Chip,
  Grid,
  Menu,
  Stack,
  Avatar,
  Button,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  ToggleButton,
  InputAdornment,
  CircularProgress,
  ToggleButtonGroup,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { inventoryApi } from 'src/services/inventoryService';
import { MotivationIllustration } from 'src/assets/illustrations';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InventoryModal } from '../inventory-modal';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'error' },
  { value: 'draft', label: 'Draft', color: 'warning' },
];

const STOCK_OPTIONS = [
  { value: 'in stock', label: 'In Stock', color: 'success' },
  { value: 'low stock', label: 'Low Stock', color: 'warning' },
  { value: 'out of stock', label: 'Out of Stock', color: 'error' },
];

// Category filter removed per request

// ----------------------------------------------------------------------

// Active filter chips component (top-level to avoid redefining inside render)
export function ActiveFilterChips({ filters, onClear }) {
  const chips = [];

  if (filters.status) {
    const status = STATUS_OPTIONS.find((s) => s.value === filters.status);
    chips.push({ key: 'status', label: status ? status.label : filters.status });
  }

  if (filters.stock) {
    const stock = STOCK_OPTIONS.find((s) => s.value === filters.stock);
    chips.push({ key: 'stock', label: stock ? stock.label : filters.stock });
  }

  if (filters.search) {
    chips.push({ key: 'search', label: `Search: ${filters.search}` });
  }

  if (chips.length === 0) return null;

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {chips.map((c) => (
        <Chip
          key={c.key}
          label={c.label}
          size="small"
          onDelete={() => onClear(c.key)}
        />
      ))}
    </Stack>
  );
}

export function InventoryListView() {
  const confirmRows = useBoolean();
  const confirmDelete = useBoolean();
  const [deleteId, setDeleteId] = useState(null);

  const router = useRouter();

  // View mode state (list or grid)
  const [viewMode, setViewMode] = useState('list');

  // Filter states
  const filters = useSetState({
    status: '',
    stock: '',
    search: ''
  });

  // Data states
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  // Debounced search to avoid flooding server with requests
  const [debouncedSearch, setDebouncedSearch] = useState(filters.state.search);

  // Selection states
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('new'); // 'new' | 'edit'
  const [modalId, setModalId] = useState(null);

  // Menu states
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedProductForAction, setSelectedProductForAction] = useState(null);
  const [bulkStatusMenuAnchor, setBulkStatusMenuAnchor] = useState(null);
  const [filterButtonEl, setFilterButtonEl] = useState(null);

  const canReset = Boolean(filters.state.status) || Boolean(filters.state.stock) || Boolean(filters.state.search);

  // Load products from database when filters change (debounced search)
  useEffect(() => {
    const appliedFilters = {};
    if (filters.state.status) appliedFilters.status = filters.state.status;
    if (filters.state.stock) appliedFilters.stock = filters.state.stock;
    if (debouncedSearch) appliedFilters.search = debouncedSearch;

    loadProducts(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.state.status, filters.state.stock, debouncedSearch]);

  // Cleanup menu anchors on unmount or when data changes
  useEffect(() => () => {
    setActionMenuAnchor(null);
    setBulkStatusMenuAnchor(null);
  }, [tableData]);

  const loadProducts = async (appliedFilters = {}) => {
    try {
      setLoading(true);
      // Request products from server using provided filters (if any)
      const products = await inventoryApi.getProducts(appliedFilters);

      // Transform database data to match table format
      const transformedData = products.map(product => {
        // Get the first image from the images array if cover_image_url is not available
        let coverUrl = product.cover_image_url;
        if (!coverUrl && product.images && product.images.length > 0) {
          coverUrl = product.images[0];
        }

        // If image missing, we'll fall back to placeholder later

        return {
        id: product.id,
        name: product.name,
          coverUrl: coverUrl || '/assets/images/product/product-placeholder.png',
        category: product.category || 'Uncategorized',
        price: product.price,
        status: product.status,
        inventoryType: product.stock_status,
        quantity: product.stock_quantity,
        sku: product.sku,
        createdAt: product.created_at,
        description: product.description,
          images: product.images || [],
        };
      });

      // merge with any recently created/updated product saved in localStorage
      try {
        const recent = window.localStorage.getItem('studio360:recentProduct');
        if (recent) {
          const recentProduct = JSON.parse(recent);
          const idx = transformedData.findIndex((p) => p.id === recentProduct.id);
          // Get the first image from the images array if cover_image_url is not available
          let recentCoverUrl = recentProduct.cover_image_url;
          if (!recentCoverUrl && recentProduct.images && recentProduct.images.length > 0) {
            recentCoverUrl = recentProduct.images[0];
          }

          const recentTransformed = {
            id: recentProduct.id,
            name: recentProduct.name,
            coverUrl: recentCoverUrl || recentProduct.coverUrl || '/assets/images/product/product-placeholder.png',
            category: recentProduct.category || 'Uncategorized',
            price: recentProduct.price,
            status: recentProduct.status,
            inventoryType: recentProduct.stock_status,
            quantity: recentProduct.stock_quantity,
            sku: recentProduct.sku,
            createdAt: recentProduct.created_at,
            description: recentProduct.description,
            images: recentProduct.images || [],
          };

          if (idx >= 0) {
            transformedData[idx] = recentTransformed;
          } else {
            transformedData.unshift(recentTransformed);
          }

          // remove the recent marker so it doesn't repeatedly override later loads
          window.localStorage.removeItem('studio360:recentProduct');
        }
      } catch (e) {
        console.warn('Failed to merge recent product:', e);
      }

      setTableData(transformedData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Filter data based on current filters (client-side fallback)
  const dataFiltered = useMemo(() => {
    let filtered = [...tableData];

    // Status filter (single-select)
    if (filters.state.status) {
      filtered = filtered.filter(product => product.status === filters.state.status);
    }

    // Stock filter (single-select)
    if (filters.state.stock) {
      filtered = filtered.filter(product => product.inventoryType === filters.state.stock);
    }

    // Search filter
    if (filters.state.search) {
      const searchLower = filters.state.search.toLowerCase();
      filtered = filtered.filter(product =>
        (product.name || '').toLowerCase().includes(searchLower) ||
        (product.sku || '').toLowerCase().includes(searchLower) ||
        (product.category || '').toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [tableData, filters.state]);

  // Selection handlers
  const handleSelectAllClick = useCallback((event) => {
    if (event.target.checked) {
      const newSelected = dataFiltered.map((product) => product.id);
      setSelectedRowIds(newSelected);
      return;
    }
      setSelectedRowIds([]);
  }, [dataFiltered]);

  const handleClick = useCallback((event, id) => {
    const selectedIndex = selectedRowIds.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRowIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRowIds.slice(1));
    } else if (selectedIndex === selectedRowIds.length - 1) {
      newSelected = newSelected.concat(selectedRowIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRowIds.slice(0, selectedIndex),
        selectedRowIds.slice(selectedIndex + 1)
      );
    }

    setSelectedRowIds(newSelected);
  }, [selectedRowIds]);

  // Action handlers
  const handleEditRow = useCallback(
    (id) => {
      setModalMode('edit');
      setModalId(id);
      setModalOpen(true);
    },
    []
  );

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        await inventoryApi.deleteProduct(id);
        setTableData(prev => prev.filter(product => product.id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    },
    []
  );

  // Action menu handlers
  const handleActionMenuOpen = useCallback((event, product) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedProductForAction(product);
    setActionMenuAnchor(event.currentTarget);
  }, []);

  const handleActionMenuClose = useCallback(() => {
    setActionMenuAnchor(null);
    setSelectedProductForAction(null);
  }, []);

  const handleEditProduct = useCallback(() => {
    if (selectedProductForAction) {
      handleEditRow(selectedProductForAction.id);
    }
    handleActionMenuClose();
  }, [selectedProductForAction, handleEditRow, handleActionMenuClose]);

  const handleDeleteProduct = useCallback(() => {
    if (selectedProductForAction) {
      setDeleteId(selectedProductForAction.id);
      confirmDelete.onTrue();
    }
    handleActionMenuClose();
  }, [selectedProductForAction, handleActionMenuClose, confirmDelete]);

  // Bulk status update handlers
  const handleBulkStatusChange = useCallback(async (newStatus) => {
    try {
      setLoading(true);
      // Note: You'll need to implement bulk status update in your API
      // await inventoryApi.updateProductsStatus(selectedRowIds, newStatus);

      setTableData(prevData =>
        prevData.map(product =>
          selectedRowIds.includes(product.id)
            ? { ...product, status: newStatus }
            : product
        )
      );

      toast.success(`${selectedRowIds.length} product(s) status updated to ${newStatus}!`);
      setSelectedRowIds([]);
      setBulkStatusMenuAnchor(null);
    } catch (error) {
      console.error('Error updating products status:', error);
      toast.error('Failed to update products status');
    } finally {
      setLoading(false);
    }
  }, [selectedRowIds]);

  // Bulk status menu handlers
  const handleBulkStatusMenuOpen = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setBulkStatusMenuAnchor(event.currentTarget);
  }, []);

  const handleBulkStatusMenuClose = useCallback(() => {
    setBulkStatusMenuAnchor(null);
  }, []);

  // Filter handlers
  const handleFilterChange = useCallback((filterType, value) => {
    // Merge the changed filter field into state
    filters.setState({ [filterType]: value });
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    filters.setState({
      status: '',
      stock: '',
      search: ''
    });
  }, [filters]);

  // Debounce the search input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.state.search || '');
    }, 400);

    return () => clearTimeout(handler);
  }, [filters.state.search]);

  // View mode handler
  const handleViewModeChange = useCallback((event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  }, []);

  // Render functions
  const renderStatusChip = (status) => {
    const statusConfig = STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0];
    return (
      <Chip
        label={statusConfig.label}
        color={statusConfig.color}
        size="small"
        variant="soft"
      />
    );
  };

  const renderStockChip = (stockType) => {
    const stockConfig = STOCK_OPTIONS.find(option => option.value === stockType) || STOCK_OPTIONS[0];
    return (
      <Chip
        label={stockConfig.label}
        color={stockConfig.color}
        size="small"
        variant="soft"
      />
    );
  };



  // List view render - Responsive
  const renderListView = () => (
    <Card>
      {/* Table Header - Hidden on mobile */}
      <Box sx={{
        bgcolor: 'grey.50',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        display: { xs: 'none', md: 'block' }
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ width: 40 }}>
            <input
              type="checkbox"
              onChange={handleSelectAllClick}
              checked={dataFiltered.length > 0 && selectedRowIds.length === dataFiltered.length}
              ref={(input) => {
                if (input) {
                  input.indeterminate = selectedRowIds.length > 0 && selectedRowIds.length < dataFiltered.length;
                }
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Product
            </Typography>
          </Box>
          <Box sx={{ width: 120 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Category
            </Typography>
          </Box>
          <Box sx={{ width: 100 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Stock
            </Typography>
          </Box>
          <Box sx={{ width: 100 }}>
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

      {/* Table Body */}
      {dataFiltered.map((product) => (
        <Box key={product.id}>
          {/* Desktop Layout */}
          <Box sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: { xs: 'none', md: 'block' }
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={selectedRowIds.indexOf(product.id) !== -1}
                  onChange={(event) => handleClick(event, product.id)}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    alt={product.name}
                    src={product.coverUrl}
                    variant="rounded"
                    sx={{ width: 48, height: 48 }}
                    onError={(e) => { e.target.src = '/assets/images/product/product-placeholder.png'; }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      SKU: {product.sku}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ width: 120 }}>
                <Typography variant="body2">
                  {product.category}
                </Typography>
              </Box>

              <Box sx={{ width: 100 }}>
                {renderStockChip(product.inventoryType)}
              </Box>

              <Box sx={{ width: 100 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {fCurrency(product.price)}
                </Typography>
              </Box>

              <Box sx={{ width: 100 }}>
                {renderStatusChip(product.status)}
              </Box>

              <Box sx={{ width: 40 }}>
                <IconButton
                  size="small"
                  onClick={(event) => handleActionMenuOpen(event, product)}
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

          {/* Mobile Layout */}
          <Box sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: { xs: 'block', md: 'none' }
          }}>
            <Stack spacing={2}>
              {/* Header Row */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <input
                    type="checkbox"
                    checked={selectedRowIds.indexOf(product.id) !== -1}
                    onChange={(event) => handleClick(event, product.id)}
                  />
                  <Avatar
                    alt={product.name}
                    src={product.coverUrl}
                    variant="rounded"
                    sx={{ width: 40, height: 40 }}
                    onError={(e) => { e.target.src = '/assets/images/product/product-placeholder.png'; }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {product.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      SKU: {product.sku}
                    </Typography>
                  </Box>
                </Stack>

                <IconButton
                  size="small"
                  onClick={(event) => handleActionMenuOpen(event, product)}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  <Iconify icon="eva:more-vertical-fill" />
                </IconButton>
              </Stack>

              {/* Details Row */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Category
                  </Typography>
                  <Typography variant="body2">
                    {product.category}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Price
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {fCurrency(product.price)}
                  </Typography>
                </Box>
              </Stack>

              {/* Status Row */}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Stock Status
                  </Typography>
                  {renderStockChip(product.inventoryType)}
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Status
                  </Typography>
                  {renderStatusChip(product.status)}
                </Box>
              </Stack>
            </Stack>
          </Box>
        </Box>
      ))}

      {dataFiltered.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <EmptyContent
            title="No products found"
            description="Try adjusting your filters or add a new product"
            img={<MotivationIllustration />}
          />
        </Box>
      )}
    </Card>
  );

  // Grid view render - Responsive
  const renderGridView = () => (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {dataFiltered.map((product) => (
        <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2} key={product.id}>
          <Card sx={{
            p: { xs: 1.5, sm: 2 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3
            }
          }}>
            <Box sx={{ position: 'relative', mb: { xs: 1, sm: 2 } }}>
              <Avatar
                alt={product.name}
                src={product.coverUrl}
                variant="rounded"
                sx={{
                  width: '100%',
                  height: { xs: 120, sm: 160, md: 180 }
                }}
                onError={(e) => { e.target.src = '/assets/images/product/product-placeholder.png'; }}
              />
              <Box sx={{ position: 'absolute', top: 4, left: 4 }}>
                <input
                  type="checkbox"
                  checked={selectedRowIds.indexOf(product.id) !== -1}
                  onChange={(event) => handleClick(event, product.id)}
                  style={{ transform: 'scale(0.8)' }}
                />
              </Box>
              <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                <IconButton
                  size="small"
                  onClick={(event) => handleActionMenuOpen(event, product)}
                  sx={{
                    bgcolor: 'background.paper',
                    width: 24,
                    height: 24,
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  <Iconify icon="eva:more-vertical-fill" width={16} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 'bold',
                  mb: 0.5,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {product.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  mb: 0.5,
                  display: 'block',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' }
                }}
              >
                {product.category}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  mb: 1,
                  display: 'block',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' }
                }}
              >
                SKU: {product.sku}
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  {fCurrency(product.price)}
                </Typography>
                <Box sx={{ transform: 'scale(0.8)' }}>
                  {renderStockChip(product.inventoryType)}
                </Box>
              </Stack>
              <Box sx={{ transform: 'scale(0.8)', transformOrigin: 'left' }}>
                {renderStatusChip(product.status)}
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}

      {dataFiltered.length === 0 && (
        <Grid item xs={12}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <EmptyContent
              title="No products found"
              description="Try adjusting your filters or add a new product"
              img={<MotivationIllustration />}
            />
          </Box>
        </Grid>
      )}
    </Grid>
  );

  return (
    <DashboardContent sx={{ position: 'relative', zIndex: 1 }}>
        <CustomBreadcrumbs
        heading="Inventory"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Inventory' },
        ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

      {/* Filters and Search Toolbar - Responsive */}
      <Box sx={{
        mb: 3,
        position: 'relative',
        zIndex: 2,
        '& .MuiTextField-root': {
          pointerEvents: 'auto',
          '& input': {
            pointerEvents: 'auto',
            cursor: 'text'
          },
          '& .MuiSelect-select': {
            pointerEvents: 'auto',
            cursor: 'pointer'
          }
        }
      }}>
        {selectedRowIds.length === 0 ? (
          <>
            {/* Mobile Layout */}
            <Stack spacing={2} sx={{ display: { xs: 'block', md: 'none' } }}>
              {/* Search - Full width on mobile */}
              <TextField
                placeholder="Search products..."
                size="small"
                value={filters.state.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" width={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    loading ? (
                      <InputAdornment position="end">
                        <CircularProgress size={18} />
                      </InputAdornment>
                    ) : null
                  ),
                }}
                fullWidth
            sx={{
                  pointerEvents: 'auto',
                  '& input': {
                    pointerEvents: 'auto',
                    cursor: 'text'
                  }
                }}
              />

              {/* Filters Row */}
              {/* Active filter chips */}
              <ActiveFilterChips
                filters={filters.state}
                onClear={(key) => filters.setState({ [key]: '' })}
              />
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <TextField
                  select
                  size="small"
                  label="Status"
                  value={filters.state.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  sx={{ minWidth: 100, flex: 1 }}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Stock"
                  value={filters.state.stock}
                  onChange={(e) => handleFilterChange('stock', e.target.value)}
                  sx={{ minWidth: 100, flex: 1 }}
                >
                  {STOCK_OPTIONS.map((stock) => (
                    <MenuItem key={stock.value} value={stock.value}>
                      {stock.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              {/* Action Buttons Row */}
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                {/* Reset Filters */}
                {canReset && (
                  <Button
                    variant="outlined"
                    onClick={handleResetFilters}
                    startIcon={<Iconify icon="eva:refresh-fill" />}
                    size="small"
                  >
                    Reset
                  </Button>
                )}

                {/* View Toggle and Add Button */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    size="small"
                  >
                    <ToggleButton value="list" aria-label="list view">
                      <Iconify icon="eva:list-fill" />
                    </ToggleButton>
                    <ToggleButton value="grid" aria-label="grid view">
                      <Iconify icon="eva:grid-fill" />
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    onClick={() => {
                      setModalMode('new');
                      setModalId(null);
                      setModalOpen(true);
                    }}
                    size="small"
                  >
                    Add
                  </Button>
                </Stack>
              </Stack>
            </Stack>

            {/* Desktop Layout */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {/* Status Filter */}
              <TextField
                select
                size="small"
                label="Status"
                value={filters.state.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{ minWidth: 120 }}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* Stock Filter */}
              <TextField
                select
                size="small"
                label="Stock"
                value={filters.state.stock}
                onChange={(e) => handleFilterChange('stock', e.target.value)}
                sx={{ minWidth: 120 }}
              >
                {STOCK_OPTIONS.map((stock) => (
                  <MenuItem key={stock.value} value={stock.value}>
                    {stock.label}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ flexGrow: 1 }} />

              {/* Search */}
              <TextField
                placeholder="Search products..."
                size="small"
                value={filters.state.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" width={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    loading ? (
                      <InputAdornment position="end">
                        <CircularProgress size={18} />
                      </InputAdornment>
                    ) : null
                  ),
              }}
              sx={{
                  minWidth: 300,
                  pointerEvents: 'auto',
                  '& input': {
                    pointerEvents: 'auto',
                    cursor: 'text'
              }
              }}
            />

              {/* Reset Filters */}
              {canReset && (
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  startIcon={<Iconify icon="eva:refresh-fill" />}
                >
                  Reset
                </Button>
              )}

              {/* View Mode Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
              >
                <ToggleButton value="list" aria-label="list view">
                  <Iconify icon="eva:list-fill" />
                </ToggleButton>
                <ToggleButton value="grid" aria-label="grid view">
                  <Iconify icon="eva:grid-fill" />
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Add Product Button */}
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => {
                  setModalMode('new');
                  setModalId(null);
                  setModalOpen(true);
                }}
              >
                New Product
              </Button>
            </Stack>
          </>
        ) : (
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {selectedRowIds.length} product{selectedRowIds.length > 1 ? 's' : ''} selected
            </Typography>

          <Button
              variant="outlined"
              onClick={handleBulkStatusMenuOpen}
              startIcon={<Iconify icon="eva:edit-fill" />}
              size="small"
            >
              Update Status
            </Button>
          </Stack>
        )}
      </Box>

      {/* Bulk Status Menu */}
      <Menu
        anchorEl={bulkStatusMenuAnchor}
        open={Boolean(bulkStatusMenuAnchor) && bulkStatusMenuAnchor !== null}
        onClose={handleBulkStatusMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {STATUS_OPTIONS.map((status) => (
          <MenuItem
            key={status.value}
            onClick={() => handleBulkStatusChange(status.value)}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Chip
                label={status.label}
                color={status.color}
                size="small"
                variant="soft"
              />
              <Typography variant="body2">
                Mark as {status.label}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor) && actionMenuAnchor !== null}
        onClose={handleActionMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEditProduct}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteProduct} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-fill" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Content */}
      {viewMode === 'list' ? renderListView() : renderGridView()}

      {/* Modals */}
      <InventoryModal
        open={modalOpen}
        mode={modalMode}
        id={modalId}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          loadProducts();
          setModalOpen(false);
        }}
      />

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete Product"
        content="Are you sure you want to delete this product? This action cannot be undone."
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (deleteId) {
                handleDeleteRow(deleteId);
                setDeleteId(null);
              }
              confirmDelete.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </DashboardContent>
  );
}
