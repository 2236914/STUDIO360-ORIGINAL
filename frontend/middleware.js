import { NextResponse } from 'next/server';

// Main domain and subdomain configuration
const MAIN_DOMAIN = 'studio360.com';
const LOCAL_DOMAIN = 'localhost:3000';

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Extract subdomain from hostname
  const subdomain = getSubdomain(hostname);
  
  // If no subdomain or it's the main domain, continue normally
  if (!subdomain || subdomain === 'www' || subdomain === 'app') {
    return NextResponse.next();
  }
  
  // If subdomain is 'admin', redirect to admin routes
  if (subdomain === 'admin') {
    // Rewrite admin subdomain to admin routes
    const adminPath = pathname === '/' ? '/admin' : `/admin${pathname}`;
    return NextResponse.rewrite(new URL(adminPath, request.url));
  }
  
  // If subdomain is 'dashboard', redirect to dashboard routes
  if (subdomain === 'dashboard') {
    // Rewrite dashboard subdomain to dashboard routes
    const dashboardPath = pathname === '/' ? '/dashboard' : `/dashboard${pathname}`;
    return NextResponse.rewrite(new URL(dashboardPath, request.url));
  }
  
  // For store subdomains, rewrite to subdomain routes
  if (isValidStoreSubdomain(subdomain)) {
    // Rewrite store subdomain to subdomain routes
    const subdomainPath = pathname === '/' 
      ? `/${subdomain}` 
      : `/${subdomain}${pathname}`;
    
    return NextResponse.rewrite(new URL(subdomainPath, request.url));
  }
  
  // If subdomain doesn't match any pattern, redirect to main domain
  return NextResponse.redirect(new URL(`https://${MAIN_DOMAIN}${pathname}${search}`, request.url));
}

// Helper function to extract subdomain from hostname
function getSubdomain(hostname) {
  // Remove port if present (for localhost:3000)
  const host = hostname.split(':')[0];
  
  // Handle localhost development
  if (host === 'localhost') {
    return null;
  }
  
  // Handle main domain
  if (host === MAIN_DOMAIN || host === `www.${MAIN_DOMAIN}`) {
    return null;
  }
  
  // Extract subdomain
  const parts = host.split('.');
  if (parts.length >= 2 && parts[parts.length - 1] === 'com' && parts[parts.length - 2] === 'studio360') {
    return parts[0];
  }
  
  return null;
}

// Helper function to validate if subdomain is a valid store ID
function isValidStoreSubdomain(subdomain) {
  // Add your validation logic here
  // For now, we'll allow alphanumeric store IDs
  return /^[a-zA-Z0-9-_]+$/.test(subdomain) && subdomain.length >= 2;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
