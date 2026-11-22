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
      <h1 className="display display-xl max-w-[14ch]">This page did not load</h1>
      <p className="lede mt-6">
        Something went wrong on our side while opening this page. Try again, or go back to the home page.
      </p>
      <div className="rule-ink-t mt-12 flex flex-col items-start gap-4 pt-8 sm:flex-row sm:items-center">
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
