import type { Spec } from "@/lib/catalogue";

/**
 * Specification block styled after the rating plate riveted to an appliance:
 * ruled rows and a rivet in each corner. Every row uses the same fixed label
 * track, so labels and values line up down the whole plate.
 */
export function SpecPlate({
  title,
  specs,
  note,
  headingLevel = "h2",
}: {
  title: string;
  specs: Spec[];
  note?: string;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <section aria-label={title} className="relative border-[1.5px] border-ink bg-cell">
      <Rivet className="left-2 top-2" />
      <Rivet className="right-2 top-2" />
      <Rivet className="bottom-2 left-2" />
      <Rivet className="bottom-2 right-2" />

      <header className="flex items-baseline justify-between gap-4 border-b-[1.5px] border-ink px-6 py-4 sm:px-8">
        <Heading className="display display-sm">{title}</Heading>
        <p className="label">Virgo</p>
      </header>

      <dl className="px-6 sm:px-8">
        {specs.map((s) => (
          <div
            key={s.label}
            className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-line py-3 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)]"
          >
            <dt className="label">{s.label}</dt>
            <dd className="font-medium tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      {note ? <p className="border-t border-line px-6 py-3 text-sm text-steel sm:px-8">{note}</p> : null}
    </section>
  );
}

function Rivet({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={`absolute h-1.5 w-1.5 rounded-full border border-ink bg-paper ${className}`} />
  );
}
