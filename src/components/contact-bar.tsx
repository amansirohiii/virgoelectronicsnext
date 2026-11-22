import Link from "next/link";
import { hasPhone, hasWhatsApp, telHref, whatsappHref } from "@/content/site";
import { dealerCta } from "@/content/navigation";

/**
 * Fixed bar on phones: the fastest ways to reach the company.
 * Call and WhatsApp appear only when the numbers exist in `content/site.ts`.
 */
export function ContactBar() {
  return (
    <div data-contact-bar className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex divide-x divide-line">
        {hasPhone() ? (
          <a href={telHref()} className="flex min-h-14 flex-1 items-center justify-center font-semibold">
            Call
          </a>
        ) : null}
        {hasWhatsApp() ? (
          <a
            href={whatsappHref("Hello Virgo Electronics, I have an enquiry.")}
            className="flex min-h-14 flex-1 items-center justify-center font-semibold"
          >
            WhatsApp
          </a>
        ) : null}
        <Link
          href={dealerCta.href}
          className="flex min-h-14 flex-[1.4] items-center justify-center bg-red font-semibold text-white"
        >
          {dealerCta.label}
        </Link>
      </div>
    </div>
  );
}
