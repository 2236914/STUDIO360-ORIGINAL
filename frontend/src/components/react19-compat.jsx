'use client';

import { useEffect } from 'react';

// ----------------------------------------------------------------------

// Apply React 19 compatibility patches immediately when this module loads
// This needs to happen before any MUI components are rendered
const applyReact19Patches = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // Only patch once
  if (window.__react19CompatPatched) {
    return;
  }

  // Patch Object.defineProperty to handle _debugInfo conflicts (Next.js 16 compatible)
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    // Handle _debugInfo property specifically to prevent redefinition errors
    if (prop === '_debugInfo') {
      try {
        // Check if the property already exists
        const existingDescriptor = Object.getOwnPropertyDescriptor(obj, prop);
        
        if (existingDescriptor && !existingDescriptor.configurable) {
          // Property exists and is not configurable - return obj without redefining
          return obj;
        }
        
        if (existingDescriptor && existingDescriptor.configurable) {
          // Delete the existing property first to avoid redefinition issues
          delete obj[prop];
        }
        
        // Make sure the new descriptor allows future configuration
        const safeDescriptor = {
          ...descriptor,
          configurable: true,
        };
        
        return originalDefineProperty.call(this, obj, prop, safeDescriptor);
      } catch (error) {
        // If redefinition fails, just return obj - this is expected in Next.js 16
        if (error.message && error.message.includes('Cannot redefine property')) {
          return obj;
        }
        throw error;
      }
    }
    
    // For all other properties, use the original function
    return originalDefineProperty.call(this, obj, prop, descriptor);
  };

// Patch console.error as early as possible (module load) to catch warnings
// that may fire before React effects run (e.g., during initial render in dev).
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    
    // Get stack trace to better identify source
    const stack = (new Error()).stack || '';
    
    // Suppress ALL React 19 ref warnings during development
    // These are framework-level issues that we cannot fix at the application level
    if (
      typeof message === 'string' &&
      (message.includes('Accessing element.ref was removed in React 19') ||
        message.includes('ref is now a regular prop') ||
        message.includes('elementRefGetterWithDeprecationWarning') ||
        message.includes('It will be removed from the JSX Element type'))
    ) {
      // Suppress in development - these are library compatibility issues
      if (process.env.NODE_ENV === 'development') {
        // Optional: uncomment to track warnings
        // console.warn('React 19 ref warning suppressed:', message.split('\n')[0]);
        return;
      }
    }
    // Remove deepmerge stack overflow suppression: real fix applied in theme builder
    // Suppress MUI controlled/uncontrolled component warnings
    if (
      typeof message === 'string' &&
      (message.includes('A component is changing the uncontrolled value state of Select to be controlled') ||
        message.includes('Elements should not switch from uncontrolled to controlled') ||
        message.includes('controlled or uncontrolled Select element'))
    ) {
      // Only suppress in development when we're transitioning components
      if (process.env.NODE_ENV === 'development') {
        console.warn('MUI controlled/uncontrolled warning suppressed:', message.split('\n')[0]);
        return;
      }
    }
    // Suppress hydration mismatch warnings in development
    if (
      typeof message === 'string' &&
      (message.includes('A tree hydrated but some attributes') ||
        message.includes('hydration mismatch') ||
        message.includes('CSS class names') ||
        message.includes('css-') ||
        message.includes('MuiStack-root') ||
        message.includes('Text content does not match'))
    ) {
      // Only suppress in development
      if (process.env.NODE_ENV === 'development') {
        return;
      }
    }
    
    // Suppress _debugInfo property redefinition errors (Next.js 15/16 with React DevTools)
    if (
      typeof message === 'string' &&
      (message.includes('Cannot redefine property: _debugInfo') ||
        message.includes('_debugInfo') ||
        message.includes('Object.defineProperty'))
    ) {
      // Only suppress in development - this is a known Next.js DevTools issue
      if (process.env.NODE_ENV === 'development') {
        console.warn('Next.js DevTools _debugInfo warning suppressed (known issue)');
        return;
      }
    }
    originalError.apply(console, args);
  };
  window.__react19CompatPatched = true;
};

// Apply patches immediately when this module is imported
applyReact19Patches();

export function React19Compatibility() {
  // Keep an effect to ensure cleanup/re-patching during hot reloads in dev
  useEffect(() => {
    // Re-apply patches in case they were lost during hot reload
    applyReact19Patches();
    
    return () => {
      // no-op: we intentionally keep the global patch during dev session
    };
  }, []);

  return null;
}
