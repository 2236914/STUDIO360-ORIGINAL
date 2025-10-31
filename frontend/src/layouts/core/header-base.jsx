import Box from '@mui/material/Box';
import { useState, useCallback } from 'react';
import { m } from 'framer-motion';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import { styled, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { AccountPopover } from 'src/layouts/components/account-popover';
import { NotificationsPopover } from 'src/layouts/components/notifications-popover';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { SettingsPopover } from 'src/components/settings';
import { varHover } from 'src/components/animate';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import SupportPopover from 'src/components/support/support-popover';
import SupportModal from 'src/components/support/support-modal';

import { HeaderSection } from './header-section';
import { Searchbar } from '../components/searchbar';
import { MenuButton } from '../components/menu-button';
import { SignInButton } from '../components/sign-in-button';
import { LanguagePopover } from '../components/language-popover';
import { ContactsPopover } from '../components/contacts-popover';

// ----------------------------------------------------------------------

const StyledDivider = styled('span')(({ theme }) => ({
  width: 1,
  height: 10,
  flexShrink: 0,
  display: 'none',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  marginLeft: theme.spacing(2.5),
  marginRight: theme.spacing(2.5),
  backgroundColor: 'currentColor',
  color: theme.vars?.palette?.divider || 'rgba(145, 158, 171, 0.2)',
  '&::before, &::after': {
    top: -5,
    width: 3,
    height: 3,
    content: '""',
    flexShrink: 0,
    borderRadius: '50%',
    position: 'absolute',
    backgroundColor: 'currentColor',
  },
  '&::after': { bottom: -5, top: 'auto' },
}));

// ----------------------------------------------------------------------

export function HeaderBase({
  sx,
  data,
  slots,
  slotProps,
  onOpenNav,
  layoutQuery,

  slotsDisplay: {
    signIn = true,
    account = true,
    helpLink = true,
    settings = true,
    purchase = true,
    contacts = true,
    searchbar = true,
    menuButton = true,
    localization = true,
    notifications = true,
  } = {},

  ...other
}) {
  const theme = useTheme();
  const { user } = useAuthContext();
  const isSeller = user?.role === 'seller' || user?.role === 'store_owner' || user?.role === 'tenant';

  const [supportAnchor, setSupportAnchor] = useState(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState(null);

  const handleOpenSupport = useCallback((event) => {
    setSupportAnchor(event.currentTarget);
  }, []);

  const handleCloseSupport = useCallback(() => {
    setSupportAnchor(null);
  }, []);

  const handleOpenTicket = useCallback((ticketId) => {
    setActiveTicketId(ticketId);
    setSupportModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSupportModalOpen(false);
    setActiveTicketId(null);
  }, []);

  return (
    <>
      <HeaderSection
        sx={sx}
        layoutQuery={layoutQuery}
        slots={{
          ...slots,
          leftAreaStart: slots?.leftAreaStart,
          leftArea: (
            <>
              {slots?.leftAreaStart}

              {/* -- Menu button -- */}
              {menuButton && (
                <MenuButton
                  data-slot="menu-button"
                  onClick={onOpenNav}
                  sx={{
                    mr: 1,
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
              )}

              {/* -- Logo -- */}
              <Logo data-slot="logo" />

              {/* -- Divider -- */}
              <StyledDivider data-slot="divider" />

              {slots?.leftAreaEnd}
            </>
          ),
          rightArea: (
            <>
              {slots?.rightAreaStart}

              <Box
                data-area="right"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1, sm: 1.5 },
                }}
              >
                {/* -- Help link -- */}
                {helpLink && (
                  <Link
                    data-slot="help-link"
                    href="/landing"
                    component={RouterLink}
                    color="inherit"
                    underline="none"
                    sx={{ typography: 'subtitle2', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <Iconify icon="eva:arrow-back-outline" width={18} />
                    Back
                  </Link>
                )}

                {/* -- Searchbar -- */}
                {searchbar && <Searchbar data-slot="searchbar" data={data?.nav} />}

                {/* -- Language popover -- */}
                {localization && <LanguagePopover data-slot="localization" data={data?.langs} />}

                {/* -- Notifications popover -- */}
                {notifications && (
                  <NotificationsPopover data-slot="notifications" data={data?.notifications} />
                )}

                {/* -- Contacts popover -- */}
                {contacts && <ContactsPopover data-slot="contacts" data={data?.contacts} />}

                {/* -- Settings popover -- */}
                {settings && <SettingsPopover data-slot="settings" />}

                {/* -- Support (seller-only) -- removed headset icon (now handled via ContactsPopover) -- */}

                {/* -- Account drawer -- */}
                {account && <AccountPopover data-slot="account" data={data?.account} />}

                {/* -- Sign in button -- */}
                {signIn && <SignInButton />}

                {/* -- Purchase button -- */}
                {purchase && (
                  <Button
                    data-slot="purchase"
                    variant="contained"
                    rel="noopener"
                    target="_blank"
                    href={paths.minimalStore}
                    sx={{
                      display: 'none',
                      [theme.breakpoints.up(layoutQuery)]: {
                        display: 'inline-flex',
                      },
                    }}
                  >
                    Purchase
                  </Button>
                )}
              </Box>

              {slots?.rightAreaEnd}
            </>
          ),
        }}
        slotProps={slotProps}
        {...other}
      />
      {isSeller && (
        <>
          <SupportPopover
            anchorEl={supportAnchor}
            open={Boolean(supportAnchor)}
            onClose={handleCloseSupport}
            onOpenTicket={(id) => {
              handleCloseSupport();
              handleOpenTicket(id);
            }}
          />
          <SupportModal
            open={supportModalOpen}
            onClose={handleCloseModal}
            ticketId={activeTicketId}
            onSubmitted={() => {}}
          />
        </>
      )}
    </>
  );
}
