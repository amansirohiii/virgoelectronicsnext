"use client";

import Link from "next/link";
import { useEffect } from "react";
import { compareHref, saveCompareList, useCompareList } from "./compare-store";

/** Keeps the "Add to compare" buttons in step with the comparison on screen. */
export function CompareSync({ entries }: { entries: string[] }) {
  const key = entries.join(",");
  useEffect(() => {
    if (key) saveCompareList(key.split(","));
  }, [key]);
  return null;
}

/** On the empty compare page: a way back to models picked earlier in this visit. */
export function ResumeCompare() {
  const list = useCompareList();
  if (!list || list.length === 0) return null;
  return (
    <p className="mt-6">
      <Link href={compareHref(list)} className="btn btn-ink">
        Compare the {list.length} {list.length === 1 ? "model" : "models"} you picked
      </Link>
    </p>
  );
}
