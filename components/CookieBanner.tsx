"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");

    if (consent !== "all" && consent !== "necessary") {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (choice: "all" | "necessary") => {
    localStorage.setItem("himkash-cookie-consent-v2", choice);

    window.dispatchEvent(
      new CustomEvent("cookie-consent-updated", {
        detail: choice,
      })
    );

    setShowBanner(false);
  };

  const acceptAll = () => {
    saveConsent("all");
  };

  const rejectAll = () => {
    saveConsent("necessary");
  };

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed bottom-0 left-0 right-0 z-50 bg-red-900 p-4 text-white shadow-lg"
    >
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm">
          We use necessary cookies to operate our website. With your permission,
          we also use analytics and marketing cookies to understand website
          activity and improve our advertising. Read our{" "}
          <Link href="/cookies" className="underline">
            Cookie Policy
          </Link>
          .
        </p>

        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={rejectAll}
            className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
          >
            Reject All
          </button>

          <button
            type="button"
            onClick={acceptAll}
            className="rounded bg-amber-600 px-4 py-2 hover:bg-amber-700"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}