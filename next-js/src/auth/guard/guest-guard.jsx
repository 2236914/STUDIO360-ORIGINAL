'use client';

import { useState, useEffect } from 'react';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

export function GuestGuard({ children }) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const { loading, authenticated } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const returnToParam = searchParams.get('returnTo');
  const returnTo = returnToParam ? decodeURIComponent(returnToParam) : CONFIG.auth.redirectPath;

  const checkPermissions = async () => {
    if (loading) {
      return;
    }

    console.log('GuestGuard - authenticated:', authenticated, 'returnTo:', returnTo);

    if (authenticated) {
      console.log('GuestGuard - redirecting to:', returnTo);
      router.replace(returnTo);
      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
