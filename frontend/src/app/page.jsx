import { LandingView } from 'src/sections/landing/view';

// ----------------------------------------------------------------------

export default function Page() {
  // The middleware handles kitschstudio.page rewrites
  // This page only serves the landing page for studio360.dev
  return <LandingView />;
}
