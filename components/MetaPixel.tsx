"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type FacebookPixel = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: FacebookPixel;
    _fbq?: FacebookPixel;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const updateConsent = () => {
      const consent = localStorage.getItem("himkash-cookie-consent-v2");
      setMarketingConsent(consent === "all");
    };

    updateConsent();

    window.addEventListener("cookie-consent-updated", updateConsent);
    window.addEventListener("storage", updateConsent);

    return () => {
      window.removeEventListener("cookie-consent-updated", updateConsent);
      window.removeEventListener("storage", updateConsent);
    };
  }, []);

  useEffect(() => {
    if (!marketingConsent) return;

    // The Pixel script tracks the first PageView.
    // This tracks navigation between Next.js pages.
    if (
      previousPathname.current !== pathname &&
      typeof window.fbq === "function"
    ) {
      window.fbq("track", "PageView");
    }

    previousPathname.current = pathname;
  }, [pathname, marketingConsent]);

  if (!marketingConsent || !PIXEL_ID) {
    return null;
  }

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {
          if(f.fbq)return;
          n=f.fbq=function(){
            n.callMethod
              ? n.callMethod.apply(n,arguments)
              : n.queue.push(arguments)
          };
          if(!f._fbq)f._fbq=n;
          n.push=n;
          n.loaded=!0;
          n.version='2.0';
          n.queue=[];
          t=b.createElement(e);
          t.async=!0;
          t.src=v;
          s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)
        }(
          window,
          document,
          'script',
          'https://connect.facebook.net/en_US/fbevents.js'
        );

        fbq('init', '${PIXEL_ID}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}