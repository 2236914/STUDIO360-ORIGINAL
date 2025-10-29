'use client';

import { m } from 'framer-motion';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import SvgIcon from '@mui/material/SvgIcon';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { varHover } from 'src/components/animate';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { NotificationItem } from './notifications-drawer/notification-item';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'all',
    label: 'All',
    count: 0,
  },
  {
    value: 'unread',
    label: 'Unread',
    count: 0,
  },
  {
    value: 'archived',
    label: 'Archived',
    count: 0,
  },
];

// Empty notifications data - will be populated from database
const MOCK_NOTIFICATIONS = [];

export function NotificationsPopover({ sx, ...other }) {
  const theme = useTheme();
  const popover = usePopover();

  const [currentTab, setCurrentTab] = useState('unread');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const totalUnRead = notifications.filter((item) => item.isUnRead === true).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, isUnRead: false })));
  };

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, px: 2, minHeight: 68 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Notifications
      </Typography>

      {!!totalUnRead && (
        <Tooltip title="Mark all as read">
          <IconButton color="primary" onClick={handleMarkAllAsRead}>
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}

      <IconButton>
        <Iconify icon="solar:settings-bold-duotone" />
      </IconButton>
    </Stack>
  );

  const renderTabs = (
    <CustomTabs variant="fullWidth" value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
              color={
                (tab.value === 'unread' && 'info') ||
                (tab.value === 'archived' && 'success') ||
                'default'
              }
            >
              {tab.count}
            </Label>
          }
        />
      ))}
    </CustomTabs>
  );

  const renderList = (
    <Scrollbar sx={{ height: 400 }}>
      <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
        {notifications?.map((notification) => (
          <Box component="li" key={notification.id} sx={{ display: 'flex' }}>
            <NotificationItem notification={notification} />
          </Box>
        ))}
      </Box>
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={sx}
        {...other}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <SvgIcon>
            {/* https://icon-sets.iconify.design/solar/bell-bing-bold-duotone/ */}
            <path
              fill="currentColor"
              d="M18.75 9v.704c0 .845.24 1.671.692 2.374l1.108 1.723c1.011 1.574.239 3.713-1.52 4.21a25.794 25.794 0 0 1-14.06 0c-1.759-.497-2.531-2.636-1.52-4.21l1.108-1.723a4.393 4.393 0 0 0 .693-2.374V9c0-3.866 3.022-7 6.749-7s6.75 3.134 6.75 7"
              opacity="0.5"
            />
            <path
              fill="currentColor"
              d="M12.75 6a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 1.5 0zM7.243 18.545a5.002 5.002 0 0 0 9.513 0c-3.145.59-6.367.59-9.513 0"
            />
          </SvgIcon>
        </Badge>
      </IconButton>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              ml: 0.75,
              width: 400,
              maxHeight: 600,
            },
          },
        }}
      >
        {renderHead}

        {renderTabs}

        {renderList}

        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button fullWidth size="large">
            View all
          </Button>
        </Box>
      </CustomPopover>
    </>
  );
} 