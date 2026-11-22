import { breadcrumbLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";

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
      <PageHero crumbs={crumbs} title={title} size="lg" lede={lede}>
        <p className="label">
          Last updated <time dateTime={LEGAL_UPDATED.iso}>{LEGAL_UPDATED.text}</time>
        </p>
      </PageHero>
      <div className="wrap mt-12 md:mt-16">{children}</div>
    </>
  );
}

/** One section: heading on the left, plain text on the right, a hairline above. */
export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="reveal rule-t grid gap-3 py-8 md:grid-cols-12 md:gap-8 md:py-10">
      <h2 className="display display-sm md:col-span-4">{title}</h2>
      <div className="prose-virgo text-[1.0625rem] leading-relaxed md:col-span-7">{children}</div>
    </section>
  );
}
