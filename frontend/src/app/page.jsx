import { LandingView } from 'src/sections/landing/view';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// ----------------------------------------------------------------------

export default async function Page() {
  // Temporary fallback: Check hostname and redirect if middleware didn't rewrite
  // This ensures kitschstudio.page shows the storefront even if middleware fails
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const normalizedHost = hostname.split(':')[0].toLowerCase();
  
  // If kitschstudio.page, redirect to the store route
  // Note: This is a redirect (changes URL), but ensures the storefront works
  if (normalizedHost === 'kitschstudio.page' || normalizedHost === 'www.kitschstudio.page') {
    redirect('/kitschstudio/');
  }
  
  // The middleware handles kitschstudio.page rewrites
  // This page only serves the landing page for studio360.dev
  return <LandingView />;
}
