'use client';

import { m } from 'framer-motion';
import { useEffect, useMemo, useState, useCallback } from 'react';

import SvgIcon from '@mui/material/SvgIcon';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import { varHover } from 'src/components/animate';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import SupportModal from 'src/components/support/support-modal';
import { Label } from 'src/components/label';
import supportApi from 'src/services/support';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ContactsPopover({ data = [], sx, ...other }) {
  const popover = usePopover();
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [currentTab, setCurrentTab] = useState('tickets');

  const handleChangeTab = useCallback((e, v) => setCurrentTab(v), []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const list = await supportApi.listTickets();
        if (!mounted) return;
        setTickets(Array.isArray(list) ? list : []);
      } catch (_) {
        setTickets([]);
      }
    }
    if (popover.open) load();
    return () => {
      mounted = false;
    };
  }, [popover.open]);

  const { openTickets, resolvedTickets } = useMemo(() => {
    const open = [];
    const resolved = [];
    for (const t of tickets) {
      const status = (t.status || '').toLowerCase();
      if (status === 'resolved' || status === 'closed' || status === 'done') {
        resolved.push(t);
      } else {
        open.push(t);
      }
    }
    return { openTickets: open, resolvedTickets: resolved };
  }, [tickets]);

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          ...(popover.open && { bgcolor: (theme) => theme.vars.palette.action.selected }),
          ...sx,
        }}
        {...other}
      >
        <SvgIcon>
          {/* https://icon-sets.iconify.design/solar/users-group-rounded-bold-duotone/  */}
          <circle cx="15" cy="6" r="3" fill="currentColor" opacity="0.4" />
          <ellipse cx="16" cy="17" fill="currentColor" opacity="0.4" rx="5" ry="3" />
          <circle cx="9.001" cy="6" r="4" fill="currentColor" />
          <ellipse cx="9.001" cy="17.001" fill="currentColor" rx="7" ry="4" />
        </SvgIcon>
      </IconButton>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          paper: { sx: { mt: 1.5, ml: 0.75, width: 400, maxHeight: 600 } },
        }}
      >
        <Box sx={{ py: 2, px: 2, minHeight: 68, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Support
          </Typography>
          <Tooltip title="New ticket">
            <IconButton onClick={() => { setActiveTicketId(null); setSupportModalOpen(true); }}>
              <Iconify icon="eva:plus-fill" />
            </IconButton>
          </Tooltip>
        </Box>

        <CustomTabs variant="fullWidth" value={currentTab} onChange={handleChangeTab}>
          <Tab
            key="tickets"
            iconPosition="end"
            value="tickets"
            label="Tickets"
            icon={<Label variant={(currentTab === 'tickets' && 'filled') || 'soft'} color="info">{openTickets.length}</Label>}
          />
          <Tab
            key="resolved"
            iconPosition="end"
            value="resolved"
            label="Resolved"
            icon={<Label variant={(currentTab === 'resolved' && 'filled') || 'soft'} color="success">{resolvedTickets.length}</Label>}
          />
        </CustomTabs>

        <Scrollbar sx={{ height: 400 }}>
          <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
            {(currentTab === 'tickets' ? openTickets : resolvedTickets).map((t) => (
              <Box
                component="li"
                key={t.id}
                sx={{ display: 'flex' }}
                onClick={() => {
                  setActiveTicketId(t.id);
                  setSupportModalOpen(true);
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, width: 1, cursor: 'pointer' }}>
                  <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                    <SvgIcon>
                      {/* ticket icon style simple dot + cog to keep minimal visuals */}
                      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12" />
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                    </SvgIcon>
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {t.subject || `Ticket #${t.id}`}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                      {(t.last_message && t.last_message.body) ? t.last_message.body : (t.updated_at || t.created_at)}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {new Date(t.updated_at || t.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Scrollbar>
      </CustomPopover>

      <SupportModal
        open={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        ticketId={activeTicketId}
        onSubmitted={() => {}}
      />
    </>
  );
}
