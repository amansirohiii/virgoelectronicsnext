"use client";

/**
 * Enquiry form. One component for every enquiry on the site.
 *
 * The props below are the fixed interface other pages rely on.
 *
 * Fields are checked in the browser as people leave them and again on send,
 * with the server's own wording (`lib/validate`). The server action checks
 * everything again and stays the authority.
 *
 * Delivery rule: the confirmation panel appears only when the server action
 * reports `delivered`, which it does only after the company's webhook confirmed
 * it stored the enquiry. Every other outcome keeps the typed details in the form.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { submitEnquiry } from "@/app/actions/enquiry";
import { EnquiryField } from "@/components/enquiry/enquiry-field";
import { HALF_WIDTH } from "@/components/enquiry/fields";
import { Blocked, Delivered, ErrorSummary, Undelivered } from "@/components/enquiry/notices";
import { useEnquiryValidation } from "@/components/enquiry/use-enquiry-validation";
import { SubmitButton } from "@/components/ui/submit-button";
import { site } from "@/content/site";
import { ENQUIRY_FIELDS, initialEnquiryState, type EnquiryState, type FormValues } from "@/lib/enquiry-options";

export type EnquiryType = "dealer" | "distributor" | "bulk" | "product" | "general";

export type EnquiryFormProps = {
  type: EnquiryType;
  /** Set when the form is opened from a product page */
  product?: { name: string; path: string; category: string };
  /** Heading shown above the form. Omit to render the form without one. */
  heading?: string;
};

export function EnquiryForm({ type, product, heading }: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialEnquiryState);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const mountedAt = useRef<number | null>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  // Note when the form became usable. Time is measured on this device only
  // (performance.now), so a wrong phone clock cannot block anyone.
  useEffect(() => {
    if (mountedAt.current === null) mountedAt.current = performance.now();
  }, []);

  // The server rejects forms sent within 3 seconds of the page opening.
  const elapsedSinceOpen = () => {
    const now = performance.now();
    const mounted = mountedAt.current ?? now;
    // On a first page load, count from the start of the load so someone who
    // typed before the script arrived is not told to wait.
    const base = mounted < 10_000 ? 0 : mounted;
    return Math.round(now - base);
  };

  // After each submit, move focus to whatever now explains the result.
  useEffect(() => {
    if (state.attempt > 0) noticeRef.current?.focus();
  }, [state.attempt]);

  const headingEl = heading ? <h2 className="display display-md">{heading}</h2> : null;

  if (state.status === "delivered") {
    return (
      <div>
        {headingEl}
        <Delivered state={state} ref={noticeRef} />
      </div>
    );
  }

  return (
    <div>
      {headingEl}
      {/* Remounted after each submit so the fields start from the values the server returned */}
      <EnquiryFormBody
        key={state.attempt}
        type={type}
        product={product}
        state={state}
        formAction={formAction}
        pending={pending}
        uid={uid}
        noticeRef={noticeRef}
        elapsedSinceOpen={elapsedSinceOpen}
        nameProduct={!heading}
        className={heading ? "mt-6" : undefined}
      />
    </div>
  );
}

type BodyProps = Omit<EnquiryFormProps, "heading"> & {
  state: Exclude<EnquiryState, { status: "delivered" }>;
  formAction: (formData: FormData) => void;
  pending: boolean;
  uid: string;
  noticeRef: RefObject<HTMLDivElement | null>;
  elapsedSinceOpen: () => number;
  /** Shows the product's name above the fields. Off when a heading already names it. */
  nameProduct: boolean;
  className?: string;
};

function EnquiryFormBody({
  type,
  product,
  state,
  formAction,
  pending,
  uid,
  noticeRef,
  elapsedSinceOpen,
  nameProduct,
  className,
}: BodyProps) {
  const pathname = usePathname();
  const fieldKeys = ENQUIRY_FIELDS[type];
  const serverErrors = state.status === "invalid" ? state.errors : {};
  const initialValues: FormValues =
    state.status === "idle" ? (type === "bulk" && product ? { items: `${product.name}, ` } : {}) : state.values;

  const form = useEnquiryValidation(type, initialValues, serverErrors, state.status !== "idle");
  // The summary lists what was wrong at the last send, from the browser or the server.
  const [summary, setSummary] = useState({ errors: serverErrors, shown: 0 });
  const elapsedInput = useRef<HTMLInputElement>(null);
  const id = (key: string) => `${uid}-${key}`;
  const summaryKeys = fieldKeys.filter((k) => summary.errors[k]);

  // A send stopped in the browser: move focus to the summary, as the server's errors do.
  useEffect(() => {
    if (summary.shown > 0) noticeRef.current?.focus();
  }, [summary.shown, noticeRef]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    const errors = form.checkAll();
    if (Object.keys(errors).length > 0) {
      e.preventDefault();
      setSummary((s) => ({ errors, shown: s.shown + 1 }));
      return;
    }
    if (elapsedInput.current) elapsedInput.current.value = String(elapsedSinceOpen());
  };

  const showSummary = summaryKeys.length > 0;
  const within = site.contact.replyWithin;

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className={className}>
      {showSummary ? <ErrorSummary errors={summary.errors} keys={summaryKeys} fieldId={id} ref={noticeRef} /> : null}
      {state.status === "undelivered" ? (
        <Undelivered type={type} values={state.values} ref={showSummary ? undefined : noticeRef} />
      ) : null}
      {state.status === "blocked" ? <Blocked message={state.message} ref={showSummary ? undefined : noticeRef} /> : null}

      {type === "product" && product && nameProduct ? (
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

      {/* Locked while sending; the values were already read when Send was pressed. */}
      <fieldset disabled={pending} className="grid min-w-0 gap-x-5 gap-y-6 sm:grid-cols-2">
        {fieldKeys.map((key) => (
          <EnquiryField
            key={key}
            type={type}
            name={key}
            id={id(key)}
            value={form.values[key]}
            error={form.errors[key]}
            valid={form.isValid(key)}
            onChange={(value) => form.change(key, value)}
            onLeave={() => form.leave(key)}
            className={HALF_WIDTH.has(key) ? "min-w-0" : "min-w-0 sm:col-span-2"}
          />
        ))}
      </fieldset>

      <div className="mt-8">
        {within ? <p className="mb-4">We reply within {within}.</p> : null}
        <SubmitButton pending={pending}>Send enquiry</SubmitButton>
        <p className="field-hint mt-3">
          We use these details only to reply to your enquiry.{" "}
          <Link href="/privacy" className="underline">
            Privacy
          </Link>
        </p>
      </div>
    </form>
  );
}
