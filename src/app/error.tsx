"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : null;

  return (
    <div className="wrap pt-10 md:pt-16">
      <h1 className="display display-xl rise max-w-[14ch]">This page did not load</h1>
      <p className="lede rise mt-5" style={{ "--i": 1 } as React.CSSProperties}>
        Something went wrong on our side. Try again, or go back to the home page.
      </p>
      <div
        className="rise mt-8 flex flex-col items-stretch gap-3 xs:flex-row xs:items-center"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        <button type="button" onClick={() => retry()} className="btn btn-ink">
          Try again
        </button>
        <Link href="/" className="btn btn-line">
          Home page
        </Link>
      </div>
      {digest ? <p className="label mt-8">Reference {digest}</p> : null}
    </div>
  );
}
