'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { LogoutDialog } from 'src/components/logout-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { useAuthContext } from 'src/auth/hooks';

import { AccountButton } from './account-button';

// ----------------------------------------------------------------------

export function AccountPopover({ sx, ...other }) {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const popover = usePopover();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleClickItem = useCallback(
    (path) => {
      popover.onClose();
      router.push(path);
    },
    [popover, router]
  );

  const handleLogoutClick = useCallback(() => {
    popover.onClose();
    setLogoutDialogOpen(true);
  }, [popover]);

  const handleLogoutConfirm = async () => {
    await logout();
  };

  return (
    <>
      <AccountButton
        open={popover.open}
        onClick={popover.onOpen}
        photoURL={user?.photoURL}
        displayName={user?.displayName}
        sx={sx}
        {...other}
      />

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              ml: 0.75,
              width: 280,
              p: 0,
            },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* User Info */}
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {user?.role === 'admin_it' ? 'IT Maintenance' : (user?.displayName || 'Kitsch Studio')}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary', 
              mt: 0.5,
              wordBreak: 'break-all',
              overflowWrap: 'break-word'
            }}
          >
            {user?.email || 'studio360@demo.com'}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Account Option - Hide for IT Maintenance */}
        {user?.role !== 'admin_it' && (
          <>
            <MenuItem
              onClick={() => handleClickItem(paths.dashboard.account)}
              sx={{
                p: 2,
                typography: 'body2',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Iconify icon="eva:settings-2-outline" width={18} />
              Account settings
            </MenuItem>
            <Divider sx={{ borderStyle: 'dashed' }} />
          </>
        )}

        {/* Logout Option */}
        <Box sx={{ p: 1.5 }}>
          <MenuItem
            onClick={handleLogoutClick}
            sx={{
              p: 1.5,
              typography: 'body2',
              fontWeight: 600,
              color: 'error.main',
              bgcolor: 'error.lighter',
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'error.light',
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Iconify icon="eva:log-out-outline" width={18} />
            Logout
          </MenuItem>
        </Box>
      </CustomPopover>

      <LogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
} 