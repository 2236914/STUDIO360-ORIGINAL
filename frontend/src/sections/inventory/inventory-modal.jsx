import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { inventoryApi } from 'src/services/inventoryService';

import { InventoryNewEditForm } from './inventory-new-edit-form';

// A small wrapper modal to show New / Edit form
export function InventoryModal({ open, mode = 'new', id = null, onClose, onSaved }) {
  const [internalOpen, setInternalOpen] = useState(open);

  useEffect(() => setInternalOpen(open), [open]);

  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (mode === 'edit' && id) {
        try {
          setLoading(true);
          const p = await inventoryApi.getProductById(id);
          if (mounted) {
            setCurrentProduct(
              p
                ? {
                    id: p.id,
                    name: p.name,
                    subDescription: p.short_description || '',
                    description: p.description || '',
                    images: p.images || [],
                    code: p.barcode || '',
                    sku: p.sku || '',
                    price: p.price || 0,
                    quantity: p.stock_quantity || 0,
                    priceSale: p.compare_at_price || 0,
                    category: p.category || '',
                    tags: p.dimensions?.tags || [],
                    gender: p.dimensions?.gender || [],
                    theme: p.dimensions?.theme || '',
                    colors: p.dimensions?.colors || [],
                    sizes: p.dimensions?.sizes || [],
                    newLabel: p.dimensions?.newLabel || { enabled: false, content: '' },
                    saleLabel: p.dimensions?.saleLabel || { enabled: false, content: '' },
                  }
                : null
            );
          }
        } catch (e) {
          console.error('Error loading product for modal', e);
        } finally {
          if (mounted) setLoading(false);
        }
      } else if (mounted) setCurrentProduct(null);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [mode, id]);

  const handleClose = () => {
    setInternalOpen(false);
    if (onClose) onClose();
  };

  const handleSaved = () => {
    // close and notify parent to refresh list
    setInternalOpen(false);
    if (onSaved) onSaved();
  };

  const renderTitle = () => {
    if (mode === 'edit') return 'Edit product';
    return 'New product';
  };

  return (
    <Dialog open={internalOpen} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{renderTitle()}</DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
            <CircularProgress />
          </Box>
        ) : (
          <InventoryNewEditForm currentProduct={currentProduct} onSaved={handleSaved} disabled={loading} />
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
