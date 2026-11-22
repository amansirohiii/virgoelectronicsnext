import { breadcrumbLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { Trail } from "@/components/company/trail";

/** Date shown on the privacy and terms pages. Change it whenever either page's wording changes. */
export const LEGAL_UPDATED = { iso: "2026-11-22", text: "22 November 2026" };

/** Shared shell for the privacy and terms pages: trail, title, date, then ruled sections. */
export function LegalPage({
  title,
  path,
  lede,
  children,
}: {
  title: string;
  path: string;
  lede: string;
  children: React.ReactNode;
}) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: title, path },
  ];
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <div className="wrap pt-10 md:pt-16">
        <Trail crumbs={crumbs} />
        <h1 className="display display-lg mt-4">{title}</h1>
        <p className="label mt-5">
          Last updated <time dateTime={LEGAL_UPDATED.iso}>{LEGAL_UPDATED.text}</time>
        </p>
        <p className="lede mt-5">{lede}</p>
        <div className="mt-14 md:mt-20">{children}</div>
      </div>
    </>
  );
}

/** One numbered section: heading on the left, plain text on the right, a hairline above. */
export function LegalSection({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rule-t grid gap-4 py-8 md:grid-cols-12 md:gap-8 md:py-10">
      <h2 className="display display-sm md:col-span-4">
        <span className="label mb-2 block tabular-nums" aria-hidden="true">
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="prose-virgo md:col-span-8">{children}</div>
    </section>
  );
}
