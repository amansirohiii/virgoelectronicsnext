import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { PageHero } from "@/components/page-hero";
import { groupUnderline } from "@/components/catalogue/underline";
import { addressLines, hasEmail, hasPhone, hasWhatsApp, site, telHref, whatsappHref } from "@/content/site";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

const PATH = "/contact";
const crumbs = [
  { name: "Home", path: "/" },
  { name: "Contact", path: PATH },
];

export const metadata = pageMeta({
  title: "Contact",
  description: `Contact ${site.name}, ${site.plantArea}, ${site.state}. Send a message, or use the dealer, distributor and bulk order forms.`,
  path: PATH,
});

const tradeForms = [
  {
    href: "/partners/become-a-dealer",
    title: "Become a dealer",
    line: "For shops that sell appliances to customers.",
  },
  {
    href: "/partners/become-a-distributor",
    title: "Become a distributor",
    line: "For firms that supply shops across a district or an area.",
  },
  {
    href: "/bulk-orders",
    title: "Bulk orders",
    line: "For schools, offices, factories and sites buying in quantity.",
  },
];

export default function ContactPage() {
  const c = site.contact;
  const location = addressLines();

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <PageHero
        crumbs={crumbs}
        title={`Contact ${site.name}`}
        size="lg"
        lede="Send us a message here, or use a trade form below to stock or bulk-buy our products."
      />

      <div className="wrap mt-12 grid gap-x-14 gap-y-12 md:mt-16 lg:grid-cols-12">
        <section
          aria-labelledby="details-heading"
          className="rise lg:order-2 lg:col-span-4 lg:col-start-9"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          <div className="cell p-6 sm:p-7 lg:sticky lg:top-28">
            <h2 id="details-heading" className="display display-sm">
              Where we are
            </h2>
            <dl className="mt-4">
              <Row label="Address">
                <address className="not-italic">
                  {location.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </Row>
              {hasPhone() ? (
                <Row label="Phone">
                  <a href={telHref()} className="font-semibold underline underline-offset-4">
                    {c.phone}
                  </a>
                </Row>
              ) : null}
              {hasWhatsApp() ? (
                <Row label="WhatsApp">
                  <a
                    href={whatsappHref(`Hello ${site.name}, I have an enquiry.`)}
                    className="font-semibold underline underline-offset-4"
                  >
                    Message us
                  </a>
                </Row>
              ) : null}
              {hasEmail() ? (
                <Row label="Email">
                  <a href={`mailto:${c.email}`} className="break-all font-semibold underline underline-offset-4">
                    {c.email}
                  </a>
                </Row>
              ) : null}
              {c.hours ? <Row label="Hours">{c.hours}</Row> : null}
              {c.replyWithin ? <Row label="Reply">Within {c.replyWithin}</Row> : null}
            </dl>
          </div>
        </section>

        <div className="rise lg:order-1 lg:col-span-7" style={{ "--i": 3 } as React.CSSProperties}>
          <EnquiryForm type="general" heading="Send us a message" />
        </div>
      </div>

      <section aria-labelledby="trade-heading" className="wrap mt-20 md:mt-28">
        <h2 id="trade-heading" className="display display-md reveal">
          Trade forms
        </h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {tradeForms.map((f, i) => (
            <li key={f.href} className="reveal" style={{ "--i": i } as React.CSSProperties}>
              <Link href={f.href} className="group cell flex h-full flex-col p-6 transition-colors hover:border-ink">
                <h3 className="display display-sm">
                  <span className={groupUnderline}>{f.title}</span>
                </h3>
                <p className="mt-2 text-steel">{f.line}</p>
                <span aria-hidden="true" className="mt-auto self-start pt-6 text-xl transition-transform duration-200 ease-out-quart group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-t border-line py-3">
      <dt className="label">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
