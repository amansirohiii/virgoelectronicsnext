"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { compareHref, saveCompareList, useCompareList, withModel } from "./compare-store";

/**
 * "Add to compare". Before hydration, or when sessionStorage is blocked, it is a
 * plain link that opens a comparison with this one model.
 */
export function CompareButton({
  entry,
  name,
  variant = "full",
}: {
  /** "category/slug" */
  entry: string;
  name: string;
  variant?: "full" | "compact";
}) {
  const list = useCompareList();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (justAdded) linkRef.current?.focus();
  }, [justAdded]);

  const full = variant === "full";
  const cls = full
    ? "btn btn-line w-full sm:w-auto"
    : "inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold underline-offset-4 hover:underline";

  const added = list?.includes(entry) ?? false;

  if (list === null || added) {
    const href = list === null ? compareHref([entry]) : compareHref(list);
    return (
      <Link ref={linkRef} href={href} className={cls}>
        {!full ? <Box checked={added} /> : null}
        {added ? (
          <span>
            Added. Compare ({list?.length})<span className="sr-only">, {name} is in the list</span>
          </span>
        ) : (
          <span>
            {full ? "Add to compare" : "Compare"}
            <span className="sr-only"> {name}</span>
          </span>
        )}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      onClick={() => {
        if (saveCompareList(withModel(list, entry))) setJustAdded(true);
        else window.location.assign(compareHref([entry]));
      }}
    >
      {!full ? <Box checked={false} /> : null}
      <span>
        {full ? "Add to compare" : "Compare"}
        <span className="sr-only"> {name}</span>
      </span>
    </button>
  );
}

function Box({ checked }: { checked: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0">
      <rect x="0.75" y="0.75" width="14.5" height="14.5" fill={checked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
      {checked ? <path d="M4 8.2l2.6 2.6L12 5.4" fill="none" stroke="#fff" strokeWidth="1.75" /> : null}
    </svg>
  );
}
