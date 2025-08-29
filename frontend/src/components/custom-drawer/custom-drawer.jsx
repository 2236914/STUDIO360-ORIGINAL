'use client';

import { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { createPortal } from 'react-dom';

// ----------------------------------------------------------------------

const StyledBackdrop = styled('div')(({ theme, invisible }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: invisible ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
  zIndex: theme.zIndex.drawer - 1,
  transition: theme.transitions.create('opacity'),
}));

const StyledDrawer = styled('div')(({ theme, anchor, width, open }) => ({
  position: 'fixed',
  top: 0,
  bottom: 0,
  width: width || 320,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[16],
  zIndex: theme.zIndex.drawer,
  display: 'flex',
  flexDirection: 'column',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.enteringScreen,
  }),
  transform: open ? 'translateX(0)' : 
    anchor === 'right' ? 'translateX(100%)' : 'translateX(-100%)',
  ...(anchor === 'right' && {
    right: 0,
  }),
  ...(anchor === 'left' && {
    left: 0,
  }),
}));

// ----------------------------------------------------------------------

/**
 * React 19 compatible custom drawer component
 * Replaces MUI Drawer to avoid deprecated Portal ref warnings
 */
export function CustomDrawer({
  open = false,
  anchor = 'right',
  onClose,
  children,
  width = 320,
  sx = {},
  slotProps = {},
  ...other
}) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && open && onClose) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const backdropProps = slotProps.backdrop || {};
  const { invisible = true, ...otherBackdropProps } = backdropProps;

  const content = (
    <>
      <StyledBackdrop
        invisible={invisible}
        onClick={onClose}
        {...otherBackdropProps}
      />
      <StyledDrawer
        anchor={anchor}
        width={width}
        open={open}
        sx={sx}
        role="dialog"
        aria-modal="true"
        {...other}
      >
        {children}
      </StyledDrawer>
    </>
  );

  // Use React's createPortal directly to avoid MUI Portal ref issues
  return createPortal(content, document.body);
}
