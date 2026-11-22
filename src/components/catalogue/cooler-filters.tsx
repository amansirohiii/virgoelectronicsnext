"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { VisibleContext } from "./visibility";

export type CoolerFilterItem = {
  /** "coolers/slug", the id used by `<Show>` */
  id: string;
  litres: number;
  pad: "Honeycomb" | "Grass";
  steel: boolean;
};

type Band = { key: string; label: string; min: number; max: number; count: number };

/**
 * Up to three tank-size bands with roughly equal numbers of models, never
 * splitting models of the same size across two bands. Labels use the real
 * smallest and largest tank in each band.
 */
function tankBands(items: CoolerFilterItem[]): Band[] {
  const counts = new Map<number, number>();
  for (const it of items) counts.set(it.litres, (counts.get(it.litres) ?? 0) + 1);
  const sizes = [...counts.keys()].sort((a, b) => a - b);
  const target = items.length / 3;

  const groups: number[][] = [];
  let current: number[] = [];
  let n = 0;
  for (const size of sizes) {
    const c = counts.get(size) ?? 0;
    if (current.length && n + c > target && groups.length < 2) {
      groups.push(current);
      current = [];
      n = 0;
    }
    current.push(size);
    n += c;
  }
  if (current.length) groups.push(current);

  return groups.map((g) => {
    const min = g[0] ?? 0;
    const max = g[g.length - 1] ?? min;
    return {
      key: `${min}-${max}`,
      label: min === max ? `${min} L` : `${min} to ${max} L`,
      min,
      max,
      count: g.reduce((sum, s) => sum + (counts.get(s) ?? 0), 0),
    };
  });
}

export function CoolerFilters({ items, children }: { items: CoolerFilterItem[]; children: ReactNode }) {
  const bands = useMemo(() => tankBands(items), [items]);
  const [tank, setTank] = useState("all");
  const [pad, setPad] = useState<"all" | "Honeycomb" | "Grass">("all");
  const [steel, setSteel] = useState(false);
  const uid = useId();

  const active = tank !== "all" || pad !== "all" || steel;
  const visible = useMemo(() => {
    if (!active) return null;
    const band = bands.find((b) => b.key === tank);
    return new Set(
      items
        .filter((it) => !band || (it.litres >= band.min && it.litres <= band.max))
        .filter((it) => pad === "all" || it.pad === pad)
        .filter((it) => !steel || it.steel)
        .map((it) => it.id),
    );
  }, [active, bands, items, tank, pad, steel]);

  const shown = visible ? visible.size : items.length;
  const padCount = (p: "Honeycomb" | "Grass") => items.filter((it) => it.pad === p).length;
  const steelCount = items.filter((it) => it.steel).length;

  const reset = () => {
    setTank("all");
    setPad("all");
    setSteel(false);
  };

  return (
    <>
      <div className="rule-ink-t grid gap-x-10 gap-y-5 pt-5 lg:grid-cols-[auto_auto_auto_1fr] lg:items-end">
        <fieldset>
          <legend className="label mb-2">Tank</legend>
          <div className="flex flex-wrap gap-2">
            <Choice name={`${uid}-tank`} value="all" checked={tank === "all"} onChange={setTank}>
              All
            </Choice>
            {bands.map((b) => (
              <Choice key={b.key} name={`${uid}-tank`} value={b.key} checked={tank === b.key} onChange={setTank}>
                {b.label} <span className="opacity-70">({b.count})</span>
              </Choice>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label mb-2">Pad</legend>
          <div className="flex flex-wrap gap-2">
            <Choice name={`${uid}-pad`} value="all" checked={pad === "all"} onChange={() => setPad("all")}>
              All
            </Choice>
            {(["Honeycomb", "Grass"] as const).map((p) =>
              padCount(p) ? (
                <Choice key={p} name={`${uid}-pad`} value={p} checked={pad === p} onChange={() => setPad(p)}>
                  {p} <span className="opacity-70">({padCount(p)})</span>
                </Choice>
              ) : null,
            )}
          </div>
        </fieldset>

        {steelCount > 0 && steelCount < items.length ? (
          <fieldset>
            <legend className="label mb-2">Body</legend>
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 border-[1.5px] border-ink px-3.5 font-semibold has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink">
              <input
                type="checkbox"
                checked={steel}
                onChange={(e) => setSteel(e.target.checked)}
                className="h-4 w-4 accent-white"
              />
              Steel body only <span className="opacity-70">({steelCount})</span>
            </label>
          </fieldset>
        ) : null}

        <div className="flex min-h-11 flex-wrap items-center gap-x-5 gap-y-1 lg:justify-end">
          <p aria-live="polite" aria-atomic="true" className="label !text-ink">
            {active ? `Showing ${shown} of ${items.length} coolers` : `All ${items.length} coolers`}
          </p>
          {active ? (
            <button type="button" onClick={reset} className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {visible && shown === 0 ? (
        <div className="rule-t mt-6 pt-6">
          <p className="display display-sm">No cooler has all of those.</p>
          <p className="mt-2 text-steel">Clear a filter to see more of the range.</p>
          <button type="button" onClick={reset} className="btn btn-line mt-4">
            Clear filters
          </button>
        </div>
      ) : null}

      <VisibleContext.Provider value={visible}>{children}</VisibleContext.Provider>
    </>
  );
}

function Choice({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="relative flex min-h-11 cursor-pointer items-center border-[1.5px] border-ink px-3.5 font-semibold whitespace-nowrap hover:bg-white has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <span>{children}</span>
    </label>
  );
}
