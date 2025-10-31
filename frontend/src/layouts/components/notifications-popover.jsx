'use client';

import { m } from 'framer-motion';
import { useEffect, useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import SvgIcon from '@mui/material/SvgIcon';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { varHover } from 'src/components/animate';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { NotificationItem } from './notifications-drawer/notification-item';
import announcementsApi from 'src/services/announcements';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'new', label: 'New', count: 0 },
  { value: 'expired', label: 'Expired', count: 0 },
  { value: 'read', label: 'Read', count: 0 },
];

const TYPE_ICONS = {
  info: 'eva:info-fill',
  warning: 'eva:alert-triangle-fill',
  maintenance: 'eva:settings-fill',
  security: 'eva:shield-fill',
};

export function NotificationsPopover({ sx, ...other }) {
  const theme = useTheme();
  const popover = usePopover();
  const { user } = useAuthContext();

  const [currentTab, setCurrentTab] = useState('new');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const [announcements, setAnnouncements] = useState([]);
  const [readIds, setReadIds] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        // Seller can see all past announcements
        const all = await announcementsApi.listAllAnnouncementsForUsers();
        if (!active) return;
        setAnnouncements(Array.isArray(all) ? all : []);
      } catch (e) {
        setAnnouncements([]);
      }
    }
    if (user?.role === 'seller') {
      load();
    } else {
      setAnnouncements([]);
    }
    return () => {
      active = false;
    };
  }, [user?.role]);

  // Load read ids from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('announcements_read') || '[]');
      setReadIds(Array.isArray(stored) ? stored : []);
    } catch (_) {
      setReadIds([]);
    }
  }, []);

  const nowIso = useMemo(() => new Date().toISOString(), []);
  const { newItems, expiredItems, readItems } = useMemo(() => {
    const readSet = new Set(readIds);
    const expired = [];
    const fresh = [];
    const read = [];
    for (const a of announcements) {
      const isExpired = (a.expires_at && a.expires_at < nowIso) || a.is_active === false;
      const isRead = readSet.has(a.id);
      if (isRead) {
        read.push(a);
      } else if (isExpired) {
        expired.push(a);
      } else {
        fresh.push(a);
      }
    }
    return { newItems: fresh, expiredItems: expired, readItems: read };
  }, [announcements, readIds, nowIso]);

  const totalUnRead = newItems.length;

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
      <Tab
        key="new"
        iconPosition="end"
        value="new"
        label="New"
        icon={
          <Label variant={(currentTab === 'new' && 'filled') || 'soft'} color="info">
            {newItems.length}
          </Label>
        }
      />
      <Tab
        key="expired"
        iconPosition="end"
        value="expired"
        label="Expired"
        icon={
          <Label variant={(currentTab === 'expired' && 'filled') || 'soft'} color="warning">
            {expiredItems.length}
          </Label>
        }
      />
      <Tab
        key="read"
        iconPosition="end"
        value="read"
        label="Read"
        icon={
          <Label variant={(currentTab === 'read' && 'filled') || 'soft'} color="success">
            {readItems.length}
          </Label>
        }
      />
    </CustomTabs>
  );

  const listToRender = currentTab === 'new' ? newItems : currentTab === 'expired' ? expiredItems : readItems;
  const renderList = (
    <Scrollbar sx={{ height: 400 }}>
      <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
        {listToRender?.map((a) => (
          <Box
            component="li"
            key={a.id}
            sx={{ display: 'flex' }}
            onClick={() => {
              // mark as read when opened
              try {
                const stored = JSON.parse(localStorage.getItem('announcements_read') || '[]');
                const set = new Set(Array.isArray(stored) ? stored : []);
                set.add(a.id);
                const next = Array.from(set);
                localStorage.setItem('announcements_read', JSON.stringify(next));
                setReadIds(next);
              } catch (_) {}
              setSelected(a);
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, width: 1, cursor: 'pointer' }}>
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                <Iconify icon={TYPE_ICONS[a.type] || TYPE_ICONS.info} width={24} />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {a.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                  {a.message}
                </Typography>
              </Box>
              <Box sx={{ ml: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {new Date(a.created_at || a.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
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
      </CustomPopover>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Iconify icon={TYPE_ICONS[selected?.type] || 'eva:megaphone-fill'} width={24} height={24} />
            <Typography variant="h6">{selected?.title}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity={(selected && selected.type) ? (selected.type === 'security' ? 'error' : (selected.type === 'warning' || selected.type === 'maintenance') ? 'warning' : 'info') : 'info'} sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {selected?.message}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)} variant="contained" fullWidth>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 