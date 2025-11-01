import { LandingView } from 'src/sections/landing/view';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// ----------------------------------------------------------------------

export default async function Page() {
  // Check hostname at the server level
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const normalizedHost = hostname.split(':')[0].toLowerCase();
  
  // If kitschstudio.page, redirect to the store route
  if (normalizedHost === 'kitschstudio.page' || normalizedHost === 'www.kitschstudio.page') {
    redirect('/kitschstudio/');
  }
  
  return <LandingView />;
}
