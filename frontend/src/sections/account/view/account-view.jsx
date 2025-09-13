'use client';

import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AccountShop } from '../account-shop';
import { AccountCustomerSupport } from '../account-customer-support';
import { AccountHistory } from '../account-history';
import { AccountSettings } from '../account-settings';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'shop',
    label: 'Shop',
    icon: <Iconify icon="solar:shop-bold" width={24} />,
  },
  {
    value: 'customer-support',
    label: 'Customer Support',
    icon: <Iconify icon="solar:headphones-round-sound-bold" width={24} />,
  },
  {
    value: 'history',
    label: 'Account History',
    icon: <Iconify icon="solar:history-bold" width={24} />,
  },
  {
    value: 'settings',
    label: 'Settings',
    icon: <Iconify icon="solar:settings-bold" width={24} />,
  },
];

// ----------------------------------------------------------------------

export function AccountView() {
  const [currentTab, setCurrentTab] = useState('shop');

  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Account"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'User', href: paths.dashboard.user.root },
          { name: 'Account' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card sx={{ borderRadius: 0, boxShadow: 'none', border: 'none' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.vars.palette.divider}`,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              iconPosition="start"
              value={tab.value}
              label={tab.label}
              icon={tab.icon}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {currentTab === 'shop' && <AccountShop />}
          {currentTab === 'customer-support' && <AccountCustomerSupport />}
          {currentTab === 'history' && <AccountHistory />}
          {currentTab === 'settings' && <AccountSettings />}
        </Box>
      </Card>
    </DashboardContent>
  );
}
