import Link from "next/link";
import { hasPhone, hasWhatsApp, telHref, whatsappHref } from "@/content/site";
import { dealerCta } from "@/content/navigation";
import { ArrowIcon, PhoneIcon, WhatsAppIcon } from "@/components/shell/icons";

/**
 * Fixed bar on phones and tablets: the fastest ways to reach the company.
 * Call and WhatsApp appear only when the numbers exist in `content/site.ts`.
 */
export function ContactBar() {
  return (
    <div
      data-contact-bar
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-16px_rgba(22,24,27,0.35)] lg:hidden"
    >
      <div className="flex divide-x divide-line">
        {hasPhone() ? (
          <a href={telHref()} className="flex min-h-14 flex-1 items-center justify-center gap-2 font-semibold">
            <PhoneIcon className="size-5" />
            Call
          </a>
        ) : null}
        {hasWhatsApp() ? (
          <a
            href={whatsappHref("Hello Virgo Electronics, I have an enquiry.")}
            className="flex min-h-14 flex-1 items-center justify-center gap-2 font-semibold"
          >
            <WhatsAppIcon className="size-5" />
            WhatsApp
          </a>
        ) : null}
        <Link
          href={dealerCta.href}
          className="flex min-h-14 flex-[1.4] items-center justify-center gap-2 bg-red font-semibold text-white transition-colors active:bg-red-deep"
        >
          {dealerCta.label}
          <ArrowIcon className="size-5" />
        </Link>
      </div>
    </div>
  );
}
