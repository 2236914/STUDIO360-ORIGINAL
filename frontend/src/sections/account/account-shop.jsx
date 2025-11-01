import { debounce } from 'lodash';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate, fTime } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { supabase } from 'src/auth/context/jwt/supabaseClient';
import { authService } from 'src/services/authService';

// ----------------------------------------------------------------------

// Helper function to check if user is authenticated using Supabase
async function isAuthenticated() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!error && !!session) return true;
    // Fallback to custom JWT stored in authService/localStorage
    try {
      if (authService.isAuthenticated()) return true;
    } catch (e) {
      // ignore
    }
    return false;
  } catch (error) {
    console.error('Authentication check error:', error);
    return false;
  }
}

// Helper function for authenticated requests using Supabase
async function authenticatedRequest(url, options = {}) {
  try {
    // Get the current session from Supabase
    let token = null;
    // Try Supabase session first (if app uses Supabase auth)
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.access_token) {
        token = session.access_token;
      }
    } catch (e) {
      console.warn('Supabase session check failed:', e);
    }

    // Fallback to local authService token (custom JWT) if no Supabase token
    try {
      if (!token) token = authService.getToken();
    } catch (e) {
      console.warn('authService token retrieval failed:', e);
    }

    console.log('Frontend: Making authenticated request to:', url, { hasToken: !!token });

    if (!token) {
      throw new Error('No authentication token available');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    console.log('Frontend: Making request to:', url);
    const response = await fetch(url, { ...options, ...defaultOptions });
    
    // If we get a 401/403, the token might be invalid
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication failed. Please log in again.');
    }

    return response;
  } catch (error) {
    console.error('Authenticated request error:', error);
    throw error;
  }
}

// API Service Functions
const shopApi = {
  async getCompleteShopData() {
    // Use relative URL in browser (Next.js proxy), absolute in SSR
    const shopUrl = typeof window !== 'undefined'
      ? '/api/shop/complete'
      : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/shop/complete`;
    const response = await authenticatedRequest(shopUrl);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateShopInfo(shopData) {
    const shopUrl = typeof window !== 'undefined'
      ? '/api/shop/info'
      : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/shop/info`;
    const response = await authenticatedRequest(shopUrl, {
      method: 'PUT',
      body: JSON.stringify(shopData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateShippingSettings(settingsData) {
    const shopUrl = typeof window !== 'undefined'
      ? '/api/shop/shipping'
      : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/shop/shipping`;
    const response = await authenticatedRequest(shopUrl, {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createCourier(courierData) {
    const shopUrl = typeof window !== 'undefined'
      ? '/api/shop/couriers'
      : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/shop/couriers`;
    const response = await authenticatedRequest(shopUrl, {
      method: 'POST',
      body: JSON.stringify(courierData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateCourier(courierId, updateData) {
    const shopUrl = typeof window !== 'undefined'
      ? `/api/shop/couriers/${courierId}`
      : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/shop/couriers/${courierId}`;
    const response = await authenticatedRequest(shopUrl, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteCourier(courierId) {
    const shopUrl = typeof window !== 'undefined'
      ? `/api/shop/couriers/${courierId}`
      : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/shop/couriers/${courierId}`;
    const response = await authenticatedRequest(shopUrl, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async updateRegionalRates(courierId, rates) {
    const shopUrl = typeof window !== 'undefined'
      ? `/api/shop/couriers/${courierId}/rates`
      : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/shop/couriers/${courierId}/rates`;
    const response = await authenticatedRequest(shopUrl, {
      method: 'PUT',
      body: JSON.stringify({ rates }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};

export function AccountShop() {
  // Available shipping regions
  const SHIPPING_REGIONS = [
    { key: 'Metro Manila', label: 'Metro Manila', description: 'National Capital Region' },
    { key: 'Luzon', label: 'Luzon', description: 'Outside Metro Manila' },
    { key: 'Visayas', label: 'Visayas', description: 'Central Philippines' },
    { key: 'Mindanao', label: 'Mindanao', description: 'Southern Philippines' },
    { key: 'Island Provinces', label: 'Island Provinces', description: 'Remote islands (Palawan, Batanes, etc.)' }
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

  const [shopData, setShopData] = useState({
    shopInfo: null,
    shippingSettings: null,
    couriers: []
  });
  const [selectedCourier, setSelectedCourier] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const courierDialog = useBoolean();
  const deleteCourierDialog = useBoolean();
  const editCourierDialog = useBoolean();
  const deleteShippingDialog = useBoolean();
  const editShippingDialog = useBoolean();
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  
  // Confirmation dialog state
  const confirmDialog = useBoolean();
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Shipping types state (currently unused - legacy from old implementation)
  const [shippingTypes, setShippingTypes] = useState([]);

  // Helper function to show confirmation dialog
  const showConfirmation = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    confirmDialog.onTrue();
  };

  // Helper function to execute confirmed action
  const handleConfirmAction = async () => {
    if (confirmAction) {
      try {
        await confirmAction();
        confirmDialog.onFalse();
      } catch (error) {
        console.error('Action failed:', error);
        // Don't close dialog on error, let user see the error
      }
    }
  };

  // Load shop data on component mount
  useEffect(() => {
    const loadShopData = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated (with timeout to avoid hanging)
        const authPromise = isAuthenticated();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Authentication check timeout')), 3000)
        );
        
        const isAuth = await Promise.race([authPromise, timeoutPromise]);
        
        if (!isAuth) {
          console.warn('User not authenticated. Please log in first.');
          toast.error('Please log in to access your account settings.');
          return;
        }
        
        const data = await shopApi.getCompleteShopData();
        console.log('Loaded shop data:', data);
        setShopData(data);
        setInitialLoad(false);
        
        // Set selected courier to first active courier
        const firstActiveCourier = data.couriers.find(courier => courier.is_active);
        if (firstActiveCourier) {
          setSelectedCourier(firstActiveCourier.name);
        }
      } catch (error) {
        console.error('Error loading shop data:', error);
        if (error.message === 'Authentication check timeout') {
          console.warn('Authentication check timed out, proceeding anyway...');
          // Continue loading data even if auth check times out
          try {
            const data = await shopApi.getCompleteShopData();
            setShopData(data);
            setInitialLoad(false);
            const firstActiveCourier = data.couriers.find(courier => courier.is_active);
            if (firstActiveCourier) {
              setSelectedCourier(firstActiveCourier.name);
            }
          } catch (dataError) {
            toast.error('Failed to load shop data. Please check your authentication.');
          }
        } else {
          toast.error('Failed to load shop data. Please check your authentication.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, []);

  // Shop Info Form
  const shopMethods = useForm({
    defaultValues: {
      shopName: '',
      email: '',
      phoneNumber: '',
      street: '',
      barangay: '',
      city: '',
      province: '',
      zipCode: '',
      profileImage: null,
      shopCategory: '',
      customCategory: '',
      freeShippingEnabled: false,
      freeShippingMinAmount: 0,
    },
    mode: 'onChange',
  });

  // Update form values when shop data loads
  useEffect(() => {
    if (shopData.shopInfo) {
      console.log('Populating form with shop data:', shopData.shopInfo);
      shopMethods.reset({
        shopName: shopData.shopInfo.shop_name || '',
        email: shopData.shopInfo.email || '',
        phoneNumber: shopData.shopInfo.phone_number || '',
        street: shopData.shopInfo.street_address || '',
        barangay: shopData.shopInfo.barangay || '',
        city: shopData.shopInfo.city || '',
        province: shopData.shopInfo.province || '',
        zipCode: shopData.shopInfo.zip_code || '',
        profileImage: shopData.shopInfo.profile_photo_url || null,
        shopCategory: shopData.shopInfo.shop_category || '',
        customCategory: '',
        freeShippingEnabled: shopData.shippingSettings?.enable_free_shipping || false,
        freeShippingMinAmount: shopData.shippingSettings?.minimum_order_amount || 0,
      });
    } else {
      console.log('No shop info found in data:', shopData);
    }
  }, [shopData, shopMethods]);

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
    // Show confirmation dialog
    showConfirmation(
      'Are you sure you want to save these changes to your shop information?',
      async () => {
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
          
          toast.loading('Saving shop information...');
          
          // Update shop info
          const shopInfoData = {
            shop_name: data.shopName,
            email: data.email,
            phone_number: data.phoneNumber,
            shop_category: data.shopCategory,
            profile_photo_url: data.profileImage,
            street_address: data.street,
            barangay: data.barangay,
            city: data.city,
            province: data.province,
            zip_code: data.zipCode,
          };

          // Update shipping settings
          const shippingSettingsData = {
            enable_free_shipping: data.freeShippingEnabled,
            minimum_order_amount: parseFloat(data.freeShippingMinAmount) || 0,
          };

          await Promise.all([
            shopApi.updateShopInfo(shopInfoData),
            shopApi.updateShippingSettings(shippingSettingsData)
          ]);
          
          // Reload shop data
          const updatedData = await shopApi.getCompleteShopData();
          setShopData(updatedData);
          
          toast.dismiss();
          toast.success('Shop information updated successfully!');
        } catch (error) {
          toast.dismiss();
          toast.error('Failed to update shop information');
          console.error('Save error:', error);
        }
      }
    );
  }, [showConfirmation]);

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
    const existingCourier = shopData.couriers.find(c => c.name.toLowerCase().trim() === courierName.toLowerCase().trim());
    if (existingCourier) {
      toast.error(`Courier "${courierName}" already exists`);
      return;
    }

    // Show confirmation dialog
    showConfirmation(
      `Are you sure you want to add "${courierName}" as a new courier?`,
      async () => {
        try {
          toast.loading('Adding courier...');
          
          const newCourier = await shopApi.createCourier({
            name: courierName.trim(),
            is_active: true
          });

          // Create default regional rates for the new courier
          const defaultRates = SHIPPING_REGIONS.map(region => ({
            region_name: region.key,
            region_description: region.description,
            price: 0,
            is_active: false
          }));

          await shopApi.updateRegionalRates(newCourier.id, defaultRates);
          
          // Reload shop data
          const updatedData = await shopApi.getCompleteShopData();
          setShopData(updatedData);
          
          courierMethods.reset();
          courierDialog.onFalse();
          
          toast.dismiss();
          toast.success('Courier added successfully! Please set shipping fees for each region.');
        } catch (error) {
          toast.dismiss();
          toast.error('Failed to add courier');
          console.error('Add courier error:', error);
        }
      }
    );
  }, [courierMethods, courierDialog, SHIPPING_REGIONS, shopData.couriers, showConfirmation]);

  // Debounced update function for shipping fees
  const debouncedUpdateRegionFees = useCallback(
    debounce(async (courierId, regionKey, fee, active) => {
      try {
        // Handle empty string as 0
        const numericFee = fee === '' ? 0 : parseFloat(fee) || 0;
        
        // Validate fee amount
        if (numericFee > 10000) {
          toast.error('Shipping fee cannot exceed ₱10,000');
          return;
        }
        
        // Find the courier and its current rates
        const courier = shopData.couriers.find(c => c.id === courierId);
        if (!courier) return;

        // Update the specific rate
        const updatedRates = courier.rates.map(rate => {
          if (rate.region_name === regionKey) {
            return {
              ...rate,
              price: numericFee,
              is_active: active
            };
          }
          return rate;
        });

        // Update rates in the database
        await shopApi.updateRegionalRates(courierId, updatedRates);
        
        // Reload shop data
        const updatedData = await shopApi.getCompleteShopData();
        setShopData(updatedData);
      
        // Only show success message for significant updates
        if (numericFee > 0) {
          toast.success('Shipping fee updated successfully!');
        }
      } catch (error) {
        toast.error('Failed to update shipping fee');
        console.error('Update region fee error:', error);
      }
    }, 500), // Reduced to 500ms for better responsiveness
    [shopData.couriers]
  );

  const handleUpdateRegionFees = useCallback((courierId, regionKey, fee, active) => {
    // Immediately update the local state for instant UI feedback
    setShopData(prevData => ({
      ...prevData,
      couriers: prevData.couriers.map(courier => {
        if (courier.id === courierId) {
          return {
            ...courier,
            rates: courier.rates.map(rate => {
              if (rate.region_name === regionKey) {
                return {
                  ...rate,
                  price: fee === '' ? 0 : parseFloat(fee) || 0,
                  is_active: active
                };
              }
              return rate;
            })
          };
        }
        return courier;
      })
    }));

    // Then call the debounced function for API update
    debouncedUpdateRegionFees(courierId, regionKey, fee, active);
  }, [debouncedUpdateRegionFees]);

  const handleToggleRegion = useCallback(async (courierId, regionKey) => {
    // Find the courier and its current rates
    const courier = shopData.couriers.find(c => c.id === courierId);
    if (!courier) return;

    const currentRate = courier.rates.find(r => r.region_name === regionKey);
    if (!currentRate) return;
      
    // Validate that fee is set before activating
    if (!currentRate.is_active && (!currentRate.price || currentRate.price <= 0)) {
      toast.error('Please set a shipping fee before activating this region');
      return;
    }
      
    const newActiveStatus = !currentRate.is_active;
    
    // IMMEDIATE UI UPDATE - Update the state instantly
    setShopData(prevData => ({
      ...prevData,
      couriers: prevData.couriers.map(c => {
        if (c.id === courierId) {
          return {
            ...c,
            rates: c.rates.map(rate => {
              if (rate.region_name === regionKey) {
                return {
                  ...rate,
                  is_active: newActiveStatus
                };
              }
              return rate;
            })
          };
        }
        return c;
      })
    }));

    // Show immediate feedback
    toast.success('Region availability updated!');

    // Then update the database in the background
    try {
      const updatedRates = courier.rates.map(rate => {
        if (rate.region_name === regionKey) {
          return {
            ...rate,
            is_active: newActiveStatus
          };
        }
        return rate;
      });

      await shopApi.updateRegionalRates(courierId, updatedRates);
    } catch (error) {
      // If API call fails, revert the UI change
      setShopData(prevData => ({
        ...prevData,
        couriers: prevData.couriers.map(c => {
          if (c.id === courierId) {
            return {
              ...c,
              rates: c.rates.map(rate => {
                if (rate.region_name === regionKey) {
                  return {
                    ...rate,
                    is_active: !newActiveStatus // Revert to original status
                  };
                }
                return rate;
              })
            };
          }
          return c;
        })
      }));
      
      toast.error('Failed to update region availability');
      console.error('Toggle region error:', error);
    }
  }, [shopData.couriers]);

  const handleToggleCourier = useCallback(async (courierId) => {
    const courier = shopData.couriers.find(c => c.id === courierId);
    if (!courier) return;

    const newStatus = !courier.is_active;

    // IMMEDIATE UI UPDATE - Update the state instantly
    setShopData(prevData => ({
      ...prevData,
      couriers: prevData.couriers.map(c => {
        if (c.id === courierId) {
          return {
            ...c,
            is_active: newStatus
          };
        }
        return c;
      })
    }));

    // If the currently selected courier is deactivated, switch to the first active courier
    if (courier.name === selectedCourier && !newStatus) {
      const remainingActiveCourier = shopData.couriers.find(c => c.id !== courierId && c.is_active);
      if (remainingActiveCourier) {
        setSelectedCourier(remainingActiveCourier.name);
      } else {
        setSelectedCourier('');
      }
    }

    // Show immediate feedback
    toast.success('Courier status updated!');

    // Then update the database in the background
    try {
      await shopApi.updateCourier(courierId, { is_active: newStatus });
    } catch (error) {
      // If API call fails, revert the UI change
      setShopData(prevData => ({
        ...prevData,
        couriers: prevData.couriers.map(c => {
          if (c.id === courierId) {
            return {
              ...c,
              is_active: !newStatus // Revert to original status
            };
          }
          return c;
        })
      }));
      
      toast.error('Failed to update courier status');
      console.error('Toggle courier error:', error);
    }
  }, [selectedCourier, shopData.couriers]);

  const handleDeleteCourier = useCallback((courierId) => {
    const courier = shopData.couriers.find(c => c.id === courierId);
    if (!courier) {
      toast.error('Courier not found');
      return;
    }
    
    // Check if any regions are active for this courier
    const hasActiveRegions = courier.rates?.some(rate => rate.is_active);
    if (hasActiveRegions) {
      const activeRegionCount = courier.rates?.filter(rate => rate.is_active).length || 0;
      toast.error(`Cannot delete ${courier.name}. Please disable all ${activeRegionCount} active region${activeRegionCount > 1 ? 's' : ''} first.`);
      return;
    }
    
    // Prevent deletion if this is the only courier
    if (shopData.couriers.length <= 1) {
      toast.error('Cannot delete the last courier. At least one courier is required.');
      return;
    }
    
    setItemToDelete({ type: 'courier', id: courierId, name: courier.name });
    deleteCourierDialog.onTrue();
  }, [shopData.couriers, deleteCourierDialog]);

  const confirmDeleteCourier = useCallback(async () => {
    if (itemToDelete && itemToDelete.type === 'courier') {
      try {
        const courier = shopData.couriers.find(c => c.id === itemToDelete.id);
        
        toast.loading('Deleting courier...');
        
        await shopApi.deleteCourier(itemToDelete.id);
      
        // If the deleted courier was selected, switch to another active courier
        if (courier && courier.name === selectedCourier) {
          const remainingActiveCourier = shopData.couriers.find(c => c.id !== itemToDelete.id && c.is_active);
          if (remainingActiveCourier) {
            setSelectedCourier(remainingActiveCourier.name);
          } else {
            setSelectedCourier('');
          }
        }
        
        // Reload shop data
        const updatedData = await shopApi.getCompleteShopData();
        setShopData(updatedData);
      
        deleteCourierDialog.onFalse();
        setItemToDelete(null);
        
        toast.dismiss();
        toast.success('Courier deleted successfully!');
      } catch (error) {
        toast.dismiss();
        toast.error('Failed to delete courier');
        console.error('Delete courier error:', error);
      }
    }
  }, [itemToDelete, shopData.couriers, selectedCourier, deleteCourierDialog]);

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
    if (itemToEdit) {
      // Show confirmation dialog
      showConfirmation(
        `Are you sure you want to update "${itemToEdit.name}" to "${data.name}"?`,
        async () => {
          try {
            toast.loading('Updating courier...');
            
            await shopApi.updateCourier(itemToEdit.id, { name: data.name });
              
            // Update selected courier if it was the edited one
            if (selectedCourier === itemToEdit.name) {
              setSelectedCourier(data.name);
            }
            
            // Reload shop data
            const updatedData = await shopApi.getCompleteShopData();
            setShopData(updatedData);
            
            editCourierDialog.onFalse();
            setItemToEdit(null);
            
            toast.dismiss();
            toast.success('Courier updated successfully!');
          } catch (error) {
            toast.dismiss();
            toast.error('Failed to update courier');
            console.error('Update courier error:', error);
          }
        }
      );
    }
  }, [itemToEdit, editCourierDialog, selectedCourier, showConfirmation]);

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
    const activeCouriers = shopData.couriers.filter(c => c.is_active);
    const totalActiveRegions = activeCouriers.reduce((total, courier) => total + (courier.rates?.filter(r => r.is_active).length || 0), 0);
    
    return {
      activeCouriers: activeCouriers.length,
      totalActiveRegions,
      hasShippingOptions: totalActiveRegions > 0,
      freeShippingEnabled: shopMethods.watch('freeShippingEnabled'),
    };
  }, [shopData.couriers, shopMethods]);

  // Only show loading if we're actually loading and don't have any data yet
  if ((loading || initialLoad) && !shopData.shopInfo) {
    return (
      <Stack spacing={3}>
        {/* Shop Info Card Skeleton */}
        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Skeleton variant="text" width="30%" height={32} />
              <Skeleton variant="rectangular" width="100%" height={200} />
            </Stack>
          </Box>
        </Card>

        {/* Shipping Settings Card Skeleton */}
        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Skeleton variant="text" width="25%" height={32} />
              <Skeleton variant="rectangular" width="100%" height={150} />
            </Stack>
          </Box>
        </Card>
      </Stack>
    );
  }

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
                      allowUrl
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
                      <Field.Text 
                        name="shopName" 
                        label="Shop Name" 
                        rules={{ required: 'Shop name is required' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field.Text 
                        name="email" 
                        label="Email" 
                        type="email"
                        rules={{ 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field.Text 
                        name="phoneNumber" 
                        label="Phone Number" 
                        placeholder="+63" 
                        rules={{ required: 'Phone number is required' }}
                      />
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
                        rules={{ required: 'Shop category is required' }}
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
                          rules={{ required: 'Custom category is required' }}
                        />
                      </Grid>
                    )}
                  </Grid>

                  <Divider />

                  <Typography variant="subtitle2">Address</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field.Text 
                        name="street" 
                        label="Street Address" 
                        rules={{ required: 'Street address is required' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field.Text 
                        name="barangay" 
                        label="Barangay" 
                        rules={{ required: 'Barangay is required' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field.Text 
                        name="city" 
                        label="City" 
                        rules={{ required: 'City is required' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field.Text 
                        name="province" 
                        label="Province" 
                        rules={{ required: 'Province is required' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field.Text 
                        name="zipCode" 
                        label="Zip Code" 
                        rules={{ required: 'Zip code is required' }}
                      />
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

                         {shopData.couriers.map((courier) => (
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
                         bgcolor: courier.is_active ? 'success.main' : 'grey.400',
                       }}
                     />
                     <Stack>
                       <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                         {courier.name}
                       </Typography>
                       <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                         Last updated: {fDate(courier.last_updated)} at {fTime(courier.last_updated)}
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
                       color={courier.is_active ? 'warning' : 'success'}
                       onClick={() => handleToggleCourier(courier.id)}
                     >
                       <Iconify icon={courier.is_active ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
                     </IconButton>
                     <IconButton
                       size="small"
                       color="error"
                       onClick={() => handleDeleteCourier(courier.id)}
                       disabled={courier.rates?.some(r => r.is_active)}
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
            {shopData.couriers.filter(courier => courier.is_active).length > 0 && (
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={selectedCourier}
                  onChange={(event, newValue) => setSelectedCourier(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ minHeight: 40 }}
                >
                  {shopData.couriers.filter(courier => courier.is_active).map((courier) => {
                    const activeRegions = courier.rates?.filter(r => r.is_active).length || 0;
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
                  const courier = shopData.couriers.find(c => c.name === selectedCourier);
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
                        const regionData = courier.rates?.find(r => r.region_name === region.key) || { price: 0, is_active: false };
                        return (
                           <Card
                            key={region.key}
                            variant="outlined"
                             sx={{
                              p: 2.5,
                              borderColor: regionData.is_active ? 'primary.main' : 'divider',
                              borderWidth: regionData.is_active ? 2 : 1,
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
                                    bgcolor: regionData.is_active ? 'success.main' : 'grey.400',
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
                                  value={regionData.price?.toString() || ''}
                                  onChange={(e) => 
                                    handleUpdateRegionFees(courier.id, region.key, e.target.value, regionData.is_active)
                                  }
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">₱</InputAdornment>
                                    ),
                                  }}
                                  helperText={regionData.price > 0 && regionData.is_active ? 'Active' : regionData.price > 0 ? 'Click to activate' : 'Enter fee amount'}
                                />
                                 
                                   <IconButton
                                     size="small"
                                  color={regionData.is_active ? 'warning' : 'success'}
                                  onClick={() => handleToggleRegion(courier.id, region.key)}
                                  disabled={!regionData.price || regionData.price <= 0}
                                >
                                  <Iconify icon={regionData.is_active ? 'solar:eye-closed-bold' : 'solar:eye-bold'} />
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

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialog.value}
          onClose={confirmDialog.onFalse}
          title="Confirm Action"
          content={confirmMessage}
          action={
            <Button variant="contained" color="error" onClick={handleConfirmAction}>
              Confirm
            </Button>
          }
        />

      </Stack>
    );
  }
