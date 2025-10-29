import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import { toast } from 'src/components/snackbar';
import { Form } from 'src/components/hook-form';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const NOTIFICATIONS = [
  {
    subheader: 'Order Notifications',
    caption: 'Get notified about your orders and their status updates',
    items: [
      { id: 'order_confirmation', label: 'Order confirmations' },
      { id: 'order_status_updates', label: 'Order status updates' },
    ],
  },
  {
    subheader: 'Business Alerts',
    caption: 'Stay informed about your business activity',
    items: [
      { id: 'new_order_alerts', label: 'New order alerts (when you receive orders)' },
      { id: 'low_stock_alerts', label: 'Low stock alerts' },
      { id: 'product_updates', label: 'Product updates' },
    ],
  },
  {
    subheader: 'Updates & Marketing',
    caption: 'News, updates, and promotional emails',
    items: [
      { id: 'weekly_summary', label: 'Weekly business summary' },
      { id: 'marketing_emails', label: 'Marketing emails and promotions' },
    ],
  },
];

// ----------------------------------------------------------------------

export function AccountNotifications() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const methods = useForm({
    defaultValues: {
      order_confirmation: true,
      order_status_updates: true,
      new_order_alerts: true,
      low_stock_alerts: true,
      product_updates: true,
      marketing_emails: false,
      weekly_summary: true,
    },
  });

  const {
    watch,
    control,
    handleSubmit,
    reset,
  } = methods;

  const values = watch();

  // Fetch current preferences
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${CONFIG.site.serverUrl}/api/notifications/preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        // Map database fields to form fields
        const formData = {
          order_confirmation: data.data.order_confirmation !== false,
          order_status_updates: data.data.order_status_updates !== false,
          new_order_alerts: data.data.new_order_alerts !== false,
          low_stock_alerts: data.data.low_stock_alerts !== false,
          product_updates: data.data.product_updates !== false,
          marketing_emails: data.data.marketing_emails !== false,
          weekly_summary: data.data.weekly_summary !== false,
        };
        reset(formData);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load email preferences');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      
      // Map form fields to database fields
      const preferences = {
        order_confirmation: data.order_confirmation,
        order_status_updates: data.order_status_updates,
        new_order_alerts: data.new_order_alerts,
        low_stock_alerts: data.low_stock_alerts,
        product_updates: data.product_updates,
        marketing_emails: data.marketing_emails,
        weekly_summary: data.weekly_summary,
      };

      const response = await fetch(`${CONFIG.site.serverUrl}/api/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Email preferences updated successfully!');
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update email preferences');
    } finally {
      setSaving(false);
    }
  });

  const getSelected = (selectedItems, item) =>
    selectedItems.includes(item)
      ? selectedItems.filter((value) => value !== item)
      : [...selectedItems, item];

  if (loading) {
    return (
      <Card sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography>Loading preferences...</Typography>
      </Card>
    );
  }

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
        {NOTIFICATIONS.map((notification) => (
          <Grid key={notification.subheader} container spacing={3}>
            <Grid xs={12} md={4}>
              <ListItemText
                primary={notification.subheader}
                secondary={notification.caption}
                primaryTypographyProps={{ typography: 'h6', mb: 0.5 }}
                secondaryTypographyProps={{ component: 'span' }}
              />
            </Grid>

            <Grid xs={12} md={8}>
              <Stack spacing={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.neutral' }}>
                {notification.items.map((item) => (
                  <FormControlLabel
                    key={item.id}
                    label={item.label}
                    labelPlacement="start"
                    control={
                      <Controller
                        name={item.id}
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        )}
                      />
                    }
                    sx={{ m: 0, width: 1, justifyContent: 'space-between' }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        ))}

        <Divider sx={{ my: 2 }} />

        <LoadingButton 
          type="submit" 
          variant="contained" 
          loading={saving} 
          sx={{ ml: 'auto' }}
        >
          Save Email Preferences
        </LoadingButton>
      </Card>
    </Form>
  );
}
