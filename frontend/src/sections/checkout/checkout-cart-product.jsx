import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fCurrencyPHPSymbol } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ColorPreview } from 'src/components/color-utils';

import { IncrementerButton } from '../product/components/incrementer-button';

// ----------------------------------------------------------------------

export function CheckoutCartProduct({ row, onDelete, onDecrease, onIncrease, onUpdateVariant }) {
  const [editAnchor, setEditAnchor] = useState(null);
  
  const handleEditClick = (event) => {
    setEditAnchor(event.currentTarget);
  };
  
  const handleEditClose = () => {
    setEditAnchor(null);
  };
  
  const handleSizeChange = (newSize) => {
    if (onUpdateVariant) {
      onUpdateVariant(row.id, { size: newSize });
    }
    handleEditClose();
  };
  
  const handleColorChange = (newColor) => {
    if (onUpdateVariant) {
      onUpdateVariant(row.id, { colors: [newColor] });
    }
    handleEditClose();
  };
  
  const isEditOpen = Boolean(editAnchor);
  
  // Available sizes and colors (in real app, this would come from product data)
  const availableSizes = ['7', '8', '9', '10', '11'];
  const availableColors = ['#8E44AD', '#3498DB', '#F39C12', '#E74C3C', '#27AE60', '#F1C40F', '#2C3E50'];
  return (
    <TableRow>
      <TableCell>
        <Stack spacing={2} direction="row" alignItems="center">
          <Avatar
            variant="rounded"
            alt={row.name}
            src={row.coverUrl}
            sx={{ width: 64, height: 64 }}
          />

          <Stack spacing={0.5}>
            <Typography 
              noWrap 
              variant="subtitle2" 
              sx={{ 
                maxWidth: { xs: 160, sm: 240 },
                fontSize: { xs: '0.875rem', sm: '0.875rem' }
              }}
            >
              {row.name}
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              sx={{ typography: 'body2', color: 'text.secondary' }}
            >
              size: 
              <Button
                variant="text"
                size="small"
                onClick={handleEditClick}
                sx={{ 
                  ml: 0.5, 
                  minWidth: 'auto',
                  p: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Label> {row.size} </Label>
                <Iconify icon="eva:edit-2-outline" width={12} sx={{ ml: 0.5 }} />
              </Button>
              <Box component="span" sx={{ mx: 1, color: 'text.disabled' }}>•</Box>
              <Button
                variant="text"
                size="small"
                onClick={handleEditClick}
                sx={{ 
                  minWidth: 'auto',
                  p: 0.5,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ColorPreview colors={row.colors} />
                <Iconify icon="eva:edit-2-outline" width={12} sx={{ ml: 0.5 }} />
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell>{fCurrencyPHPSymbol(row.price, '₱')}</TableCell>

      <TableCell>
        <Box sx={{ width: { xs: 80, sm: 88 }, textAlign: 'right' }}>
          <IncrementerButton
            quantity={row.quantity}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            disabledDecrease={row.quantity <= 1}
            disabledIncrease={row.quantity >= row.available}
          />

          <Typography 
            variant="caption" 
            component="div" 
            sx={{ 
              color: 'text.secondary', 
              mt: 1,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              display: { xs: 'none', sm: 'block' }
            }}
          >
            available: {row.available}
          </Typography>
        </Box>
      </TableCell>

      <TableCell 
        align="right"
        sx={{
          typography: { xs: 'body2', sm: 'body1' },
          fontWeight: { xs: 600, sm: 'normal' }
        }}
      >
        {fCurrencyPHPSymbol(row.price * row.quantity, '₱')}
      </TableCell>

      <TableCell align="right" sx={{ px: { xs: 0.5, sm: 1 } }}>
        <IconButton 
          onClick={onDelete}
          size="small"
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
        </IconButton>
      </TableCell>
      
      {/* Edit Popover */}
      <Popover
        open={isEditOpen}
        anchorEl={editAnchor}
        onClose={handleEditClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 3, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Edit Product Options
          </Typography>
          
          {/* Size Selection */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
              Size:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {availableSizes.map((size) => (
                <Button
                  key={size}
                  size="small"
                  variant={row.size === size ? "contained" : "outlined"}
                  onClick={() => handleSizeChange(size)}
                  sx={{ minWidth: 36, height: 36 }}
                >
                  {size}
                </Button>
              ))}
            </Stack>
          </Box>
          
          {/* Color Selection */}
          <Box>
            <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
              Color:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {availableColors.map((color) => (
                <Box
                  key={color}
                  onClick={() => handleColorChange(color)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: color,
                    cursor: 'pointer',
                    border: row.colors.includes(color) ? '3px solid' : '1px solid',
                    borderColor: row.colors.includes(color) ? 'primary.main' : 'divider',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: 2
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      </Popover>
    </TableRow>
  );
}