import type { Ref } from "react";
import type { EnquiryType } from "@/components/enquiry/enquiry-form";
import { hasPhone, hasWhatsApp, site, telHref, whatsappHref } from "@/content/site";
import type { EnquiryState, FormValues } from "@/lib/enquiry-options";

const TYPE_NAMES: Record<EnquiryType, string> = {
  dealer: "dealer",
  distributor: "distributor",
  bulk: "bulk order",
  product: "product",
  general: "general",
};

const panel = "mb-8 border-l-4 border-red-deep bg-white p-5";

/** Moves focus to a field from the error summary. Groups focus their checked or first input. */
function focusField(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const target =
    el instanceof HTMLFieldSetElement
      ? (el.querySelector<HTMLInputElement>("input:checked") ?? el.querySelector<HTMLInputElement>("input"))
      : el;
  target?.focus({ preventScroll: true });
  el.scrollIntoView({ block: "center" });
}

/** Everything to fix, as links to the fields. Used for browser and server errors alike. */
export function ErrorSummary({
  errors,
  keys,
  fieldId,
  ref,
}: {
  errors: Record<string, string>;
  /** Fields with an error, in display order */
  keys: string[];
  fieldId: (key: string) => string;
  ref?: Ref<HTMLDivElement>;
}) {
  const headingId = fieldId("summary");
  return (
    <div ref={ref} tabIndex={-1} role="alert" aria-labelledby={headingId} className={panel}>
      <p id={headingId} className="font-semibold">
        {keys.length === 1 ? "One thing to fix before sending:" : `${keys.length} things to fix before sending:`}
      </p>
      <ul className="mt-3 space-y-1.5">
        {keys.map((k) => (
          <li key={k}>
            <a
              href={`#${fieldId(k)}`}
              className="font-semibold text-red-deep underline"
              onClick={(e) => {
                e.preventDefault();
                focusField(fieldId(k));
              }}
            >
              {errors[k]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Blocked({ message, ref }: { message: string; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} tabIndex={-1} role="alert" className={panel}>
      <p className="font-semibold">{message}</p>
    </div>
  );
}

export function Undelivered({ type, values, ref }: { type: EnquiryType; values: FormValues; ref?: Ref<HTMLDivElement> }) {
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const city = typeof values.city === "string" ? values.city.trim() : "";
  const waText = [
    `Hello ${site.name}, I tried to send a ${TYPE_NAMES[type]} enquiry on your website.`,
    name ? `Name: ${name}.` : "",
    city ? `City: ${city}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const phone = hasPhone();
  const whatsapp = hasWhatsApp();

  return (
    <div ref={ref} tabIndex={-1} role="alert" className={panel}>
      <p className="font-semibold">We could not send this from the website just now. Your details are still in the form.</p>
      {phone || whatsapp ? (
        <ul className="mt-3 space-y-1.5">
          {phone ? (
            <li>
              Call us on{" "}
              <a href={telHref()} className="font-semibold underline">
                {site.contact.phone}
              </a>
            </li>
          ) : null}
          {whatsapp ? (
            <li>
              <a href={whatsappHref(waText)} className="font-semibold underline">
                Send your enquiry on WhatsApp
              </a>
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="mt-2">Please try again in a few minutes.</p>
      )}
    </div>
  );
}

export function Delivered({
  state,
  ref,
}: {
  state: Extract<EnquiryState, { status: "delivered" }>;
  ref?: Ref<HTMLDivElement>;
}) {
  const within = site.contact.replyWithin;
  return (
    <div ref={ref} tabIndex={-1} role="status" className="rule-ink-t bg-white p-6 sm:p-8">
      <p className="display display-md">We have your enquiry.</p>
      <p className="mt-4 text-lg">
        We will call you on <strong className="whitespace-nowrap">{state.mobile}</strong>
        {within ? ` within ${within}` : ""}.
      </p>
      <p className="mt-5">
        <span className="label block">Your reference</span>
        <span className="text-xl font-semibold tabular-nums">{state.reference}</span>
      </p>
      {hasWhatsApp() ? (
        <a
          href={whatsappHref(`Hello ${site.name}, I sent an enquiry on your website. My reference is ${state.reference}.`)}
          className="btn btn-line mt-6"
        >
          Message us on WhatsApp
        </a>
      ) : null}
    </div>
  );
}
