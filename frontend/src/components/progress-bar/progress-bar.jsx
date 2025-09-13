'use client';

import './styles.css';

import NProgress from 'nprogress';
import { Suspense, useEffect } from 'react';

import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function ProgressBar() {
  useEffect(() => {
    NProgress.configure({ 
      showSpinner: false,
      minimum: 0.1,
      easing: 'ease',
      speed: 500,
      trickle: true,
      trickleSpeed: 200,
    });

    const handleAnchorClick = (event) => {
      const targetUrl = event.currentTarget.href;
      const currentUrl = window.location.href;

      if (targetUrl !== currentUrl) {
        NProgress.start();
      }
    };

    const handleMutation = () => {
      const anchorElements = document.querySelectorAll('a[href]');

      const filteredAnchors = Array.from(anchorElements).filter((element) => {
        const rel = element.getAttribute('rel');
        const href = element.getAttribute('href');
        const target = element.getAttribute('target');

        return href?.startsWith('/') && target !== '_blank' && rel !== 'noopener';
      });

      filteredAnchors.forEach((anchor) => {
        // Remove existing listeners to prevent duplicates
        anchor.removeEventListener('click', handleAnchorClick);
        anchor.addEventListener('click', handleAnchorClick);
      });
    };

    const mutationObserver = new MutationObserver(handleMutation);

    mutationObserver.observe(document, { childList: true, subtree: true });

    // Initial setup
    handleMutation();

    // Handle Next.js App Router navigation
    const handleRouteChangeStart = () => {
      NProgress.start();
    };

    const handleRouteChangeComplete = () => {
      NProgress.done();
    };

    const handleRouteChangeError = () => {
      NProgress.done();
    };

    // Listen to Next.js router events if available
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => NProgress.start());
      
      // Override history methods to catch programmatic navigation
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      
      window.history.pushState = function(...args) {
        NProgress.start();
        return originalPushState.apply(this, args);
      };
      
      window.history.replaceState = function(...args) {
        NProgress.start();
        return originalReplaceState.apply(this, args);
      };
    }

    return () => {
      mutationObserver.disconnect();
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', () => NProgress.start());
      }
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <NProgressDone />
    </Suspense>
  );
}

// ----------------------------------------------------------------------

function NProgressDone() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Ensure progress bar completes when route changes
    const timer = setTimeout(() => {
      NProgress.done();
    }, 100);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  // Handle router events for better progress tracking
  useEffect(() => {
    if (!router) return;

    const handleStart = () => {
      NProgress.start();
    };

    const handleComplete = () => {
      NProgress.done();
    };

    const handleError = () => {
      NProgress.done();
    };

    // Listen to router events if available
    if (router.events) {
      router.events.on('routeChangeStart', handleStart);
      router.events.on('routeChangeComplete', handleComplete);
      router.events.on('routeChangeError', handleError);

      return () => {
        router.events.off('routeChangeStart', handleStart);
        router.events.off('routeChangeComplete', handleComplete);
        router.events.off('routeChangeError', handleError);
      };
    }
  }, [router]);

  return null;
}
