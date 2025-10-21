'use client';

import { createPortal } from 'react-dom';
import { useRef, useEffect } from 'react';

import { styled } from '@mui/material/styles';
import { listClasses } from '@mui/material/List';
import { menuItemClasses } from '@mui/material/MenuItem';

import { StyledArrow } from './styles';
import { calculateAnchorOrigin } from './utils';

// ----------------------------------------------------------------------

const StyledBackdrop = styled('div')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'transparent',
  zIndex: theme.zIndex.modal - 1,
}));

const StyledPopover = styled('div')(({ theme, paperStyles }) => ({
  position: 'fixed',
  zIndex: theme.zIndex.modal,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[12],
  overflow: 'inherit',
  [`& .${listClasses.root}`]: { minWidth: 140 },
  [`& .${menuItemClasses.root}`]: { gap: 2 },
  ...paperStyles,
}));

// ----------------------------------------------------------------------

/**
 * React 19 compatible CustomPopover component
 * Replaces MUI Popover to avoid deprecated Portal ref warnings
 */
export function CustomPopoverReact19({ 
  open, 
  onClose, 
  children, 
  anchorEl, 
  slotProps = {},
  ...other 
}) {
  const popoverRef = useRef(null);
  const arrowPlacement = slotProps?.arrow?.placement ?? 'top-right';
  const arrowSize = slotProps?.arrow?.size ?? 14;
  const arrowOffset = slotProps?.arrow?.offset ?? 17;

  const { paperStyles, anchorOrigin, transformOrigin } = calculateAnchorOrigin(arrowPlacement);

  // Calculate position based on anchor element
  useEffect(() => {
    if (!open || !anchorEl || !popoverRef.current) return;

    const updatePosition = () => {
      const anchorRect = anchorEl.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      
      let top = anchorRect.bottom + 8; // 8px offset
      let left = anchorRect.right - popoverRect.width;

      // Adjust for screen boundaries
      if (top + popoverRect.height > window.innerHeight) {
        top = anchorRect.top - popoverRect.height - 8;
      }
      
      if (left < 8) {
        left = 8;
      }
      
      if (left + popoverRect.width > window.innerWidth) {
        left = window.innerWidth - popoverRect.width - 8;
      }

      popoverRef.current.style.top = `${top}px`;
      popoverRef.current.style.left = `${left}px`;
    };

    // Initial positioning
    updatePosition();

    // Update position on scroll/resize
    const handleUpdate = () => updatePosition();
    window.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [open, anchorEl]);

  // Handle click outside to close
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        !anchorEl?.contains(event.target)
      ) {
        onClose?.();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose, anchorEl]);

  if (!open) {
    return null;
  }

  const content = (
    <>
      <StyledBackdrop />
      <StyledPopover
        ref={popoverRef}
        paperStyles={paperStyles}
        sx={{
          ...slotProps?.paper?.sx,
        }}
        role="dialog"
        aria-modal="true"
        {...other}
      >
        {!slotProps?.arrow?.hide && (
          <StyledArrow
            sx={slotProps?.arrow?.sx}
            placement={arrowPlacement}
            offset={arrowOffset}
            size={arrowSize}
          />
        )}
        {children}
      </StyledPopover>
    </>
  );

  // Use React's createPortal directly to avoid MUI Portal ref issues
  return createPortal(content, document.body);
}
