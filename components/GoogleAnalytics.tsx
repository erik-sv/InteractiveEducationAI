/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default function GoogleAnalytics() {
  useEffect(() => {
    // Load the gtag script
    const gtagScript = document.createElement('script');

    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-6T3LWSS5S6';
    document.head.appendChild(gtagScript);

    // Initialize dataLayer and define gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    // Initialize gtag
    gtag('js', new Date());
    gtag('config', 'G-6T3LWSS5S6');

    return () => {
      // Cleanup
      document.head.removeChild(gtagScript);
    };
  }, []);

  return null;
}
