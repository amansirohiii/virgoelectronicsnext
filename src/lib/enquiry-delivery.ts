/**
 * Where an enquiry goes once the form has passed validation. Server only: it
 * reads secrets from the environment and is imported by the server action alone.
 *
 * Each channel is switched on by its own environment keys and skipped when they
 * are missing. Every channel that is switched on gets the enquiry at the same
 * time. The enquiry counts as delivered when at least one of them confirms it,
 * so a Google outage does not lose an enquiry that reached Telegram.
 *
 * To add a channel (email, a CRM): write one more `Channel` and add it to
 * `CHANNELS`. Nothing else changes.
 *
 * Log lines carry the reference, the channel name and a short reason. Never a
 * key, an address with a key in it, or the visitor's details.
 */
import { site } from "@/content/site";
import { formatMobile, type EnquiryType } from "@/lib/enquiry";

export type Enquiry = {
  reference: string;
  type: EnquiryType;
  submittedAt: string;
  /** Path of the page the form was sent from, or "" */
  page: string;
  product: { name: string; path: string } | null;
  fields: Record<string, string | string[]>;
};

type Channel = {
  name: string;
  /** False when its environment keys are missing. */
  ready: () => boolean;
  /** Resolves when the channel confirmed the enquiry; throws a short reason otherwise. */
  send: (enquiry: Enquiry, signal: AbortSignal) => Promise<void>;
};

const TIMEOUT_MS = 15_000;

const TYPE_NAMES: Record<EnquiryType, string> = {
  dealer: "Dealer enquiry",
  distributor: "Distributor enquiry",
  bulk: "Bulk order enquiry",
  product: "Product enquiry",
  general: "General enquiry",
};

/** Same wording as the Sheet's Details column (docs/enquiry-webhook.gs). */
const FIELD_NAMES: Record<string, string> = {
  shopName: "Shop name",
  firmName: "Firm name",
  organisation: "Organisation",
  pin: "PIN code",
  email: "Email",
  state: "State",
  territory: "Area wanted",
  yearsInTrade: "Years in trade",
  brandsHandled: "Brands handled",
  gstin: "GSTIN",
  categories: "Product ranges",
  items: "Models and quantities",
  deliveryCity: "Delivery city",
  neededBy: "Needed by",
  buyerType: "For",
  message: "Message",
};

const env = (key: string): string => process.env[key]?.trim() ?? "";

const one = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value.join(", ") : (value ?? "");

/* The Google Sheet: an Apps Script web app that saves a row and sends an email. */

const sheet: Channel = {
  name: "sheet",
  ready: () => env("ENQUIRY_WEBHOOK_URL") !== "",
  async send(enquiry, signal) {
    const res = await fetch(env("ENQUIRY_WEBHOOK_URL"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      // The script checks `secret` only when its own ENQUIRY_SECRET is set.
      body: JSON.stringify({ secret: env("ENQUIRY_WEBHOOK_SECRET"), ...enquiry }),
      signal,
      cache: "no-store",
      redirect: "follow", // Apps Script answers through a redirect to googleusercontent.com
    });
    const body: unknown = await res.json().catch(() => null);
    const ok = res.ok && typeof body === "object" && body !== null && (body as { ok?: unknown }).ok === true;
    if (!ok) throw new Error(`answered HTTP ${res.status} without ok:true`);
  },
};

/* Telegram: a bot posts the enquiry to one or more chats, so it rings on the phone. */

const escapeHtml = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const TELEGRAM_LIMIT = 4096;

function telegramText(enquiry: Enquiry): string {
  const { fields } = enquiry;
  const mobile = one(fields.mobile);
  const lines = [
    `<b>${TYPE_NAMES[enquiry.type]}</b>`,
    escapeHtml([one(fields.name), one(fields.city)].filter(Boolean).join(", ")),
    // Written with the country code so the phone offers to call it.
    /^\d{10}$/.test(mobile) ? `+91 ${formatMobile(mobile)}` : escapeHtml(mobile),
    "",
  ];
  for (const [key, raw] of Object.entries(fields)) {
    const value = one(raw);
    if (value === "" || key === "name" || key === "city" || key === "mobile") continue;
    lines.push(`${FIELD_NAMES[key] ?? key}: ${escapeHtml(value)}`);
  }
  lines.push("");
  if (enquiry.product) {
    lines.push(`Product: <a href="${site.url}${enquiry.product.path}">${escapeHtml(enquiry.product.name)}</a>`);
  }
  if (enquiry.page) lines.push(`Sent from ${escapeHtml(enquiry.page)}`);
  lines.push(enquiry.reference);
  return lines.join("\n").slice(0, TELEGRAM_LIMIT);
}

const telegram: Channel = {
  name: "telegram",
  ready: () => env("TELEGRAM_BOT_TOKEN") !== "" && env("TELEGRAM_CHAT_ID") !== "",
  async send(enquiry, signal) {
    // One chat id, or several separated by commas (a group, the owner, the office).
    const chats = env("TELEGRAM_CHAT_ID")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const mobile = one(enquiry.fields.mobile);
    const buttons = /^\d{10}$/.test(mobile)
      ? [[{ text: "Reply on WhatsApp", url: `https://wa.me/91${mobile}` }]]
      : [];
    const message = {
      text: telegramText(enquiry),
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      reply_markup: { inline_keyboard: buttons },
    };

    const results = await Promise.allSettled(
      chats.map(async (chat_id) => {
        const res = await fetch(`https://api.telegram.org/bot${env("TELEGRAM_BOT_TOKEN")}/sendMessage`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ chat_id, ...message }),
          signal,
          cache: "no-store",
        });
        const body = (await res.json().catch(() => null)) as { ok?: unknown } | null;
        if (!res.ok || body?.ok !== true) throw new Error(`answered HTTP ${res.status}`);
      }),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === chats.length) throw new Error(`no chat accepted the message (${chats.length} tried)`);
  },
};

const CHANNELS: Channel[] = [sheet, telegram];

/** Our own short reason. An error from `fetch` can quote the address, which holds a key, so it is never logged. */
function reason(err: unknown): string {
  if (!(err instanceof Error)) return "failed";
  if (err.name === "TimeoutError" || err.name === "AbortError") return `timed out after ${TIMEOUT_MS / 1000} s`;
  return /^(answered|no chat)/.test(err.message) ? err.message : "request failed";
}

/**
 * Sends the enquiry to every channel that is switched on.
 * Returns true when at least one confirmed it.
 */
export async function deliverEnquiry(enquiry: Enquiry): Promise<boolean> {
  const tag = `[enquiry] ${enquiry.reference} ${enquiry.type}`;
  const active = CHANNELS.filter((c) => c.ready());
  if (active.length === 0) {
    console.error(`${tag} not delivered: no channel is set up (ENQUIRY_WEBHOOK_URL, or TELEGRAM_BOT_TOKEN with TELEGRAM_CHAT_ID)`);
    return false;
  }

  const results = await Promise.allSettled(active.map((c) => c.send(enquiry, AbortSignal.timeout(TIMEOUT_MS))));
  let delivered = false;
  results.forEach((result, i) => {
    const name = active[i]?.name ?? "channel";
    if (result.status === "fulfilled") delivered = true;
    else console.error(`${tag} ${name}: ${reason(result.reason)}`);
  });
  if (!delivered) console.error(`${tag} not delivered: every channel failed`);
  return delivered;
}
