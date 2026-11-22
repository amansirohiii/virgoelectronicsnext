"use client";

import { useSyncExternalStore } from "react";

/**
 * The models picked for comparison, kept in sessionStorage as "category/slug"
 * entries. Every compare button on a page reads the same store, so adding one
 * model updates the count on all of them. When storage is blocked the store
 * reports `null` and the buttons fall back to plain links.
 */
const KEY = "virgo-compare";
const UNAVAILABLE = "\u0000";
export const COMPARE_MAX = 3;

const listeners = new Set<() => void>();

function readRaw(): string {
  try {
    return window.sessionStorage.getItem(KEY) ?? "";
  } catch {
    return UNAVAILABLE;
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}

const ENTRY = /^[a-z0-9-]+\/[a-z0-9-]+$/;

function parse(raw: string): string[] | null {
  if (raw === UNAVAILABLE) return null;
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string" && ENTRY.test(v)).slice(0, COMPARE_MAX)
      : [];
  } catch {
    return [];
  }
}

/** `null` until hydrated, or when sessionStorage cannot be used. */
export function useCompareList(): string[] | null {
  const raw = useSyncExternalStore(subscribe, readRaw, () => UNAVAILABLE);
  return parse(raw);
}

export function saveCompareList(list: string[]): boolean {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(list.slice(0, COMPARE_MAX)));
  } catch {
    return false;
  }
  listeners.forEach((fn) => fn());
  return true;
}

/** Adds a model, keeping one category and at most three models (the oldest drops off). */
export function withModel(list: string[], entry: string): string[] {
  const category = entry.split("/")[0];
  const same = list.filter((e) => e.split("/")[0] === category && e !== entry);
  return [...same, entry].slice(-COMPARE_MAX);
}

export function compareHref(list: string[]): string {
  return list.length ? `/compare?models=${list.join(",")}` : "/compare";
}
