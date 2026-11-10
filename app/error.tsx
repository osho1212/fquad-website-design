"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary. A failing database read used to surface as
 * Next's raw error screen; this keeps the visitor inside the brand with a way
 * to retry or leave. (It can't use PageShell — that fetches the same data that
 * may have just failed.)
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main"
      className="min-h-screen flex flex-col items-start justify-center px-6 sm:px-14 py-32 text-white"
    >
      <div className="text-[11px] tracking-[0.24em] text-white/60 uppercase mb-7">Something went wrong</div>
      <h1 className="m-0 font-normal uppercase text-4xl sm:text-6xl leading-[0.98] tracking-tight max-w-[16ch]">
        We hit a snag.
      </h1>
      <p className="mt-7 max-w-[48ch] text-base leading-relaxed text-white/70">
        That page didn&apos;t load. It&apos;s usually temporary — try again, or head back to the start.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-4">
        <button type="button" onClick={reset} className="btn-primary text-xs uppercase font-medium cursor-pointer">
          Try again
        </button>
        <Link
          href="/"
          className="fq-link inline-flex items-center min-h-[44px] text-[11px] tracking-[0.2em] uppercase text-white/80 hover:text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
