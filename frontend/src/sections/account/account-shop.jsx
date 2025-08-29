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

// ----------------------------------------------------------------------

export function AccountShop() {
  const [couriers, setCouriers] = useState([
    { 
      id: '1', 
      name: 'JNT Express', 
      active: true, 
      status: 'active',
      lastUpdated: '2024-01-15T10:30:00Z',
      shippingTypes: 2,
      totalFees: 270.00
    },
    { 
      id: '2', 
      name: 'SPX', 
      active: true, 
      status: 'active',
      lastUpdated: '2024-01-14T15:45:00Z',
      shippingTypes: 2,
      totalFees: 380.00
    },
    { 
      id: '3', 
      name: 'LBC', 
      active: false, 
      status: 'inactive',
      lastUpdated: '2024-01-10T09:15:00Z',
      shippingTypes: 0,
      totalFees: 0.00
    },
  ]);

  const [shippingTypes, setShippingTypes] = useState([
    { id: '1', name: 'Metro Manila', courier: 'JNT Express', fee: 120.00, active: true },
    { id: '2', name: 'Luzon (Outside Metro Manila)', courier: 'JNT Express', fee: 150.00, active: true },
    { id: '3', name: 'Visayas', courier: 'SPX', fee: 180.00, active: true },
    { id: '4', name: 'Mindanao', courier: 'SPX', fee: 200.00, active: false },
  ]);

  const [selectedCourier, setSelectedCourier] = useState('JNT Express');

  const courierDialog = useBoolean();
  const shippingDialog = useBoolean();
  const deleteCourierDialog = useBoolean();
  const deleteShippingDialog = useBoolean();
  const editCourierDialog = useBoolean();
  const editShippingDialog = useBoolean();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);

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
      about: 'Premium fashion and lifestyle products with exceptional quality and customer service.',
      profileImage: null,
    },
  });

  // Courier Form
  const courierMethods = useForm({
    defaultValues: {
      name: '',
    },
  });

  // Shipping Type Form
  const shippingMethods = useForm({
    defaultValues: {
      name: '',
      courier: '',
      fee: 0,
    },
  });

  // Edit Courier Form
  const editCourierMethods = useForm({
    defaultValues: {
      name: '',
    },
  });

  // Edit Shipping Type Form
  const editShippingMethods = useForm({
    defaultValues: {
      name: '',
      courier: '',
      fee: 0,
    },
  });

  const handleSaveShopInfo = useCallback(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Shop information updated successfully!');
      console.info('Shop Data:', data);
    } catch (error) {
      toast.error('Failed to update shop information');
    }
  }, []);

  const handleAddCourier = useCallback(async (data) => {
    try {
      const newCourier = {
        id: Date.now().toString(),
        name: data.name,
        active: true,
        status: 'active',
        lastUpdated: new Date().toISOString(),
        shippingTypes: 0,
        totalFees: 0.00,
      };
      setCouriers((prev) => [...prev, newCourier]);
      courierMethods.reset();
      courierDialog.onFalse();
      toast.success('Courier added successfully!');
    } catch (error) {
      toast.error('Failed to add courier');
    }
  }, [courierMethods, courierDialog]);

  const handleAddShippingType = useCallback(async (data) => {
    try {
      const newShipping = {
        id: Date.now().toString(),
        name: data.name,
        courier: data.courier,
        fee: parseFloat(data.fee),
        active: true,
      };
      setShippingTypes((prev) => [...prev, newShipping]);
      
      // Update courier stats
      setCouriers((prev) => prev.map((courier) => {
        if (courier.name === data.courier) {
          return {
            ...courier,
            shippingTypes: courier.shippingTypes + 1,
            totalFees: courier.totalFees + parseFloat(data.fee),
            lastUpdated: new Date().toISOString(),
          };
        }
        return courier;
      }));
      
      shippingMethods.reset();
      shippingDialog.onFalse();
      toast.success('Shipping type added successfully!');
    } catch (error) {
      toast.error('Failed to add shipping type');
    }
  }, [shippingMethods, shippingDialog]);

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
    if (courier && courier.shippingTypes > 0) {
      toast.error(`Cannot delete ${courier.name}. Remove all shipping types first.`);
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

  return (
    <Stack spacing={3}>
      {/* Shop Info Card */}
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Shop Information
          </Typography>

          <Form methods={shopMethods} onSubmit={shopMethods.handleSubmit(handleSaveShopInfo)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Stack spacing={3} alignItems="center">
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

                  <Field.Text name="about" label="About" multiline rows={4} />

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
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6">Shipping Information</Typography>
          </Stack>

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
                 sx={{
                   p: 2,
                   border: '1px solid',
                   borderColor: 'divider',
                   borderRadius: 1,
                   bgcolor: 'background.paper',
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
                       disabled={courier.shippingTypes > 0}
                     >
                       <Iconify icon="solar:trash-bin-trash-bold" />
                     </IconButton>
                   </Stack>
                 </Stack>
               </Card>
             ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Shipping Types Section */}
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1">Shipping Types & Fees</Typography>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => {
                  shippingMethods.reset();
                  if (selectedCourier) {
                    shippingMethods.setValue('courier', selectedCourier);
                  }
                  shippingDialog.onTrue();
                }}
                size="small"
              >
                Add Shipping Type
              </Button>
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
                    const shippingCount = shippingTypes.filter(st => st.courier === courier.name).length;
                    return (
                      <Tab
                        key={courier.id}
                        value={courier.name}
                        label={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <span>{courier.name}</span>
                            {shippingCount > 0 && (
                              <Box
                                sx={{
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  minWidth: 20,
                                  textAlign: 'center',
                                }}
                              >
                                {shippingCount}
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

            {/* Shipping Types by Selected Courier */}
            {selectedCourier && (
              <Box sx={{ mt: 2 }}>
                {shippingTypes.filter(shipping => shipping.courier === selectedCourier).length === 0 ? (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      No shipping types configured for {selectedCourier}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mingcute:add-line" />}
                      onClick={() => {
                        shippingMethods.setValue('courier', selectedCourier);
                        shippingDialog.onTrue();
                      }}
                    >
                      Add First Shipping Type
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                                           {shippingTypes
                         .filter(shipping => shipping.courier === selectedCourier)
                         .map((shipping) => (
                           <Card
                             key={shipping.id}
                             sx={{
                               p: 2,
                               border: '1px solid',
                               borderColor: 'divider',
                               borderRadius: 1,
                               bgcolor: 'background.paper',
                               boxShadow: 'none',
                             }}
                           >
                             <Stack direction="row" alignItems="center" justifyContent="space-between">
                               <Stack direction="row" alignItems="center" spacing={2}>
                                 <Box
                                   sx={{
                                     width: 6,
                                     height: 6,
                                     borderRadius: '50%',
                                     bgcolor: shipping.active ? 'success.main' : 'grey.400',
                                   }}
                                 />
                                 <Stack>
                                   <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                     {shipping.name}
                                   </Typography>
                                   <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                     via {shipping.courier}
                                   </Typography>
                                 </Stack>
                               </Stack>
                               
                               <Stack direction="row" alignItems="center" spacing={2}>
                                 <Typography variant="h6">
                                   ₱{shipping.fee.toFixed(2)}
                                 </Typography>
                                 
                                 <Stack direction="row" spacing={1}>
                                   <IconButton
                                     size="small"
                                     onClick={() => handleEditShippingType(shipping)}
                                   >
                                     <Iconify icon="solar:pen-bold" />
                                   </IconButton>
                                   <IconButton
                                     size="small"
                                     color={shipping.active ? 'warning' : 'success'}
                                     onClick={() => handleToggleShipping(shipping.id)}
                                   >
                                     <Iconify icon={shipping.active ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                                   </IconButton>
                                   <IconButton
                                     size="small"
                                     color="error"
                                     onClick={() => handleDeleteShippingType(shipping.id)}
                                   >
                                     <Iconify icon="solar:trash-bin-trash-bold" />
                                   </IconButton>
                                 </Stack>
                               </Stack>
                             </Stack>
                           </Card>
                         ))}
                  </Stack>
                )}
              </Box>
            )}
          </Stack>
        </Box>
      </Card>

      {/* Add Courier Dialog */}
      <Dialog open={courierDialog.value} onClose={courierDialog.onFalse} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Courier</DialogTitle>
        <Form methods={courierMethods} onSubmit={courierMethods.handleSubmit(handleAddCourier)}>
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
            <Button onClick={courierDialog.onFalse}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add Courier
            </Button>
          </DialogActions>
        </Form>
      </Dialog>

             {/* Add Shipping Type Dialog */}
       <Dialog open={shippingDialog.value} onClose={shippingDialog.onFalse} maxWidth="sm" fullWidth>
         <DialogTitle>Add Shipping Type</DialogTitle>
         <Form methods={shippingMethods} onSubmit={shippingMethods.handleSubmit(handleAddShippingType)}>
           <DialogContent>
             <Stack spacing={3} sx={{ mt: 1 }}>
               <Field.Text
                 name="name"
                 label="Location/Area Name"
                 placeholder="e.g., Metro Manila, Luzon, Visayas"
                 autoFocus
               />
               <Field.Select name="courier" label="Courier" native>
                 <option value="">Select Courier</option>
                 {couriers.filter(courier => courier.active).map((courier) => (
                   <option key={courier.id} value={courier.name}>
                     {courier.name}
                   </option>
                 ))}
               </Field.Select>
               <Field.Text
                 name="fee"
                 label="Shipping Fee (₱)"
                 type="number"
                 placeholder="0.00"
                 inputProps={{ step: '0.01', min: '0' }}
               />
             </Stack>
           </DialogContent>
           <DialogActions>
             <Button onClick={shippingDialog.onFalse}>Cancel</Button>
             <Button type="submit" variant="contained">
               Add Shipping Type
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
             <Typography variant="body2" sx={{ color: 'warning.main', mt: 2 }}>
               ⚠️ This action cannot be undone. The courier will be permanently removed.
             </Typography>
           )}
         </DialogContent>
         <DialogActions>
           <Button onClick={deleteCourierDialog.onFalse}>Cancel</Button>
           <Button onClick={confirmDeleteCourier} color="error" variant="contained">
             Delete
           </Button>
         </DialogActions>
       </Dialog>

               {/* Delete Shipping Type Confirmation Dialog */}
        <Dialog open={deleteShippingDialog.value} onClose={deleteShippingDialog.onFalse} maxWidth="sm" fullWidth>
          <DialogTitle>Delete Shipping Type</DialogTitle>
          <DialogContent>
            <Typography sx={{ mt: 1 }}>
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong> from {itemToDelete?.courier}?
            </Typography>
            <Typography variant="body2" sx={{ color: 'warning.main', mt: 2 }}>
              ⚠️ This action cannot be undone. The shipping type will be permanently removed.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={deleteShippingDialog.onFalse}>Cancel</Button>
            <Button onClick={confirmDeleteShippingType} color="error" variant="contained">
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

        {/* Edit Shipping Type Dialog */}
        <Dialog open={editShippingDialog.value} onClose={editShippingDialog.onFalse} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Shipping Type</DialogTitle>
          <Form methods={editShippingMethods} onSubmit={editShippingMethods.handleSubmit(handleUpdateShippingType)}>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Field.Text
                  name="name"
                  label="Location/Area Name"
                  placeholder="e.g., Metro Manila, Luzon, Visayas"
                  autoFocus
                />
                <Field.Select name="courier" label="Courier" native>
                  <option value="">Select Courier</option>
                  {couriers.filter(courier => courier.active).map((courier) => (
                    <option key={courier.id} value={courier.name}>
                      {courier.name}
                    </option>
                  ))}
                </Field.Select>
                <Field.Text
                  name="fee"
                  label="Shipping Fee (₱)"
                  type="number"
                  placeholder="0.00"
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={editShippingDialog.onFalse}>Cancel</Button>
              <Button type="submit" variant="contained">
                Update Shipping Type
              </Button>
            </DialogActions>
          </Form>
        </Dialog>
      </Stack>
    );
  }
