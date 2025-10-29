'use client';

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';

// ----------------------------------------------------------------------

/**
 * React 19 compatible Portal wrapper
 * This component provides a stable portal implementation for Next.js 15
 */
export function PortalWrapper({ 
  children, 
  container, 
  disablePortal = false,
  ...other 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (disablePortal || !mounted) {
    return children;
  }

  // Use React's createPortal directly to avoid ref warnings
  const portalContainer = container || (typeof document !== 'undefined' ? document.body : null);
  
  if (!portalContainer) {
    return children;
  }

  return createPortal(children, portalContainer);
}
