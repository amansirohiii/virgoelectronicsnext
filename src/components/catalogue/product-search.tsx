"use client";

import { useId, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { VisibleContext } from "./visibility";

export type SearchItem = {
  /** "category/slug", the id used by `<Show>` */
  id: string;
  /** Name, kind, category, specs and highlights, one entry per field */
  fields: string[];
};

const spaced = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * A model matches when the whole query, with spaces and dashes removed, appears
 * inside one field ("cg01", "90l", "1200mm"), or when every word of the query
 * starts a word somewhere in its text ("steel 90", "copper").
 */
function matcher(items: SearchItem[]) {
  const index = items.map((item) => ({
    id: item.id,
    words: spaced(item.fields.join(" | ")),
    parts: item.fields.map(compact),
  }));
  return (query: string): Set<string> | null => {
    const whole = compact(query);
    if (!whole) return null;
    const tokens = spaced(query).trim().split(" ").filter(Boolean);
    const hits = index.filter(
      (it) => it.parts.some((p) => p.includes(whole)) || tokens.every((t) => it.words.includes(` ${t}`)),
    );
    return new Set(hits.map((h) => h.id));
  };
}

const noSubscribe = () => () => {};
const readQueryParam = () => (new URLSearchParams(window.location.search).get("q") ?? "").slice(0, 80);

export function ProductSearch({ items, children }: { items: SearchItem[]; children: ReactNode }) {
  const inputId = useId();
  const hintId = useId();
  // Start from ?q= so a search can be shared or linked from elsewhere on the site.
  // The page is static, so the URL is read on the client only.
  const fromUrl = useSyncExternalStore(noSubscribe, readQueryParam, () => "");
  const [typed, setTyped] = useState<string | null>(null);
  const query = typed ?? fromUrl;
  const match = useMemo(() => matcher(items), [items]);
  const visible = useMemo(() => match(query), [match, query]);

  function update(next: string) {
    setTyped(next);
    const url = new URL(window.location.href);
    if (next.trim()) url.searchParams.set("q", next);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.pathname + url.search);
  }

  const count = visible ? visible.size : items.length;
  const status = visible
    ? count === 0
      ? `No model matches “${query.trim()}”`
      : `${count} ${count === 1 ? "model matches" : "models match"} “${query.trim()}”`
    : `${count} models`;

  return (
    <>
      <div role="search" className="sticky top-16 z-20 border-b border-line bg-paper py-4 md:top-[4.5rem]">
        <label htmlFor={inputId} className="field-label">
          Search the range
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            type="search"
            className="input max-w-xl"
            value={query}
            onChange={(e) => update(e.target.value)}
            placeholder="Model, size or part, e.g. CG-01, 90 L, copper"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            aria-describedby={hintId}
          />
          {query ? (
            <button type="button" onClick={() => update("")} className="btn btn-line shrink-0 px-4">
              Clear
            </button>
          ) : null}
        </div>
        <p id={hintId} aria-live="polite" aria-atomic="true" className="label mt-2.5">
          {status}
        </p>
      </div>

      <VisibleContext.Provider value={visible}>{children}</VisibleContext.Provider>

      {visible && count === 0 ? (
        <div className="rule-ink-t mt-10 pt-6">
          <p className="display display-sm">Nothing in the range matches that.</p>
          <p className="mt-3 max-w-[38em] text-steel">
            Try a model name such as Sumo or Era, a size such as 125 L or 1200 mm, or a word such as steel,
            copper or honeycomb.
          </p>
          <button type="button" onClick={() => update("")} className="btn btn-line mt-5">
            Show all models
          </button>
        </div>
      ) : null}
    </>
  );
}
