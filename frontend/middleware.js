import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Main domain and subdomain configuration
const MAIN_DOMAIN = 'studio360.dev';
const STORE_DOMAIN = 'kitschstudio.page';
const LOCAL_DOMAIN = 'localhost:3000';

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Generate a per-request nonce
  const nonce = crypto.randomBytes(16).toString('base64');

  // Build a strict Content-Security-Policy using the nonce
  const csp = [
    "default-src 'self'",
    // Allow scripts from self and this specific nonce only
    `script-src 'self' 'nonce-${nonce}'` + (process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''),
    // Disallow inline styles except via nonce; allow self and fonts
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https: http:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Upgrade insecure requests in production
    process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
  ].filter(Boolean).join('; ');

  // Extract subdomain from hostname
  const subdomain = getSubdomain(hostname);

  // Create a base response with CSP and nonce propagated to the request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const baseResponse = NextResponse.next({ request: { headers: requestHeaders } });
  baseResponse.headers.set('Content-Security-Policy', csp);
  baseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  baseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  baseResponse.headers.set('X-Frame-Options', 'DENY');
  baseResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  baseResponse.headers.set('Cross-Origin-Resource-Policy', 'same-site');

  // If no subdomain or it's the main domain, continue normally
  if (!subdomain || subdomain === 'www' || subdomain === 'app') {
    return baseResponse;
  }
  
  // If subdomain is 'admin', redirect to admin routes
  if (subdomain === 'admin') {
    // Rewrite admin subdomain to admin routes
    const adminPath = pathname === '/' ? '/admin' : `/admin${pathname}`;
    const res = NextResponse.rewrite(new URL(adminPath, request.url));
    res.headers.set('Content-Security-Policy', csp);
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    res.headers.set('Cross-Origin-Resource-Policy', 'same-site');
    return res;
  }
  
  // If subdomain is 'dashboard', redirect to dashboard routes
  if (subdomain === 'dashboard') {
    // Rewrite dashboard subdomain to dashboard routes
    const dashboardPath = pathname === '/' ? '/dashboard' : `/dashboard${pathname}`;
    const res = NextResponse.rewrite(new URL(dashboardPath, request.url));
    res.headers.set('Content-Security-Policy', csp);
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    res.headers.set('Cross-Origin-Resource-Policy', 'same-site');
    return res;
  }
  
  // For store subdomains, rewrite to subdomain routes
  if (isValidStoreSubdomain(subdomain)) {
    // Rewrite store subdomain to subdomain routes
    const subdomainPath = pathname === '/' 
      ? `/${subdomain}` 
      : `/${subdomain}${pathname}`;
    
    const res = NextResponse.rewrite(new URL(subdomainPath, request.url));
    res.headers.set('Content-Security-Policy', csp);
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    res.headers.set('Cross-Origin-Resource-Policy', 'same-site');
    return res;
  }
  
  // Handle kitschstudio.page domain - rewrite to /kitschstudio route
  if (hostname === STORE_DOMAIN || hostname === `www.${STORE_DOMAIN}`) {
    const storePath = pathname === '/' 
      ? '/kitschstudio' 
      : `/kitschstudio${pathname}`;
    
    const res = NextResponse.rewrite(new URL(storePath, request.url));
    res.headers.set('Content-Security-Policy', csp);
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    res.headers.set('Cross-Origin-Resource-Policy', 'same-site');
    return res;
  }
  
  // If subdomain doesn't match any pattern, redirect to main domain
  const res = NextResponse.redirect(new URL(`https://${MAIN_DOMAIN}${pathname}${search}`, request.url));
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-site');
  return res;
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
  
  // Handle store domain (kitschstudio.page)
  if (host === STORE_DOMAIN || host === `www.${STORE_DOMAIN}`) {
    return null;
  }
  
  // Extract subdomain from studio360.dev
  const parts = host.split('.');
  if (parts.length >= 2 && parts[parts.length - 1] === 'dev' && parts[parts.length - 2] === 'studio360') {
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
