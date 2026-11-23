/**
 * How each enquiry field looks: label, kind of control, hint and options.
 * Whether a field is required and how long it may be come from `lib/validate`,
 * which mirrors the server schemas, so they are not repeated here.
 */
import type { EnquiryType } from "@/components/enquiry/enquiry-form";
import { BUYER_TYPES, CATEGORY_NAMES, INDIAN_STATES, YEARS_IN_TRADE } from "@/lib/enquiry-options";

export type FieldKind = "text" | "mobile" | "email" | "pin" | "gstin" | "textarea" | "select" | "checkboxes" | "choice";

export type FieldDef = {
  label: string;
  kind: FieldKind;
  autoComplete?: string;
  hint?: string;
  options?: readonly string[];
};

const FIELDS: Record<string, FieldDef> = {
  name: { label: "Your name", kind: "text", autoComplete: "name" },
  mobile: { label: "Mobile number", kind: "mobile", autoComplete: "tel-national", hint: "10 digits. We call you on this number." },
  city: { label: "City or town", kind: "text", autoComplete: "address-level2" },
  shopName: { label: "Shop name", kind: "text", autoComplete: "organization" },
  firmName: { label: "Firm name", kind: "text", autoComplete: "organization" },
  organisation: { label: "School, company or organisation", kind: "text", autoComplete: "organization" },
  pin: { label: "PIN code", kind: "pin", autoComplete: "postal-code" },
  email: { label: "Email", kind: "email", autoComplete: "email" },
  state: { label: "State", kind: "select", options: INDIAN_STATES },
  territory: { label: "Districts or area you want to cover", kind: "text", hint: "For example: Meerut, Baghpat and Muzaffarnagar" },
  yearsInTrade: { label: "Years in the trade", kind: "select", options: YEARS_IN_TRADE },
  brandsHandled: { label: "Brands you handle now", kind: "text" },
  gstin: { label: "GSTIN", kind: "gstin", autoComplete: "off", hint: "15 characters, as on your GST certificate" },
  categories: { label: "Products you want to stock", kind: "checkboxes", options: CATEGORY_NAMES },
  items: { label: "Models and quantities", kind: "textarea", hint: "One line per model, for example: Sumo cooler, 40" },
  deliveryCity: { label: "Delivery city", kind: "text" },
  neededBy: { label: "Needed by", kind: "text", hint: "A date or a month" },
  buyerType: { label: "Who is it for", kind: "choice", options: BUYER_TYPES },
  message: { label: "Anything else we should know", kind: "textarea" },
};

/** Where one enquiry type words a field differently. */
const OVERRIDES: Partial<Record<EnquiryType, Record<string, FieldDef>>> = {
  general: { message: { label: "Your message", kind: "textarea" } },
  product: { pin: { label: "PIN code", kind: "pin", autoComplete: "postal-code", hint: "Helps us point you to a dealer near you" } },
};

export function fieldDef(type: EnquiryType, key: string): FieldDef {
  const def = OVERRIDES[type]?.[key] ?? FIELDS[key];
  if (!def) throw new Error(`Unknown enquiry field: ${key}`);
  return def;
}

/**
 * Short fields that take half the row on wider screens. Fields keep their order,
 * so these pair up as name + mobile, city + PIN, email + GSTIN, city + state and so on.
 * Each form's order in `ENQUIRY_FIELDS` must leave no half field alone on a row.
 */
export const HALF_WIDTH: ReadonlySet<string> = new Set([
  "name",
  "mobile",
  "email",
  "city",
  "pin",
  "state",
  "yearsInTrade",
  "brandsHandled",
  "gstin",
  "deliveryCity",
  "neededBy",
]);
