import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { EnquiryForm } from "@/components/enquiry/enquiry-form";
import { Trail } from "@/components/enquiry/trail";
import { hasEmail, hasPhone, hasWhatsApp, site, telHref, whatsappHref } from "@/content/site";
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
  const location = c.address.length > 0 ? c.address : [`${site.plantArea}, ${site.state}`];

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <div className="wrap pt-10 md:pt-16">
        <Trail crumbs={crumbs} />
        <h1 className="display display-lg mt-4">Contact {site.name}</h1>
        <p className="lede mt-5">
          Send us a message with the form on this page. If you want to stock our products or buy in quantity, the
          trade forms below ask for the details we need.
        </p>

        <div className="mt-12 grid gap-14 md:mt-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <section aria-labelledby="details-heading" className="rule-ink-t pt-5">
              <h2 id="details-heading" className="display display-sm">
                Where we are
              </h2>
              <dl className="mt-4">
                <Row label="Location">
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
                    <a href={telHref()} className="font-semibold underline">
                      {c.phone}
                    </a>
                  </Row>
                ) : null}
                {hasWhatsApp() ? (
                  <Row label="WhatsApp">
                    <a href={whatsappHref(`Hello ${site.name}, I have an enquiry.`)} className="font-semibold underline">
                      Message us on WhatsApp
                    </a>
                  </Row>
                ) : null}
                {hasEmail() ? (
                  <Row label="Email">
                    <a href={`mailto:${c.email}`} className="font-semibold underline">
                      {c.email}
                    </a>
                  </Row>
                ) : null}
                {c.hours ? <Row label="Hours">{c.hours}</Row> : null}
              </dl>
            </section>

            <section aria-labelledby="trade-heading" className="mt-14 rule-ink-t pt-5">
              <h2 id="trade-heading" className="display display-sm">
                Trade forms
              </h2>
              <ul className="mt-4">
                {tradeForms.map((f) => (
                  <li key={f.href} className="border-b border-line py-4">
                    <Link href={f.href} className="link-arrow">
                      {f.title}
                    </Link>
                    <p className="mt-1.5 text-steel">{f.line}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <EnquiryForm type="general" heading="Send us a message" />
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b border-line py-3.5">
      <dt className="label">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
