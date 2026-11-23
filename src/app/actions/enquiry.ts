"use server";

import { headers } from "next/headers";
import { getProduct, productPath } from "@/lib/catalogue";
import { deliverEnquiry } from "@/lib/enquiry-delivery";
import {
  ENQUIRY_FIELDS,
  ENQUIRY_TYPES,
  enquirySchemas,
  formatMobile,
  type EnquiryState,
  type EnquiryType,
  type FormValues,
} from "@/lib/enquiry";

/**
 * Receives every enquiry form on the site, checks it and hands it to the
 * delivery channels in `lib/enquiry-delivery` (the Google Sheet, Telegram; see
 * docs/ENQUIRY_SETUP.md).
 *
 * The one rule: the visitor is told "we have your enquiry" only when at least
 * one channel confirmed it. Anything else, including no channel being set up,
 * returns `undelivered` so the form stays filled and the visitor is pointed to
 * another way of reaching us.
 */

const MIN_FILL_MS = 3_000;

/*
 * Per-IP rate limit: 5 delivery attempts per 10 minutes.
 * This lives in the memory of one server instance. On serverless hosting each
 * instance has its own map and instances are recycled, so this is best-effort
 * protection against a burst, not a guarantee.
 */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5_000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

function isEnquiryType(v: unknown): v is EnquiryType {
  return typeof v === "string" && (ENQUIRY_TYPES as readonly string[]).includes(v);
}

const text = (formData: FormData, key: string): string => {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
};

/** Reads only the fields this form type is allowed to send. */
function readValues(type: EnquiryType, formData: FormData): FormValues {
  const values: FormValues = {};
  for (const key of ENQUIRY_FIELDS[type]) {
    values[key] =
      key === "categories"
        ? formData.getAll(key).filter((v): v is string => typeof v === "string")
        : text(formData, key);
  }
  return values;
}

/** Short reference the visitor can quote: VE-YYMMDD-XXXX, date in India time. */
function makeReference(now: Date): string {
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const yymmdd = ist.toISOString().slice(2, 10).replace(/-/g, "");
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `VE-${yymmdd}-${code}`;
}

/** Accepts only a real product path such as /products/coolers/sumo. */
function resolveProduct(path: string): { name: string; path: string } | null {
  const match = /^\/products\/([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(path);
  if (!match?.[1] || !match[2]) return null;
  const product = getProduct(match[1], match[2]);
  return product ? { name: product.name, path: productPath(product) } : null;
}

function safePagePath(path: string): string {
  return /^\/[\w\-/]{0,200}$/.test(path) ? path : "";
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function submitEnquiry(prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const attempt = prev.attempt + 1;
  const rawType = formData.get("type");
  if (!isEnquiryType(rawType)) {
    return { status: "blocked", attempt, values: {}, message: "We could not send this form. Please reload the page and try again." };
  }
  const type = rawType;
  const values = readValues(type, formData);

  // Bot checks: a filled honeypot or a form sent within 3 seconds of opening.
  const now = Date.now();
  // `elapsed` is measured in the browser with a monotonic timer, so it does not depend on the device clock.
  const elapsedRaw = text(formData, "elapsed");
  const elapsed = Number(elapsedRaw);
  const honeypot = text(formData, "website");
  if (honeypot !== "" || elapsedRaw === "" || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
    return {
      status: "blocked",
      attempt,
      values,
      message: "We could not send this form. Please wait a few seconds and press Send again.",
    };
  }

  const parsed = enquirySchemas[type].safeParse(values);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return { status: "invalid", attempt, errors, values };
  }

  if (rateLimited(await clientIp(), now)) {
    return {
      status: "blocked",
      attempt,
      values,
      message: "This connection has sent several enquiries in the last few minutes. Please try again in ten minutes.",
    };
  }

  const fields = parsed.data;
  const product = resolveProduct(text(formData, "productPath"));
  const reference = makeReference(new Date(now));

  const delivered = await deliverEnquiry({
    reference,
    type,
    submittedAt: new Date(now).toISOString(),
    page: safePagePath(text(formData, "page")),
    product,
    fields,
  });
  if (!delivered) return { status: "undelivered", attempt, values };

  return { status: "delivered", attempt, reference, mobile: formatMobile(fields.mobile) };
}
