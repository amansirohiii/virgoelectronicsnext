/**
 * Option lists, field lists and form state for the enquiry forms.
 *
 * Kept free of the validation library so the browser bundle of the form
 * carries only these lists. Validation lives in `enquiry.ts` and runs on the server.
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
    "city",
    "state",
    "territory",
    "yearsInTrade",
    "brandsHandled",
    "gstin",
    "categories",
    "message",
  ],
  bulk: ["name", "mobile", "organisation", "email", "city", "items", "deliveryCity", "neededBy", "message"],
  product: ["name", "mobile", "city", "pin", "buyerType", "message"],
  general: ["name", "mobile", "email", "city", "message"],
};

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
