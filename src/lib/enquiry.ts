/**
 * Enquiry schemas, field options and the state shared by the form and the server action.
 *
 * This file is imported by the client form, so it must stay light. It reads the
 * through `lib/catalogue`, which would pull the whole product list into the browser.
 */
import { z } from "zod";
import {
  BUYER_TYPES,
  CATEGORY_NAMES,
  ENQUIRY_MESSAGES as M,
  GSTIN_PATTERN as GSTIN,
  INDIAN_STATES,
  MOBILE_PATTERN as MOBILE,
  PIN_PATTERN as PIN,
  YEARS_IN_TRADE,
  keepUnder,
  normaliseMobile,
} from "@/lib/enquiry-options";

export * from "@/lib/enquiry-options";

/** "9876543210" -> "98765 43210" */
export function formatMobile(digits: string): string {
  return digits.length === 10 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

const required = (message: string, max = 120) =>
  z
    .string({ error: message })
    .trim()
    .min(1, message)
    .max(max, keepUnder(max));

const optionalText = (max = 120) =>
  z.string().trim().max(max, keepUnder(max)).default("");

const name = required(M.name, 80);

const mobile = z
  .string({ error: M.mobileMissing })
  .trim()
  .min(1, M.mobileMissing)
  .transform(normaliseMobile)
  .refine((v) => MOBILE.test(v), M.mobileInvalid);

const city = required(M.city, 80);

const message = optionalText(1000);

const email = z
  .string()
  .trim()
  .max(120, keepUnder(120))
  .default("")
  .refine((v) => v === "" || z.email().safeParse(v).success, M.email);

const requiredPin = z
  .string({ error: M.pinMissing })
  .trim()
  .min(1, M.pinMissing)
  .refine((v) => PIN.test(v), M.pinInvalid);

const optionalPin = z
  .string()
  .trim()
  .default("")
  .refine((v) => v === "" || PIN.test(v), M.pinOptional);

const categoryList = z
  .array(z.string(), { error: M.categoriesMissing })
  .refine((list) => list.every((v) => CATEGORY_NAMES.includes(v)), M.categoriesUnknown)
  .refine((list) => list.length > 0, M.categoriesMissing);

const oneOf = <T extends readonly [string, ...string[]]>(options: T, message: string) =>
  z.enum(options, { error: message });

const optionalOneOf = <T extends readonly [string, ...string[]]>(options: T, message: string) =>
  z.union([z.literal(""), z.enum(options)], { error: message }).default("");

export const dealerSchema = z.object({
  name,
  mobile,
  city,
  shopName: required(M.shopName),
  pin: requiredPin,
  categories: categoryList,
  message,
});

export const distributorSchema = z.object({
  name,
  mobile,
  city,
  firmName: required(M.firmName),
  email,
  state: oneOf(INDIAN_STATES, M.state),
  territory: required(M.territory, 300),
  yearsInTrade: optionalOneOf(YEARS_IN_TRADE, M.yearsInTrade),
  brandsHandled: optionalText(300),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .default("")
    .refine((v) => v === "" || GSTIN.test(v), M.gstin),
  categories: categoryList,
  message,
});

export const bulkSchema = z.object({
  name,
  mobile,
  city,
  organisation: required(M.organisation),
  email,
  items: required(M.items, 1000),
  deliveryCity: optionalText(80),
  neededBy: optionalText(80),
  message,
});

export const productSchema = z.object({
  name,
  mobile,
  city,
  pin: optionalPin,
  buyerType: oneOf(BUYER_TYPES, M.buyerType),
  message,
});

export const generalSchema = z.object({
  name,
  mobile,
  city,
  email,
  message: z
    .string({ error: M.messageMissing })
    .trim()
    .min(10, M.messageShort)
    .max(1000, keepUnder(1000)),
});

export const enquirySchemas = {
  dealer: dealerSchema,
  distributor: distributorSchema,
  bulk: bulkSchema,
  product: productSchema,
  general: generalSchema,
} as const;

export type DealerEnquiry = z.infer<typeof dealerSchema>;
export type DistributorEnquiry = z.infer<typeof distributorSchema>;
export type BulkEnquiry = z.infer<typeof bulkSchema>;
export type ProductEnquiry = z.infer<typeof productSchema>;
export type GeneralEnquiry = z.infer<typeof generalSchema>;
