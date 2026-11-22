import type { Spec } from "@/lib/catalogue";

/**
 * Specification block styled after the rating plate riveted to an appliance:
 * mono labels, ruled rows, a rivet in each corner.
 */
export function SpecPlate({ title, specs, note }: { title: string; specs: Spec[]; note?: string }) {
  return (
    <section aria-label={title} className="relative border-[1.5px] border-ink bg-white">
      <Rivet className="left-2 top-2" />
      <Rivet className="right-2 top-2" />
      <Rivet className="bottom-2 left-2" />
      <Rivet className="bottom-2 right-2" />

      <header className="flex items-baseline justify-between gap-4 border-b-[1.5px] border-ink px-6 py-3.5 sm:px-8">
        <h2 className="label !text-ink">{title}</h2>
        <p className="label">Virgo</p>
      </header>

      <dl className="px-6 sm:px-8">
        {specs.map((s) => (
          <div
            key={s.label}
            className="grid grid-cols-[minmax(7rem,2fr)_3fr] items-baseline gap-4 border-b border-line py-3 last:border-b-0"
          >
            <dt className="label">{s.label}</dt>
            <dd className="font-medium">{s.value}</dd>
          </div>
        ))}
      </dl>

      {note ? (
        <p className="border-t border-line px-6 py-3 text-sm text-steel sm:px-8">{note}</p>
      ) : null}
    </section>
  );
}

function Rivet({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-1.5 w-1.5 rounded-full border border-ink bg-paper ${className}`}
    />
  );
}
