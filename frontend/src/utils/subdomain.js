// ----------------------------------------------------------------------

/**
 * Get the current subdomain from the hostname
 * @returns {string|null} The subdomain or null if no subdomain
 */
export function getCurrentSubdomain() {
  if (typeof window === 'undefined') {
    return null;
  }

  const {hostname} = window.location;
  
  // Handle localhost development
  if (hostname === 'localhost') {
    return null;
  }
  
  // Handle main domain
  if (hostname === 'studio360.dev' || hostname === 'www.studio360.dev') {
    return null;
  }
  
  // Handle store domain (kitschstudio.page)
  if (hostname === 'kitschstudio.page' || hostname === 'www.kitschstudio.page') {
    return null;
  }
  
  // Extract subdomain from studio360.dev
  const parts = hostname.split('.');
  if (parts.length >= 2 && parts[parts.length - 1] === 'dev' && parts[parts.length - 2] === 'studio360') {
    return parts[0];
  }
  
  return null;
}

/**
 * Check if we're currently on a store subdomain
 * @returns {boolean} True if on a store subdomain
 */
export function isStoreSubdomain() {
  if (typeof window === 'undefined') {
    return false;
  }

  const subdomain = getCurrentSubdomain();
  const {hostname, pathname} = window.location;
  
  // Check if we're on kitschstudio.page (store domain)
  if (hostname === 'kitschstudio.page' || hostname === 'www.kitschstudio.page') {
    return true;
  }
  
  // For localhost development, check if we're on a subdomain route
  if (hostname === 'localhost') {
    const pathParts = pathname.split('/').filter(part => part.length > 0);
    const firstPart = pathParts[0];
    
    // Check if first part is a valid store subdomain (not reserved routes)
    const isValidStoreRoute = firstPart && 
      firstPart !== 'dashboard' && 
      firstPart !== 'admin' &&
      firstPart !== 'api' &&
      firstPart !== 'auth' &&
      firstPart !== 'stores' &&
      firstPart !== 'stores' &&
      firstPart !== '_next' &&
      firstPart !== 'favicon.ico';
    
    return isValidStoreRoute;
  }
  
  // Check if subdomain exists and is not reserved
  const isValidStoreSubdomain = subdomain && 
    subdomain !== 'www' && 
    subdomain !== 'admin' && 
    subdomain !== 'dashboard' &&
    subdomain !== 'app' &&
    subdomain !== 'api';
  
  return isValidStoreSubdomain;
}

/**
 * Check if we're currently on the admin subdomain
 * @returns {boolean} True if on admin subdomain
 */
export function isAdminSubdomain() {
  const subdomain = getCurrentSubdomain();
  return subdomain === 'admin';
}

/**
 * Check if we're currently on the dashboard subdomain
 * @returns {boolean} True if on dashboard subdomain
 */
export function isDashboardSubdomain() {
  const subdomain = getCurrentSubdomain();
  return subdomain === 'dashboard';
}

/**
 * Get the store ID from the current subdomain
 * @returns {string|null} The store ID or null if not on a store subdomain
 */
export function getCurrentStoreId() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const {hostname} = window.location;
  
  // Check if we're on kitschstudio.page
  if (hostname === 'kitschstudio.page' || hostname === 'www.kitschstudio.page') {
    return 'kitschstudio';
  }
  
  if (isStoreSubdomain()) {
    return getCurrentSubdomain();
  }
  return null;
}

/**
 * Build a store URL with subdomain
 * @param {string} storeId - The store ID
 * @param {string} path - The path (optional)
 * @returns {string} The complete store URL
 */
export function buildStoreUrl(storeId, path = '') {
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:';
  const host = typeof window !== 'undefined' ? window.location.hostname : 'studio360.dev';
  
  // For localhost development, use query params instead of subdomain
  if (host === 'localhost') {
    const baseUrl = `${protocol}//${host}:3033`;
    return path ? `${baseUrl}/stores/${storeId}${path}` : `${baseUrl}/stores/${storeId}`;
  }
  
  // Special case: if storeId is 'kitschstudio', use the kitschstudio.page domain
  if (storeId === 'kitschstudio') {
    const baseUrl = `${protocol}//kitschstudio.page`;
    return path ? `${baseUrl}${path}` : baseUrl;
  }
  
  // For production, use subdomain
  const baseUrl = `${protocol}//${storeId}.studio360.dev`;
  return path ? `${baseUrl}${path}` : baseUrl;
}

/**
 * Build an admin URL with subdomain
 * @param {string} path - The path (optional)
 * @returns {string} The complete admin URL
 */
export function buildAdminUrl(path = '') {
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:';
  const host = typeof window !== 'undefined' ? window.location.hostname : 'studio360.dev';
  
  // For localhost development, use regular admin routes
  if (host === 'localhost') {
    const baseUrl = `${protocol}//${host}:3033`;
    return path ? `${baseUrl}/admin${path}` : `${baseUrl}/admin`;
  }
  
  // For production, use admin subdomain
  const baseUrl = `${protocol}//admin.studio360.dev`;
  return path ? `${baseUrl}${path}` : baseUrl;
}

/**
 * Build a dashboard URL with subdomain
 * @param {string} path - The path (optional)
 * @returns {string} The complete dashboard URL
 */
export function buildDashboardUrl(path = '') {
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:';
  const host = typeof window !== 'undefined' ? window.location.hostname : 'studio360.dev';
  
  // For localhost development, use regular dashboard routes
  if (host === 'localhost') {
    const baseUrl = `${protocol}//${host}:3033`;
    return path ? `${baseUrl}/dashboard${path}` : `${baseUrl}/dashboard`;
  }
  
  // For production, use dashboard subdomain
  const baseUrl = `${protocol}//dashboard.studio360.dev`;
  return path ? `${baseUrl}${path}` : baseUrl;
}

/**
 * Navigate to a store using subdomain
 * @param {string} storeId - The store ID
 * @param {string} path - The path (optional)
 */
export function navigateToStore(storeId, path = '') {
  if (typeof window !== 'undefined') {
    const url = buildStoreUrl(storeId, path);
    window.location.href = url;
  }
}

/**
 * Navigate to admin using subdomain
 * @param {string} path - The path (optional)
 */
export function navigateToAdmin(path = '') {
  if (typeof window !== 'undefined') {
    const url = buildAdminUrl(path);
    window.location.href = url;
  }
}

/**
 * Navigate to dashboard using subdomain
 * @param {string} path - The path (optional)
 */
export function navigateToDashboard(path = '') {
  if (typeof window !== 'undefined') {
    const url = buildDashboardUrl(path);
    window.location.href = url;
  }
}
