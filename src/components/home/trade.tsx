import Link from "next/link";
import { site } from "@/content/site";
import { stagger } from "./stagger";

const routes = [
  {
    title: "I run a shop",
    text: "You sell appliances and want to stock Virgo.",
    href: "/partners/become-a-dealer",
    cta: "Become a dealer",
    red: true,
  },
  {
    title: "I supply shops",
    text: "You supply shops and want Virgo for your area.",
    href: "/partners/become-a-distributor",
    cta: "Become a distributor",
    red: false,
  },
  {
    title: "I am buying in quantity",
    text: "A quote on named models for a school, office, hostel or site.",
    href: "/bulk-orders",
    cta: "Ask for a bulk quote",
    red: false,
  },
];

/** Sits straight under the model strip; a hairline separates the two graphite bands. */
export function Trade() {
  const facts = [
    site.contact.replyWithin ? `Replies within ${site.contact.replyWithin}` : "",
    site.statements.noApplicationFee ? "No fee to apply" : "",
  ].filter(Boolean);

  return (
    <section className="on-dark border-t border-graphite-line" aria-labelledby="trade-heading">
      <div className="wrap py-16 md:py-24">
        <div className="reveal">
          <h2 id="trade-heading" className="display display-lg">
            For dealers and distributors
          </h2>
          <p className="lede mt-4">Send us your details and we call you back about the range, rates and supply.</p>
        </div>

        <ul className="mt-10 grid gap-y-8 md:grid-cols-3 md:gap-x-8 md:gap-y-0">
          {routes.map((r, i) => (
            <li
              key={r.href}
              className="rule-t reveal grid gap-3 pt-6 md:row-span-3 md:grid-rows-subgrid md:gap-0"
              style={stagger(i + 1)}
            >
              <h3 className="display display-sm">{r.title}</h3>
              <p className="text-[#c3c7cc] md:mt-2">{r.text}</p>
              <div className="mt-2 md:mt-5">
                <Link href={r.href} className={`btn ${r.red ? "btn-red" : "btn-line"}`}>
                  {r.cta}
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {facts.length ? (
          <ul className="reveal mt-12 flex flex-wrap gap-x-10 gap-y-2 font-semibold" style={stagger(4)}>
            {facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
