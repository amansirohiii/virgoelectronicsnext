"use client";

/**
 * Enquiry form. One component for every enquiry on the site.
 *
 * The props below are the fixed interface other pages rely on.
 *
 * Delivery rule: the confirmation panel appears only when the server action
 * reports `delivered`, which it does only after the company's webhook confirmed
 * it stored the enquiry. Every other outcome keeps the typed details in the form.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useId, useRef } from "react";
import { submitEnquiry } from "@/app/actions/enquiry";
import { hasPhone, hasWhatsApp, site, telHref, whatsappHref } from "@/content/site";
import {
  BUYER_TYPES,
  CATEGORY_NAMES,
  ENQUIRY_FIELDS,
  INDIAN_STATES,
  YEARS_IN_TRADE,
  initialEnquiryState,
  type EnquiryState,
  type FormValues,
} from "@/lib/enquiry-options";

export type EnquiryType = "dealer" | "distributor" | "bulk" | "product" | "general";

export type EnquiryFormProps = {
  type: EnquiryType;
  /** Set when the form is opened from a product page */
  product?: { name: string; path: string; category: string };
  /** Heading shown above the form. Omit to render the form without one. */
  heading?: string;
};

type FieldDef = {
  label: string;
  kind: "text" | "tel" | "email" | "numeric" | "textarea" | "select" | "checkboxes";
  optional?: boolean;
  autoComplete?: string;
  hint?: string;
  options?: readonly string[];
  maxLength?: number;
};

const FIELDS: Record<string, FieldDef> = {
  name: { label: "Your name", kind: "text", autoComplete: "name", maxLength: 80 },
  mobile: {
    label: "Mobile number",
    kind: "tel",
    autoComplete: "tel-national",
    hint: "10 digits. We call you on this number.",
    maxLength: 16,
  },
  city: { label: "City or town", kind: "text", autoComplete: "address-level2", maxLength: 80 },
  shopName: { label: "Shop name", kind: "text", autoComplete: "organization", maxLength: 120 },
  firmName: { label: "Firm name", kind: "text", autoComplete: "organization", maxLength: 120 },
  organisation: {
    label: "School, company or organisation",
    kind: "text",
    autoComplete: "organization",
    maxLength: 120,
  },
  pin: { label: "PIN code", kind: "numeric", autoComplete: "postal-code", maxLength: 6 },
  email: { label: "Email", kind: "email", optional: true, autoComplete: "email", maxLength: 120 },
  state: { label: "State", kind: "select", autoComplete: "address-level1", options: INDIAN_STATES },
  territory: {
    label: "Districts or area you want to cover",
    kind: "text",
    hint: "For example: Meerut, Baghpat and Muzaffarnagar",
    maxLength: 300,
  },
  yearsInTrade: { label: "Years in the trade", kind: "select", optional: true, options: YEARS_IN_TRADE },
  brandsHandled: { label: "Brands you handle now", kind: "text", optional: true, maxLength: 300 },
  gstin: {
    label: "GSTIN",
    kind: "text",
    optional: true,
    autoComplete: "off",
    hint: "15 characters, as on your GST certificate",
    maxLength: 15,
  },
  categories: { label: "Products you want to stock", kind: "checkboxes", options: CATEGORY_NAMES },
  items: {
    label: "Models and quantities",
    kind: "textarea",
    hint: "One line per model, for example: Sumo cooler, 40",
    maxLength: 1000,
  },
  deliveryCity: { label: "Delivery city", kind: "text", optional: true, maxLength: 80 },
  neededBy: { label: "Needed by", kind: "text", optional: true, hint: "A date or a month", maxLength: 80 },
  buyerType: { label: "Who is it for", kind: "select", options: BUYER_TYPES },
  message: { label: "Anything else we should know", kind: "textarea", optional: true, maxLength: 1000 },
};

const GENERAL_MESSAGE: FieldDef = { label: "Your message", kind: "textarea", maxLength: 1000 };
const PRODUCT_PIN: FieldDef = {
  label: "PIN code",
  kind: "numeric",
  optional: true,
  autoComplete: "postal-code",
  hint: "Helps us point you to a dealer near you",
  maxLength: 6,
};

const TYPE_NAMES: Record<EnquiryType, string> = {
  dealer: "dealer",
  distributor: "distributor",
  bulk: "bulk order",
  product: "product",
  general: "general",
};

function fieldDef(type: EnquiryType, key: string): FieldDef {
  if (type === "general" && key === "message") return GENERAL_MESSAGE;
  if (type === "product" && key === "pin") return PRODUCT_PIN;
  const def = FIELDS[key];
  if (!def) throw new Error(`Unknown enquiry field: ${key}`);
  return def;
}

export function EnquiryForm({ type, product, heading }: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialEnquiryState);
  const pathname = usePathname();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const mountedAt = useRef<number | null>(null);
  const elapsedInput = useRef<HTMLInputElement>(null);
  const focusTarget = useRef<HTMLDivElement>(null);

  // Note when the form became usable. Time is measured on this device only
  // (performance.now), so a wrong phone clock cannot block anyone.
  useEffect(() => {
    if (mountedAt.current === null) mountedAt.current = performance.now();
  }, []);

  // The server rejects forms sent within 3 seconds of the page opening.
  const stampElapsed = () => {
    const now = performance.now();
    const mounted = mountedAt.current ?? now;
    // On a first page load, count from the start of the load so someone who
    // typed before the script arrived is not told to wait.
    const base = mounted < 10_000 ? 0 : mounted;
    if (elapsedInput.current) elapsedInput.current.value = String(Math.round(now - base));
  };

  // After each submit, move focus to whatever now explains the result.
  useEffect(() => {
    if (state.attempt > 0) focusTarget.current?.focus();
  }, [state.attempt]);

  const headingEl = heading ? <h2 className="display display-md">{heading}</h2> : null;

  if (state.status === "delivered") {
    return (
      <div>
        {headingEl}
        <Delivered state={state} ref={focusTarget} />
      </div>
    );
  }

  const defaults: FormValues =
    state.status === "idle"
      ? type === "bulk" && product
        ? { items: `${product.name}, ` }
        : {}
      : state.values;
  const errors = state.status === "invalid" ? state.errors : {};
  const fieldKeys = ENQUIRY_FIELDS[type];
  const errorKeys = fieldKeys.filter((k) => errors[k]);
  const id = (key: string) => `${uid}-${key}`;

  return (
    <div>
      {headingEl}

      {/* Remounted after each submit so inputs show the values the server returned */}
      <form key={state.attempt} action={formAction} onSubmit={stampElapsed} noValidate className={heading ? "mt-6" : undefined}>
        {state.status === "invalid" && errorKeys.length > 0 ? (
          <div
            ref={focusTarget}
            tabIndex={-1}
            role="alert"
            aria-labelledby={`${uid}-summary`}
            className="mb-8 border-l-4 border-red-deep bg-white p-5"
          >
            <p id={`${uid}-summary`} className="font-semibold">
              {errorKeys.length === 1 ? "One thing to fix before sending:" : `${errorKeys.length} things to fix before sending:`}
            </p>
            <ul className="mt-3 space-y-1.5">
              {errorKeys.map((k) => (
                <li key={k}>
                  <a
                    href={`#${id(k)}`}
                    className="font-semibold text-red-deep underline"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(k === "categories" ? `${id(k)}-0` : id(k));
                      el?.focus();
                      el?.scrollIntoView({ block: "center" });
                    }}
                  >
                    {errors[k]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {state.status === "undelivered" ? (
          <Undelivered ref={focusTarget} type={type} values={state.values} />
        ) : null}

        {state.status === "blocked" ? (
          <div ref={focusTarget} tabIndex={-1} role="alert" className="mb-8 border-l-4 border-red-deep bg-white p-5">
            <p className="font-semibold">{state.message}</p>
          </div>
        ) : null}

        {type === "product" && product ? (
          <p className="mb-6">
            <span className="label block">Enquiry about</span>
            <span className="font-semibold">{product.name}</span>
          </p>
        ) : null}

        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="page" value={pathname} />
        <input ref={elapsedInput} type="hidden" name="elapsed" defaultValue="" />
        {product ? (
          <>
            <input type="hidden" name="productName" value={product.name} />
            <input type="hidden" name="productPath" value={product.path} />
          </>
        ) : null}

        {/* Left empty by people. Bots that fill every field are turned away. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={id("website")}>Leave this empty</label>
          <input id={id("website")} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <div className="space-y-6">
          {fieldKeys.map((key) => (
            <Field
              key={key}
              name={key}
              id={id(key)}
              def={fieldDef(type, key)}
              defaultValue={defaults[key]}
              error={errors[key]}
            />
          ))}
        </div>

        <div className="mt-8">
          <button type="submit" className="btn btn-red w-full sm:w-auto" disabled={pending} aria-disabled={pending}>
            {pending ? "Sending…" : "Send enquiry"}
          </button>
          <p className="field-hint mt-3">
            We use these details only to reply to your enquiry.{" "}
            <Link href="/privacy" className="underline">
              Privacy
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  name,
  id,
  def,
  defaultValue,
  error,
}: {
  name: string;
  id: string;
  def: FieldDef;
  defaultValue: string | string[] | undefined;
  error: string | undefined;
}) {
  const hintId = def.hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const value = typeof defaultValue === "string" ? defaultValue : "";
  const label = (
    <>
      {def.label}
      {def.optional ? <span className="font-normal text-steel"> (optional)</span> : null}
    </>
  );
  const hint = def.hint ? (
    <p id={hintId} className="field-hint">
      {def.hint}
    </p>
  ) : null;
  const errorEl = error ? (
    <p id={errorId} className="field-error">
      {error}
    </p>
  ) : null;

  if (def.kind === "checkboxes") {
    const checked = Array.isArray(defaultValue) ? defaultValue : [];
    return (
      <fieldset aria-describedby={describedBy}>
        <legend className="field-label">{label}</legend>
        {hint}
        <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
          {(def.options ?? []).map((opt, i) => (
            <label key={opt} htmlFor={`${id}-${i}`} className="flex min-h-11 cursor-pointer items-center gap-3">
              <input
                id={`${id}-${i}`}
                type="checkbox"
                name={name}
                value={opt}
                defaultChecked={checked.includes(opt)}
                aria-invalid={error ? true : undefined}
                className="h-5 w-5 shrink-0 accent-ink"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {errorEl}
      </fieldset>
    );
  }

  const common = {
    id,
    name,
    defaultValue: value,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    "aria-required": def.optional ? undefined : true,
    className: "input",
  } as const;

  let control: React.ReactNode;
  if (def.kind === "textarea") {
    control = <textarea {...common} rows={4} maxLength={def.maxLength} />;
  } else if (def.kind === "select") {
    control = (
      <select {...common} autoComplete={def.autoComplete}>
        <option value="">{def.optional ? "Not stated" : "Choose one"}</option>
        {(def.options ?? []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  } else {
    control = (
      <input
        {...common}
        type={def.kind === "email" ? "email" : def.kind === "tel" ? "tel" : "text"}
        inputMode={def.kind === "tel" || def.kind === "numeric" ? "numeric" : def.kind === "email" ? "email" : undefined}
        autoComplete={def.autoComplete}
        maxLength={def.maxLength}
        spellCheck={name === "gstin" || name === "pin" || name === "mobile" ? false : undefined}
        autoCapitalize={name === "gstin" ? "characters" : undefined}
      />
    );
  }

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {control}
      {hint}
      {errorEl}
    </div>
  );
}

function Delivered({
  state,
  ref,
}: {
  state: Extract<EnquiryState, { status: "delivered" }>;
  ref: React.Ref<HTMLDivElement>;
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
        <span className="font-mono text-lg font-medium">{state.reference}</span>
      </p>
      {hasWhatsApp() ? (
        <a
          href={whatsappHref(
            `Hello ${site.name}, I sent an enquiry on your website. My reference is ${state.reference}.`,
          )}
          className="btn btn-line mt-6"
        >
          Message us on WhatsApp
        </a>
      ) : null}
    </div>
  );
}

function Undelivered({
  type,
  values,
  ref,
}: {
  type: EnquiryType;
  values: FormValues;
  ref: React.Ref<HTMLDivElement>;
}) {
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
    <div ref={ref} tabIndex={-1} role="alert" className="mb-8 border-l-4 border-red-deep bg-white p-5">
      <p className="font-semibold">
        We could not send this from the website just now. Your details are still in the form.
      </p>
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
