import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';

import { useBoolean } from 'src/hooks/use-boolean';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { fDate, fTime } from 'src/utils/format-time';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

// ----------------------------------------------------------------------

export function AccountShop() {
  // Available shipping regions
  const SHIPPING_REGIONS = [
    { key: 'metro-manila', label: 'Metro Manila', description: 'National Capital Region' },
    { key: 'luzon', label: 'Luzon', description: 'Outside Metro Manila' },
    { key: 'visayas', label: 'Visayas', description: 'Central Philippines' },
    { key: 'mindanao', label: 'Mindanao', description: 'Southern Philippines' },
    { key: 'islands', label: 'Island Provinces', description: 'Remote islands (Palawan, Batanes, etc.)' }
  ];

  // Popular courier options
  const POPULAR_COURIERS = [
    'JNT Express',
    'SPX',
    'LBC',
    'Ninja Van',
    '2GO',
    'Grab Express',
    'Lalamove'
  ];

  const [couriers, setCouriers] = useState([
    { 
      id: '1', 
      name: 'JNT Express', 
      active: true, 
      status: 'active',
      lastUpdated: '2024-01-15T10:30:00Z',
      regions: {
        'metro-manila': { fee: 120.00, active: true },
        'luzon': { fee: 150.00, active: true },
        'visayas': { fee: 180.00, active: false },
        'mindanao': { fee: 200.00, active: false },
        'islands': { fee: 250.00, active: false }
      }
    },
    { 
      id: '2', 
      name: 'SPX', 
      active: true, 
      status: 'active',
      lastUpdated: '2024-01-14T15:45:00Z',
      regions: {
        'metro-manila': { fee: 130.00, active: true },
        'luzon': { fee: 160.00, active: true },
        'visayas': { fee: 190.00, active: true },
        'mindanao': { fee: 210.00, active: true },
        'islands': { fee: 280.00, active: false }
      }
    },
    { 
      id: '3', 
      name: 'LBC', 
      active: false, 
      status: 'inactive',
      lastUpdated: '2024-01-10T09:15:00Z',
      regions: {
        'metro-manila': { fee: 140.00, active: false },
        'luzon': { fee: 170.00, active: false },
        'visayas': { fee: 200.00, active: false },
        'mindanao': { fee: 230.00, active: false },
        'islands': { fee: 300.00, active: false }
      }
    },
  ]);

  const [selectedCourier, setSelectedCourier] = useState('JNT Express');

  const courierDialog = useBoolean();
  const deleteCourierDialog = useBoolean();
  const editCourierDialog = useBoolean();
  const deleteShippingDialog = useBoolean();
  const editShippingDialog = useBoolean();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  
  // Shipping types state (currently unused - legacy from old implementation)
  const [shippingTypes, setShippingTypes] = useState([]);

  // Set initial selected courier when component mounts
  useEffect(() => {
    const firstActiveCourier = couriers.find(courier => courier.active);
    if (firstActiveCourier) {
      setSelectedCourier(firstActiveCourier.name);
    }
  }, [couriers]);

  // Shop Info Form
  const shopMethods = useForm({
    defaultValues: {
      shopName: 'Kitsch Studio',
      email: 'hello@kitschstudio.com',
      phoneNumber: '+63 912 345 6789',
      street: '123 Rizal Street',
      barangay: 'Poblacion',
      city: 'Quezon City',
      province: 'Metro Manila',
      zipCode: '1100',
      profileImage: null,
      shopCategory: '',
      customCategory: '',
      freeShippingEnabled: true,
      freeShippingMinAmount: 2000,
    },
  });

  // Courier Form
  const courierMethods = useForm({
    defaultValues: {
      name: '',
      isCustom: false,
    },
  });

  // Edit Courier Form
  const editCourierMethods = useForm({
    defaultValues: {
      name: '',
    },
  });

  // Edit Shipping Type Form (legacy - currently unused)
  const editShippingMethods = useForm({
    defaultValues: {
      name: '',
      courier: '',
      fee: 0,
    },
  });

  const handleSaveShopInfo = useCallback(async (data) => {
    try {
      // Validate free shipping settings
      if (data.freeShippingEnabled) {
        const minAmount = parseFloat(data.freeShippingMinAmount);
        
        if (isNaN(minAmount) || minAmount < 0) {
          toast.error('Please enter a valid minimum amount for free shipping');
          return;
        }
        
        if (minAmount > 100000) {
          toast.error('Free shipping minimum amount cannot exceed ₱100,000');
          return;
        }
        
        if (minAmount < 100) {
          toast.error('Free shipping minimum amount should be at least ₱100');
          return;
        }
      }
      
      // Save shipping configuration
      const shippingConfig = {
        freeShippingEnabled: data.freeShippingEnabled,
        freeShippingMinAmount: parseFloat(data.freeShippingMinAmount) || 0,
        couriers: couriers
      };
      
      // Import and save the shipping config
      const { saveSellerShippingConfig } = await import('src/services/shippingConfigService');
      const storeId = 'kitschstudio'; // In real app, this would come from user context
      saveSellerShippingConfig(storeId, shippingConfig);
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Shop information updated successfully!');
      console.info('Shop Data:', data);
    } catch (error) {
      toast.error('Failed to update shop information');
      console.error('Save error:', error);
    }
  }, [couriers]);

  // Helper function to save couriers configuration
  const saveCouriersConfig = useCallback(async (updatedCouriers) => {
    try {
      const { saveSellerShippingConfig } = await import('src/services/shippingConfigService');
      const storeId = 'kitschstudio'; // In real app, this would come from user context
      
      const currentConfig = shopMethods.getValues();
      const shippingConfig = {
        freeShippingEnabled: currentConfig.freeShippingEnabled,
        freeShippingMinAmount: parseFloat(currentConfig.freeShippingMinAmount) || 0,
        couriers: updatedCouriers
      };
      
      saveSellerShippingConfig(storeId, shippingConfig);
    } catch (error) {
      console.error('Error saving couriers config:', error);
    }
  }, [shopMethods]);

  const handleAddCourier = useCallback(async (data) => {
    try {
      // Initialize all regions as inactive with default fees
      const defaultRegions = {};
      SHIPPING_REGIONS.forEach(region => {
        defaultRegions[region.key] = { fee: 0, active: false };
      });

      // Use custom name if 'custom' was selected
      const courierName = data.name === 'custom' ? data.customName : data.name;

      if (!courierName || courierName.trim().length === 0) {
        toast.error('Please enter a courier name');
        return;
      }

      // Validate courier name length
      if (courierName.trim().length < 2) {
        toast.error('Courier name must be at least 2 characters long');
        return;
      }

      if (courierName.trim().length > 50) {
        toast.error('Courier name cannot exceed 50 characters');
        return;
      }

      // Check if courier already exists (case-insensitive)
      const existingCourier = couriers.find(c => c.name.toLowerCase().trim() === courierName.toLowerCase().trim());
      if (existingCourier) {
        toast.error(`Courier "${courierName}" already exists`);
        return;
      }

      const newCourier = {
        id: Date.now().toString(),
        name: courierName.trim(),
        active: true,
        status: 'active',
        lastUpdated: new Date().toISOString(),
        regions: defaultRegions,
      };
      
      setCouriers((prev) => {
        const updated = [...prev, newCourier];
        // Save the updated couriers configuration
        saveCouriersConfig(updated);
        return updated;
      });
      courierMethods.reset();
      courierDialog.onFalse();
      toast.success('Courier added successfully! Please set shipping fees for each region.');
    } catch (error) {
      toast.error('Failed to add courier');
    }
  }, [courierMethods, courierDialog, SHIPPING_REGIONS, couriers]);

  const handleUpdateRegionFees = useCallback((courierId, regionKey, fee, active) => {
    // Handle empty string as 0, allow during typing
    const numericFee = fee === '' ? 0 : parseFloat(fee) || 0;
    
    // Only validate on blur or when user stops typing, not during input
    // For now, just prevent extremely high values during typing
    if (numericFee > 10000) {
      toast.error('Shipping fee cannot exceed ₱10,000');
      return;
    }
    
    setCouriers((prev) => prev.map((courier) => {
      if (courier.id === courierId) {
        return {
          ...courier,
          regions: {
            ...courier.regions,
            [regionKey]: {
              fee: numericFee,
              active: active
            }
          },
          lastUpdated: new Date().toISOString(),
        };
      }
      return courier;
    }));
    
    // Only show success message for significant updates (not every keystroke)
    if (numericFee > 0) {
      toast.success('Shipping fee updated successfully!');
    }
  }, []);

  const handleToggleRegion = useCallback((courierId, regionKey) => {
    setCouriers((prev) => prev.map((courier) => {
      if (courier.id === courierId) {
        const currentRegion = courier.regions[regionKey];
        
        // Validate that fee is set before activating
        if (!currentRegion.active && (!currentRegion.fee || currentRegion.fee <= 0)) {
          toast.error('Please set a shipping fee before activating this region');
          return courier;
        }
        
        const newActiveStatus = !currentRegion.active;
        
        return {
          ...courier,
          regions: {
            ...courier.regions,
            [regionKey]: {
              ...currentRegion,
              active: newActiveStatus
            }
          },
          lastUpdated: new Date().toISOString(),
        };
      }
      return courier;
    }));
    
    toast.success('Region availability updated!');
  }, []);

  const handleToggleCourier = useCallback((courierId) => {
    setCouriers((prev) => {
      const updatedCouriers = prev.map((courier) => {
        if (courier.id === courierId) {
          const newStatus = !courier.active;
          return { 
            ...courier, 
            active: newStatus, 
            status: newStatus ? 'active' : 'inactive',
            lastUpdated: new Date().toISOString()
          };
        }
        return courier;
      });
      
      // If the currently selected courier is deactivated, switch to the first active courier
      const deactivatedCourier = prev.find(c => c.id === courierId);
      if (deactivatedCourier && deactivatedCourier.name === selectedCourier) {
        const firstActiveCourier = updatedCouriers.find(c => c.active);
        if (firstActiveCourier) {
          setSelectedCourier(firstActiveCourier.name);
        } else {
          setSelectedCourier('');
        }
      }
      
      return updatedCouriers;
    });
    toast.success('Courier status updated!');
  }, [selectedCourier]);

  const handleDeleteCourier = useCallback((courierId) => {
    const courier = couriers.find(c => c.id === courierId);
    if (!courier) {
      toast.error('Courier not found');
      return;
    }
    
    // Check if any regions are active for this courier
    const hasActiveRegions = Object.values(courier.regions).some(region => region.active);
    if (hasActiveRegions) {
      const activeRegionCount = Object.values(courier.regions).filter(region => region.active).length;
      toast.error(`Cannot delete ${courier.name}. Please disable all ${activeRegionCount} active region${activeRegionCount > 1 ? 's' : ''} first.`);
      return;
    }
    
    // Prevent deletion if this is the only courier
    if (couriers.length <= 1) {
      toast.error('Cannot delete the last courier. At least one courier is required.');
      return;
    }
    
    setItemToDelete({ type: 'courier', id: courierId, name: courier.name });
    deleteCourierDialog.onTrue();
  }, [couriers, deleteCourierDialog]);

  const confirmDeleteCourier = useCallback(() => {
    if (itemToDelete && itemToDelete.type === 'courier') {
      const courier = couriers.find(c => c.id === itemToDelete.id);
      setCouriers((prev) => prev.filter(c => c.id !== itemToDelete.id));
      
      // If the deleted courier was selected, switch to another active courier
      if (courier && courier.name === selectedCourier) {
        const remainingActiveCourier = couriers.find(c => c.id !== itemToDelete.id && c.active);
        if (remainingActiveCourier) {
          setSelectedCourier(remainingActiveCourier.name);
        } else {
          setSelectedCourier('');
        }
      }
      
      deleteCourierDialog.onFalse();
      setItemToDelete(null);
      toast.success('Courier deleted successfully!');
    }
  }, [itemToDelete, couriers, selectedCourier, deleteCourierDialog]);

  const handleToggleShipping = useCallback((shippingId) => {
    setShippingTypes((prev) => {
      const updatedShipping = prev.map((shipping) =>
        shipping.id === shippingId ? { ...shipping, active: !shipping.active } : shipping
      );
      
      // Update courier stats based on active shipping types
      const shipping = prev.find(s => s.id === shippingId);
      if (shipping) {
        setCouriers((prevCouriers) => prevCouriers.map((courier) => {
          if (courier.name === shipping.courier) {
            const activeShippingTypes = updatedShipping.filter(s => s.courier === courier.name && s.active);
            const totalFees = activeShippingTypes.reduce((sum, s) => sum + s.fee, 0);
            return {
              ...courier,
              shippingTypes: activeShippingTypes.length,
              totalFees,
              lastUpdated: new Date().toISOString(),
            };
          }
          return courier;
        }));
      }
      
      // Save the updated couriers configuration
      saveCouriersConfig(updatedShipping);
      
      return updatedShipping;
    });
    toast.success('Shipping type status updated!');
  }, []);

  const handleDeleteShippingType = useCallback((shippingId) => {
    const shipping = shippingTypes.find(s => s.id === shippingId);
    if (shipping) {
      setItemToDelete({ type: 'shipping', id: shippingId, name: shipping.name, courier: shipping.courier });
      deleteShippingDialog.onTrue();
    }
  }, [shippingTypes, deleteShippingDialog]);

  const confirmDeleteShippingType = useCallback(() => {
    if (itemToDelete && itemToDelete.type === 'shipping') {
      const shipping = shippingTypes.find(s => s.id === itemToDelete.id);
      if (shipping) {
        setShippingTypes((prev) => prev.filter(s => s.id !== itemToDelete.id));
        
        // Update courier stats
        setCouriers((prevCouriers) => prevCouriers.map((courier) => {
          if (courier.name === shipping.courier) {
            const remainingShippingTypes = shippingTypes.filter(s => s.id !== itemToDelete.id && s.courier === courier.name);
            const activeShippingTypes = remainingShippingTypes.filter(s => s.active);
            const totalFees = activeShippingTypes.reduce((sum, s) => sum + s.fee, 0);
            return {
              ...courier,
              shippingTypes: activeShippingTypes.length,
              totalFees,
              lastUpdated: new Date().toISOString(),
            };
          }
          return courier;
        }));
        
        deleteShippingDialog.onFalse();
        setItemToDelete(null);
        toast.success('Shipping type deleted successfully!');
      }
    }
  }, [itemToDelete, shippingTypes, deleteShippingDialog]);

  const handleEditCourier = useCallback((courier) => {
    setItemToEdit(courier);
    editCourierMethods.reset({ name: courier.name });
    editCourierDialog.onTrue();
  }, [editCourierMethods, editCourierDialog]);

  const handleEditShippingType = useCallback((shipping) => {
    setItemToEdit(shipping);
    editShippingMethods.reset({ 
      name: shipping.name, 
      courier: shipping.courier, 
      fee: shipping.fee 
    });
    editShippingDialog.onTrue();
  }, [editShippingMethods, editShippingDialog]);

  const handleUpdateCourier = useCallback(async (data) => {
    try {
      if (itemToEdit) {
        setCouriers((prev) => prev.map((courier) => 
          courier.id === itemToEdit.id 
            ? { ...courier, name: data.name, lastUpdated: new Date().toISOString() }
            : courier
        ));
        
        // Update shipping types with new courier name
        if (data.name !== itemToEdit.name) {
          setShippingTypes((prev) => prev.map((shipping) =>
            shipping.courier === itemToEdit.name
              ? { ...shipping, courier: data.name }
              : shipping
          ));
          
          // Update selected courier if it was the edited one
          if (selectedCourier === itemToEdit.name) {
            setSelectedCourier(data.name);
          }
        }
        
        editCourierDialog.onFalse();
        setItemToEdit(null);
        toast.success('Courier updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update courier');
    }
  }, [itemToEdit, editCourierDialog, selectedCourier]);

  const handleUpdateShippingType = useCallback(async (data) => {
    try {
      if (itemToEdit) {
        const oldCourier = itemToEdit.courier;
        const newCourier = data.courier;
        const oldFee = itemToEdit.fee;
        const newFee = parseFloat(data.fee);
        
        setShippingTypes((prev) => prev.map((shipping) =>
          shipping.id === itemToEdit.id
            ? { ...shipping, name: data.name, courier: newCourier, fee: newFee }
            : shipping
        ));
        
        // Update courier stats
        setCouriers((prevCouriers) => prevCouriers.map((courier) => {
          if (courier.name === oldCourier || courier.name === newCourier) {
            const relevantShippingTypes = shippingTypes.map(s => 
              s.id === itemToEdit.id 
                ? { ...s, name: data.name, courier: newCourier, fee: newFee }
                : s
            ).filter(s => s.courier === courier.name && s.active);
            
            const totalFees = relevantShippingTypes.reduce((sum, s) => sum + s.fee, 0);
            
            return {
              ...courier,
              shippingTypes: relevantShippingTypes.length,
              totalFees,
              lastUpdated: new Date().toISOString(),
            };
          }
          return courier;
        }));
        
        editShippingDialog.onFalse();
        setItemToEdit(null);
        toast.success('Shipping type updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update shipping type');
    }
  }, [itemToEdit, editShippingDialog, shippingTypes]);

  // Helper function to get shipping configuration summary
  const getShippingConfigSummary = useCallback(() => {
    const activeCouriers = couriers.filter(c => c.active);
    const totalActiveRegions = activeCouriers.reduce((total, courier) => {
      return total + Object.values(courier.regions).filter(r => r.active).length;
    }, 0);
    
    return {
      activeCouriers: activeCouriers.length,
      totalActiveRegions,
      hasShippingOptions: totalActiveRegions > 0,
      freeShippingEnabled: shopMethods.watch('freeShippingEnabled'),
    };
  }, [couriers, shopMethods]);

  return (
    <Stack spacing={3}>

      {/* Shop Info Card */}
      <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 'none' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Shop Information
          </Typography>

          <Form methods={shopMethods} onSubmit={shopMethods.handleSubmit(handleSaveShopInfo)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Stack spacing={3} alignItems="center">
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                      Shop Profile Photo
                    </Typography>
                    <Field.UploadAvatar
                      name="profileImage"
                      maxSize={3145728}
                      helperText={
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 3,
                            mx: 'auto',
                            display: 'block',
                            textAlign: 'center',
                            color: 'text.disabled',
                          }}
                        >
                          Allowed *.jpeg, *.jpg, *.png, *.gif
                          <br /> Max size of 3MB
                        </Typography>
                      }
                    />
                  </Stack>

                </Stack>
              </Grid>

              <Grid item xs={12} md={8}>
                <Stack spacing={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Field.Text name="shopName" label="Shop Name" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field.Text name="email" label="Email" />
                    </Grid>
                    <Grid item xs={12}>
                      <Field.Text name="phoneNumber" label="Phone Number" placeholder="+63" />
                    </Grid>
                  </Grid>

                  <Divider />

                  <Typography variant="subtitle2">Shop Category</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Field.Select
                        name="shopCategory"
                        label="Select Category"
                        placeholder="Choose a category"
                      >
                        <MenuItem value="">Choose a category</MenuItem>
                        <MenuItem value="fashion">Fashion & Apparel</MenuItem>
                        <MenuItem value="electronics">Electronics & Gadgets</MenuItem>
                        <MenuItem value="home">Home & Living</MenuItem>
                        <MenuItem value="beauty">Beauty & Personal Care</MenuItem>
                        <MenuItem value="sports">Sports & Outdoors</MenuItem>
                        <MenuItem value="books">Books & Media</MenuItem>
                        <MenuItem value="toys">Toys & Games</MenuItem>
                        <MenuItem value="food">Food & Beverages</MenuItem>
                        <MenuItem value="health">Health & Wellness</MenuItem>
                        <MenuItem value="automotive">Automotive</MenuItem>
                        <MenuItem value="jewelry">Jewelry & Accessories</MenuItem>
                        <MenuItem value="custom">Other (Custom Category)</MenuItem>
                      </Field.Select>
                    </Grid>
                    {shopMethods.watch('shopCategory') === 'custom' && (
                      <Grid item xs={12} sm={6}>
                        <Field.Text
                          name="customCategory"
                          label="Custom Category"
                          placeholder="Enter your shop category"
                          helperText="Describe what type of products you sell"
                        />
                      </Grid>
                    )}
                  </Grid>

                  <Divider />

                  <Typography variant="subtitle2">Address</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field.Text name="street" label="Street Address" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field.Text name="barangay" label="Barangay" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field.Text name="city" label="City" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field.Text name="province" label="Province" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field.Text name="zipCode" label="Zip Code" />
                    </Grid>
                  </Grid>


                  <Stack direction="row" justifyContent="flex-end">
                    <Button type="submit" variant="contained" size="large">
                      Save Changes
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Form>
        </Box>
      </Card>



      {/* Shipping Info Card */}
      <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 'none' }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6">Shipping Information</Typography>
            {(() => {
              const summary = getShippingConfigSummary();
              if (!summary.hasShippingOptions && !summary.freeShippingEnabled) {
                return (
                  <Chip 
                    icon={<Iconify icon="eva:alert-triangle-fill" width={16} />}
                    label="No shipping configured" 
                    color="warning" 
                    size="small"
                    variant="soft"
                  />
                );
              }
              if (summary.hasShippingOptions || summary.freeShippingEnabled) {
                return (
                  <Chip 
                    icon={<Iconify icon="eva:checkmark-circle-2-fill" width={16} />}
                    label={`${summary.totalActiveRegions} regions configured`}
                    color="success" 
                    size="small"
                    variant="soft"
                  />
                );
              }
              return null;
            })()}
          </Stack>

          {/* Free Shipping Configuration */}
          <Form methods={shopMethods}>
            <Card variant="outlined" sx={{ p: 3, mb: 3, boxShadow: 'none' }}>
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Iconify icon="eva:gift-outline" width={20} sx={{ color: 'text.primary' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Free Shipping Option
                  </Typography>
                </Stack>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Field.Switch
                      name="freeShippingEnabled"
                      label="Enable Free Shipping"
                      helperText="Offer free shipping when minimum amount is reached"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="freeShippingMinAmount"
                      label="Minimum Order Amount (₱)"
                      type="number"
                      placeholder="2000"
                      inputProps={{ step: '0.01', min: '0' }}
                      helperText="Orders above this amount get free shipping"
                      disabled={!shopMethods.watch('freeShippingEnabled')}
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Iconify icon="eva:info-outline" width={16} sx={{ color: 'text.secondary', mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Free shipping works regardless of customer location. When enabled, customers who reach the minimum order amount will see a "Free Shipping" option alongside your regular courier options.
                    </Typography>
                  </Stack>
                </Box>
                
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    onClick={shopMethods.handleSubmit(handleSaveShopInfo)}
                    variant="outlined"
                    size="small"
                  >
                    Save Free Shipping Settings
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Form>

          {/* Couriers Section */}
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1">Couriers</Typography>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={courierDialog.onTrue}
                size="small"
              >
                Add Courier
              </Button>
            </Stack>

                         {couriers.map((courier) => (
               <Card
                 key={courier.id}
                 variant="outlined"
                 sx={{
                   p: 2,
                   borderRadius: 1,
                   boxShadow: 'none',
                 }}
               >
                 <Stack direction="row" alignItems="center" justifyContent="space-between">
                   <Stack direction="row" alignItems="center" spacing={2}>
                     <Box
                       sx={{
                         width: 8,
                         height: 8,
                         borderRadius: '50%',
                         bgcolor: courier.active ? 'success.main' : 'grey.400',
                       }}
                     />
                     <Stack>
                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                         {courier.name}
                       </Typography>
                       <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                         Last updated: {fDate(courier.lastUpdated)} at {fTime(courier.lastUpdated)}
                       </Typography>
                     </Stack>
                   </Stack>
                   
                   <Stack direction="row" spacing={1}>
                     <IconButton
                       size="small"
                       onClick={() => handleEditCourier(courier)}
                     >
                       <Iconify icon="solar:pen-bold" />
                     </IconButton>
                     <IconButton
                       size="small"
                       color={courier.active ? 'warning' : 'success'}
                       onClick={() => handleToggleCourier(courier.id)}
                     >
                       <Iconify icon={courier.active ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                     </IconButton>
                     <IconButton
                       size="small"
                       color="error"
                       onClick={() => handleDeleteCourier(courier.id)}
                       disabled={Object.values(courier.regions).some(r => r.active)}
                     >
                       <Iconify icon="solar:trash-bin-trash-bold" />
                     </IconButton>
                   </Stack>
                 </Stack>
               </Card>
             ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Regional Shipping Configuration */}
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1">Regional Shipping Rates</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Configure flat rates for each region
              </Typography>
            </Stack>

            {/* Courier Tabs */}
            {couriers.filter(courier => courier.active).length > 0 && (
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={selectedCourier}
                  onChange={(event, newValue) => setSelectedCourier(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ minHeight: 40 }}
                >
                  {couriers.filter(courier => courier.active).map((courier) => {
                    const activeRegions = Object.values(courier.regions).filter(r => r.active).length;
                    return (
                      <Tab
                        key={courier.id}
                        value={courier.name}
                        label={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <span>{courier.name}</span>
                            {activeRegions > 0 && (
                              <Box
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  bgcolor: 'success.main',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  minWidth: 20,
                                  textAlign: 'center',
                                }}
                              >
                                {activeRegions} regions
                              </Box>
                            )}
                          </Stack>
                        }
                        sx={{ minHeight: 40, py: 1 }}
                      />
                    );
                  })}
                </Tabs>
              </Box>
            )}

            {/* Region-based Shipping Fees by Selected Courier */}
            {selectedCourier && (
              <Box sx={{ mt: 2 }}>
                {(() => {
                  const courier = couriers.find(c => c.name === selectedCourier);
                  if (!courier) return null;
                  
                  return (
                    <Stack spacing={2}>
                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon="eva:globe-2-outline" width={16} sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Set shipping fees for each region that {selectedCourier} delivers to
                    </Typography>
                  </Stack>
                </Box>

                      {SHIPPING_REGIONS.map((region) => {
                        const regionData = courier.regions[region.key];
                        return (
                           <Card
                            key={region.key}
                            variant="outlined"
                             sx={{
                              p: 2.5,
                              borderColor: regionData.active ? 'primary.main' : 'divider',
                              borderWidth: regionData.active ? 2 : 1,
                              boxShadow: 'none',
                             }}
                           >
                             <Stack direction="row" alignItems="center" justifyContent="space-between">
                               <Stack direction="row" alignItems="center" spacing={2}>
                                 <Box
                                   sx={{
                                    width: 8,
                                    height: 8,
                                     borderRadius: '50%',
                                    bgcolor: regionData.active ? 'success.main' : 'grey.400',
                                   }}
                                 />
                                 <Stack>
                                   <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {region.label}
                                   </Typography>
                                   <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {region.description}
                                   </Typography>
                                 </Stack>
                               </Stack>
                               
                               <Stack direction="row" alignItems="center" spacing={2}>
                                <TextField
                                  type="number"
                                  placeholder="0.00"
                                  size="small"
                                  inputProps={{ 
                                    step: '0.01',
                                    min: '0',
                                    max: '10000'
                                  }}
                                  sx={{ width: '120px' }}
                                  value={regionData.fee?.toString() || ''}
                                  onChange={(e) => 
                                    handleUpdateRegionFees(courier.id, region.key, e.target.value, regionData.active)
                                  }
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">₱</InputAdornment>
                                    ),
                                  }}
                                  helperText={regionData.fee > 0 && regionData.active ? 'Active' : regionData.fee > 0 ? 'Click to activate' : 'Enter fee amount'}
                                />
                                 
                                   <IconButton
                                     size="small"
                                  color={regionData.active ? 'warning' : 'success'}
                                  onClick={() => handleToggleRegion(courier.id, region.key)}
                                  disabled={!regionData.fee || regionData.fee <= 0}
                                >
                                  <Iconify icon={regionData.active ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                                   </IconButton>
                               </Stack>
                             </Stack>
                           </Card>
                        );
                      })}
                  </Stack>
                  );
                })()}
              </Box>
            )}
          </Stack>
        </Box>
      </Card>

      {/* Add Courier Dialog */}
      <Dialog 
        open={courierDialog.value} 
        onClose={courierDialog.onFalse} 
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiSelect-root': {
            '& .MuiPaper-root': {
              zIndex: '1600 !important',
            },
          },
          '& .MuiPopover-root': {
            zIndex: '1600 !important',
          },
          '& .MuiMenu-root': {
            zIndex: '1600 !important',
          },
        }}
      >
        <DialogTitle>Add New Courier</DialogTitle>
        <Form methods={courierMethods} onSubmit={courierMethods.handleSubmit(handleAddCourier)}>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Field.Select
                name="name"
                label="Select Courier"
                placeholder="Choose a courier"
                autoFocus
              >
                <MenuItem value="">Choose a courier</MenuItem>
                {POPULAR_COURIERS.map((courier) => (
                  <MenuItem key={courier} value={courier}>
                    {courier}
                  </MenuItem>
                ))}
                <MenuItem value="custom">Other (Custom Name)</MenuItem>
              </Field.Select>
              
              {courierMethods.watch('name') === 'custom' && (
               <Field.Text
                  name="customName"
                  label="Custom Courier Name"
                  placeholder="Enter courier name"
                  helperText="Enter the name of your preferred courier service"
                />
              )}

              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Iconify icon="eva:info-outline" width={16} sx={{ color: 'text.secondary', mt: 0.25 }} />
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      After adding the courier, you'll be able to set shipping fees for each region (Metro Manila, Luzon, Visayas, Mindanao, Islands).
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      Available options: {POPULAR_COURIERS.length} popular couriers + custom option
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
             </Stack>
           </DialogContent>
           <DialogActions>
            <Button onClick={courierDialog.onFalse}>Cancel</Button>
             <Button type="submit" variant="contained">
              Add Courier
             </Button>
           </DialogActions>
         </Form>
       </Dialog>


       {/* Delete Courier Confirmation Dialog */}
       <Dialog open={deleteCourierDialog.value} onClose={deleteCourierDialog.onFalse} maxWidth="sm" fullWidth>
         <DialogTitle>Delete Courier</DialogTitle>
         <DialogContent>
           <Typography sx={{ mt: 1 }}>
             Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
           </Typography>
           {itemToDelete?.type === 'courier' && (
             <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2, p: 1.5, border: '1px solid', borderColor: 'warning.main', borderRadius: 1 }}>
               <Iconify icon="eva:alert-triangle-outline" width={16} sx={{ color: 'warning.main' }} />
               <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                 This action cannot be undone. The courier will be permanently removed.
               </Typography>
             </Stack>
           )}
         </DialogContent>
         <DialogActions>
           <Button onClick={deleteCourierDialog.onFalse}>Cancel</Button>
           <Button onClick={confirmDeleteCourier} color="error" variant="contained">
             Delete
           </Button>
         </DialogActions>
       </Dialog>


        {/* Edit Courier Dialog */}
        <Dialog open={editCourierDialog.value} onClose={editCourierDialog.onFalse} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Courier</DialogTitle>
          <Form methods={editCourierMethods} onSubmit={editCourierMethods.handleSubmit(handleUpdateCourier)}>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Field.Text
                  name="name"
                  label="Courier Name"
                  placeholder="e.g., JNT Express, SPX, LBC"
                  autoFocus
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={editCourierDialog.onFalse}>Cancel</Button>
              <Button type="submit" variant="contained">
                Update Courier
              </Button>
            </DialogActions>
          </Form>
        </Dialog>

      </Stack>
    );
  }
