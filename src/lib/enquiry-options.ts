/**
 * Option lists, field lists and form state for the enquiry forms.
 *
 * Kept free of the validation library so the browser bundle of the form
 * carries only these lists. The server schemas in `enquiry.ts` are the authority;
 * `lib/validate.ts` mirrors them in the browser. Both read the patterns and
 * messages below so the wording and the rules cannot drift apart.
 */
import { categories } from "@/content/categories";
import type { EnquiryType } from "@/components/enquiry/enquiry-form";

export type { EnquiryType };

export const ENQUIRY_TYPES = ["dealer", "distributor", "bulk", "product", "general"] as const;

export const CATEGORY_NAMES = categories.map((c) => c.name);

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export const YEARS_IN_TRADE = ["Under 2 years", "2 to 5 years", "5 to 10 years", "Over 10 years"] as const;

export const BUYER_TYPES = ["For my home", "For my shop", "Bulk order"] as const;

/** The fields a form of each type sends, in the order they are shown. */
export const ENQUIRY_FIELDS: Record<EnquiryType, string[]> = {
  dealer: ["name", "mobile", "shopName", "city", "pin", "categories", "message"],
  distributor: [
    "name",
    "mobile",
    "firmName",
    "email",
    "gstin",
    "city",
    "state",
    "territory",
    "yearsInTrade",
    "brandsHandled",
    "categories",
    "message",
  ],
  bulk: ["name", "mobile", "organisation", "email", "city", "items", "deliveryCity", "neededBy", "message"],
  product: ["name", "mobile", "city", "pin", "buyerType", "message"],
  general: ["name", "mobile", "email", "city", "message"],
};

export const MOBILE_PATTERN = /^[6-9]\d{9}$/;
export const PIN_PATTERN = /^[1-9]\d{5}$/;
export const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/** Strips spaces, dashes, brackets and a leading +91, 91 or 0. Returns what is left. */
export function normaliseMobile(raw: string): string {
  let digits = raw.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export const keepUnder = (max: number) => `Keep this under ${max} characters`;

/** Error wording shared by the server schemas and the browser validators. */
export const ENQUIRY_MESSAGES = {
  name: "Enter your name",
  mobileMissing: "Enter your mobile number",
  mobileInvalid: "Enter a 10 digit mobile number",
  city: "Enter your city or town",
  shopName: "Enter the name of your shop",
  firmName: "Enter the name of your firm",
  organisation: "Enter the name of your organisation",
  territory: "Enter the districts or area you want to cover",
  items: "List the models and how many of each you need",
  email: "Enter an email address like name@example.com",
  pinMissing: "Enter your 6 digit PIN code",
  pinInvalid: "Enter a 6 digit PIN code",
  pinOptional: "Enter a 6 digit PIN code, or leave it blank",
  categoriesMissing: "Choose at least one product range",
  categoriesUnknown: "Choose from the product ranges listed",
  state: "Choose your state",
  yearsInTrade: "Choose how long you have been in the trade",
  gstin: "Enter the 15 character GSTIN, or leave it blank",
  buyerType: "Choose who the product is for",
  messageMissing: "Write your message",
  messageShort: "Write a little more so we know how to help (at least 10 characters)",
} as const;

export type FormValues = Record<string, string | string[]>;

/**
 * State returned by `submitEnquiry` for `useActionState`.
 * `attempt` counts submissions so the form can remount with the returned values.
 */
export type EnquiryState =
  | { status: "idle"; attempt: number }
  | { status: "invalid"; attempt: number; errors: Record<string, string>; values: FormValues }
  | { status: "blocked"; attempt: number; message: string; values: FormValues }
  | { status: "undelivered"; attempt: number; values: FormValues }
  | { status: "delivered"; attempt: number; reference: string; mobile: string };

export const initialEnquiryState: EnquiryState = { status: "idle", attempt: 0 };

/** What happens after a trade enquiry. Only steps that are true today. */
export const ENQUIRY_STEPS = [
  "You send the form.",
  "We call you on the number you give.",
  "We discuss the range, rates and supply for your area.",
] as const;
