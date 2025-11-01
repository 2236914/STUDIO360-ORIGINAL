/**
 * Utility function to safely join API URLs
 * Removes trailing slashes and ensures proper URL construction
 */
export function buildApiUrl(path) {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 
                    process.env.NEXT_PUBLIC_API_URL || 
                    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
  
  // Remove trailing slash from serverUrl
  const baseUrl = serverUrl.replace(/\/+$/, '');
  
  // Remove leading slash from path
  const cleanPath = path.replace(/^\/+/, '');
  
  // Join them properly
  return `${baseUrl}/${cleanPath}`;
}

