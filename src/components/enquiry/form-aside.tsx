import type { ReactNode } from "react";
import { hasPhone, hasWhatsApp, site, telHref, whatsappHref } from "@/content/site";

/**
 * Side panel beside an enquiry form: what happens after sending, the reply time
 * when it is set, and call / WhatsApp when the numbers exist. Sticky on wide screens.
 */
export function FormAside({
  steps,
  children,
}: {
  steps: readonly string[];
  /** One short line under the panel, such as a link to the other form */
  children?: ReactNode;
}) {
  const within = site.contact.replyWithin;
  const phone = hasPhone();
  const whatsapp = hasWhatsApp();

  return (
    <aside aria-labelledby="next-heading" className="lg:sticky lg:top-28 lg:self-start">
      <div className="cell p-6 sm:p-7">
        <h2 id="next-heading" className="display display-sm">
          What happens next
        </h2>
        <ol className="mt-5">
          {steps.map((step, i) => (
            <li
              key={step}
              className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-x-3 border-t border-line py-3"
            >
              <span aria-hidden="true" className="display text-2xl">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        {within ? <p className="border-t border-line pt-4 font-semibold">We reply within {within}.</p> : null}
        {phone || whatsapp ? (
          <div className="mt-5 flex flex-col gap-3">
            {phone ? (
              <a href={telHref()} className="btn btn-line">
                Call {site.contact.phone}
              </a>
            ) : null}
            {whatsapp ? (
              <a href={whatsappHref(`Hello ${site.name}, I have an enquiry.`)} className="btn btn-line">
                Message us on WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
      {children ? <div className="mt-5 text-steel">{children}</div> : null}
    </aside>
  );
}
