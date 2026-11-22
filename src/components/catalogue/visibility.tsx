"use client";

import { createContext, createElement, useContext, type CSSProperties, type ReactNode } from "react";

/**
 * Shared by the range search and the cooler filters. The server renders every
 * card and table row; a filter only decides which ones are hidden. The set holds
 * the ids that are visible, and `null` means "show everything".
 */
export const VisibleContext = createContext<Set<string> | null>(null);

type Tag = "li" | "tr" | "div" | "section";

export function Show({
  id,
  as = "div",
  className,
  style,
  children,
}: {
  id: string;
  as?: Tag;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const visible = useContext(VisibleContext);
  const hidden = visible !== null && !visible.has(id);
  return createElement(as, { className, style, hidden }, children);
}

/** Visible when at least one of `ids` is visible, e.g. a category section. */
export function ShowAny({
  ids,
  as = "div",
  className,
  id,
  children,
}: {
  ids: string[];
  as?: Tag;
  className?: string;
  /** DOM id for in-page links */
  id?: string;
  children: ReactNode;
}) {
  const visible = useContext(VisibleContext);
  const hidden = visible !== null && !ids.some((i) => visible.has(i));
  return createElement(as, { className, hidden, id }, children);
}
