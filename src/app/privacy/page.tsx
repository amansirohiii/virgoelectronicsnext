import Link from "next/link";
import { hasEmail, site } from "@/content/site";
import { pageMeta } from "@/lib/seo";
import { LegalPage, LegalSection } from "@/components/company/legal-page";

export const metadata = pageMeta({
  title: "Privacy",
  description: `What ${site.name} collects through the enquiry forms on this site, what we use it for, the visit statistics we keep and how to ask us to delete your details.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  const analytics = site.analytics.gaId.length > 0;

  return (
    <LegalPage
      title="Privacy"
      path="/privacy"
      lede="This page explains what we collect when you send an enquiry on this site, what we do with it and what we do not do with it."
    >
      <LegalSection n={1} title="What we collect">
        <p>
          The enquiry forms ask for your name, mobile number and city. Some forms also ask for things
          like your shop or business name, the products you are interested in, or a message. We collect
          only what you type into the form and send.
        </p>
        <p>We do not ask for payment details, and you do not need an account to use this site.</p>
      </LegalSection>

      <LegalSection n={2} title="What we use it for">
        <p>
          We use your details only to reply to your enquiry, by phone, WhatsApp or email.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Where it goes">
        <p>
          When you send a form, your details go to our own enquiry sheet and our own email inbox.
        </p>
      </LegalSection>

      <LegalSection n={4} title="What we do not do">
        <p>
          We do not sell your details. We do not share them with anyone for marketing, and we do not add
          you to a mailing list.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Visit statistics">
        {analytics ? (
          <p>
            We use Google Analytics and Vercel Speed Insights to count visits and see which pages are
            read and how quickly they load. Google Analytics sets cookies in your browser to do this.
          </p>
        ) : (
          <p>
            We use Vercel Speed Insights to see how quickly pages load.
          </p>
        )}
      </LegalSection>

      <LegalSection n={6} title="Seeing or deleting your details">
        <p>
          To ask what details we hold about you, or to ask us to delete them, write to us from the{" "}
          <Link href="/contact" className="underline hover:no-underline">
            contact page
          </Link>
          {hasEmail() ? (
            <>
              {" "}
              or email{" "}
              <a href={`mailto:${site.contact.email}`} className="underline hover:no-underline">
                {site.contact.email}
              </a>
            </>
          ) : null}
          . Give the name and mobile number you used so we can find your enquiry.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Changes to this page">
        <p>
          If we change how we handle enquiries, we will update this page and the date at the top.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
