// This file must be imported first to patch Object.defineProperty before Next.js loads
// It gets loaded automatically by Next.js config

if (typeof window !== 'undefined' && typeof Object !== 'undefined') {
  // Only patch once
  if (window.__debugInfoPolyfillApplied) {
    console.log('[Debug Info Fix] Already applied');
    return;
  }

  console.log('[Debug Info Fix] Applying Object.defineProperty patch...');

  // Store original
  const originalDefineProperty = Object.defineProperty;

  // Patch Object.defineProperty
  Object.defineProperty = function(obj, prop, descriptor) {
    // Handle _debugInfo property specifically
    if (prop === '_debugInfo') {
      try {
        const existing = Object.getOwnPropertyDescriptor(obj, prop);
        
        // If property exists and is not configurable, skip
        if (existing && !existing.configurable) {
          console.warn('[Debug Info Fix] Skipping non-configurable _debugInfo property');
          return obj;
        }
        
        // If property exists but is configurable, delete first
        if (existing && existing.configurable) {
          delete obj[prop];
        }
        
        // Try to define with configurable=true
        try {
          return originalDefineProperty(obj, prop, {
            ...descriptor,
            configurable: true,
            enumerable: descriptor.enumerable !== false,
            writable: descriptor.writable !== false,
          });
        } catch (err) {
          // If it still fails, just return obj
          console.warn('[Debug Info Fix] Could not redefine _debugInfo:', err.message);
          return obj;
        }
      } catch (error) {
        console.warn('[Debug Info Fix] Error handling _debugInfo:', error.message);
        return obj;
      }
    }
    
    // For all other properties, use original method
    return originalDefineProperty(obj, prop, descriptor);
  };

  window.__debugInfoPolyfillApplied = true;
  console.log('[Debug Info Fix] Successfully applied');
}

