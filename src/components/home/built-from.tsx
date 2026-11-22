import { type Product, getCategories, getProducts } from "@/lib/catalogue";
import { stagger } from "./stagger";

const and = (parts: string[]) =>
  parts.length < 2 ? (parts[0] ?? "") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;

/** "All 6 ceiling fans and the Exhaust Fan": where a fact applies, grouped by category. */
function where(list: Product[]): string {
  const parts = getCategories().flatMap((c) => {
    const hits = list.filter((p) => p.category === c.slug);
    if (!hits.length) return [];
    const total = getProducts(c.slug).length;
    if (hits.length === total && total > 1) return [`all ${total} ${c.name.toLowerCase()}`];
    return hits.map((p) => `the ${p.name}`);
  });
  const text = and(parts);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const has = (p: Product, label: string, needle: string) =>
  p.specs.some((s) => s.label === label && s.value.toLowerCase().includes(needle));

export function BuiltFrom() {
  const all = getProducts();
  const coolers = getProducts("coolers");
  const steel = coolers.filter((c) => c.facts.body === "Galvanized steel").length;
  const honeycomb = coolers.filter((c) => c.facts.pad === "Honeycomb").length;
  const grass = coolers.filter((c) => c.facts.pad === "Grass").length;

  const facts = [
    { fact: "Full copper winding", where: where(all.filter((p) => has(p, "Winding", "copper"))) },
    { fact: "Double ball bearing", where: where(all.filter((p) => has(p, "Bearing", "double ball"))) },
    { fact: "Heavy galvanized steel body, powder coated", where: `${steel} of our ${coolers.length} coolers` },
    { fact: "Honeycomb or grass pads", where: `Honeycomb on ${honeycomb} coolers, grass on ${grass}` },
  ];

  return (
    <section className="wrap mt-20 md:mt-28" aria-labelledby="build-heading">
      <h2 id="build-heading" className="display display-lg reveal">
        What they are built from
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
        {facts.map((f, i) => (
          <li key={f.fact} className="rule-ink-t reveal min-w-0 pt-5" style={stagger(i)}>
            <p className="display display-sm">{f.fact}</p>
            <p className="label mt-3">{f.where}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
