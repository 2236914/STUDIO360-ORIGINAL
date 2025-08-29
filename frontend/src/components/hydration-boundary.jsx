'use client';

import { useState, useEffect } from 'react';

/**
 * HydrationBoundary prevents hydration mismatches by only rendering 
 * client-side components after hydration is complete
 */
export function HydrationBoundary({ children, fallback = null }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return fallback;
  }

  return children;
}

/**
 * NoSSR component to prevent server-side rendering for specific components
 * Use this for components that have hydration issues
 */
export function NoSSR({ children, fallback = null }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return fallback;
  }

  return children;
}
