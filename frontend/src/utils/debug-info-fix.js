// Global fix for _debugInfo property redefinition errors
// This should be imported as early as possible in the application

if (typeof window !== 'undefined') {
  // Store the original defineProperty method
  const originalDefineProperty = Object.defineProperty;
  
  // Override Object.defineProperty globally
  Object.defineProperty = function(obj, prop, descriptor) {
    // Special handling for _debugInfo property
    if (prop === '_debugInfo') {
      try {
        // Check if the property already exists
        const existingDescriptor = Object.getOwnPropertyDescriptor(obj, prop);
        
        if (existingDescriptor) {
          // If it exists and is not configurable, skip the redefinition
          if (!existingDescriptor.configurable) {
            console.warn('_debugInfo property already exists and is non-configurable. Skipping redefinition.');
            return obj;
          }
          
          // If it exists but is configurable, delete it first
          delete obj[prop];
        }
        
        // Ensure the new descriptor is configurable
        const safeDescriptor = {
          ...descriptor,
          configurable: true,
        };
        
        return originalDefineProperty.call(this, obj, prop, safeDescriptor);
      } catch (error) {
        if (error.message && error.message.includes('Cannot redefine property')) {
          console.warn('Prevented _debugInfo redefinition error. This is expected in Next.js 15.x development mode.');
          return obj;
        }
        // Re-throw other errors
        throw error;
      }
    }
    
    // For all other properties, use the original method
    return originalDefineProperty.call(this, obj, prop, descriptor);
  };
  
  // Also add a global error handler for uncaught defineProperty errors
  const originalErrorHandler = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string' && message.includes('Cannot redefine property: _debugInfo')) {
      console.warn('Caught _debugInfo redefinition error:', message);
      return true; // Prevent the error from propagating
    }
    
    // Call the original error handler if it exists
    if (originalErrorHandler) {
      return originalErrorHandler.call(this, message, source, lineno, colno, error);
    }
    
    return false;
  };
  
  // Add unhandledrejection handler for Promise-based errors
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && 
        event.reason.message && 
        event.reason.message.includes('Cannot redefine property: _debugInfo')) {
      console.warn('Caught _debugInfo redefinition promise rejection:', event.reason.message);
      event.preventDefault(); // Prevent the error from being logged
    }
  });
}

export default function initializeDebugInfoFix() {
  // This function is called to ensure the fix is applied
  // The actual patching happens when this module is imported
  console.log('Debug info fix initialized');
}
