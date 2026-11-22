import Link from "next/link";
import { site } from "@/content/site";
import { pageMeta } from "@/lib/seo";
import { LegalPage, LegalSection } from "@/components/company/legal-page";

export const metadata = pageMeta({
  title: "Terms of use",
  description: `The terms for using the ${site.name} website: how to read the product information and pictures, why there are no prices or online orders, and who owns the ${site.brand} name and logo.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      path="/terms"
      lede="These are the terms for using this website. By using it, you agree to them."
    >
      <LegalSection title="Product information">
        <p>
          We give the product details on this site in good faith, from our own specifications. Products
          can change, so a model, a specification or a colour may differ from what is shown here.
        </p>
        <p>
          Before you order, confirm the details of the model you want with us or with your{" "}
          {site.brand} dealer.
        </p>
      </LegalSection>

      <LegalSection title="Pictures and colours">
        <p>
          The pictures show the product. Colours can look different from one screen to another, so the
          product in your hand may not match the shade on your screen exactly.
        </p>
        <p>
          Pictures of a product in a room or a shop are illustrations made from our product
          photographs. They show how the product looks in use and are not photographs of a
          customer&apos;s home or shop.
        </p>
      </LegalSection>

      <LegalSection title="No online sales or prices">
        <p>
          This site does not sell anything online and does not show prices. Sending an enquiry does not
          place an order. To buy, ask a {site.brand} dealer or send us an enquiry and we will reply.
        </p>
      </LegalSection>

      <LegalSection title="Names and logo">
        <p>
          The {site.name} and {site.brand} names and the {site.brand} logo belong to {site.name}. Please
          do not use them without asking us first.
        </p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          If anything on this page is unclear, write to us from the{" "}
          <Link href="/contact" className="underline hover:no-underline">
            contact page
          </Link>
          . How we handle the details you send us is set out on the{" "}
          <Link href="/privacy" className="underline hover:no-underline">
            privacy page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
