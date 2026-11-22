/**
 * Enquiry schemas, field options and the state shared by the form and the server action.
 *
 * This file is imported by the client form, so it must stay light. It reads the
 * through `lib/catalogue`, which would pull the whole product list into the browser.
 */
import { z } from "zod";
import { BUYER_TYPES, CATEGORY_NAMES, INDIAN_STATES, YEARS_IN_TRADE } from "@/lib/enquiry-options";

export * from "@/lib/enquiry-options";

/** Strips spaces, dashes, brackets and a leading +91, 91 or 0. Returns what is left. */
export function normaliseMobile(raw: string): string {
  let digits = raw.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

/** "9876543210" -> "98765 43210" */
export function formatMobile(digits: string): string {
  return digits.length === 10 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

const MOBILE = /^[6-9]\d{9}$/;
const PIN = /^[1-9]\d{5}$/;
const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const required = (message: string, max = 120) =>
  z
    .string({ error: message })
    .trim()
    .min(1, message)
    .max(max, `Keep this under ${max} characters`);

const optionalText = (max = 120) =>
  z.string().trim().max(max, `Keep this under ${max} characters`).default("");

const name = required("Enter your name", 80);

const mobile = z
  .string({ error: "Enter your mobile number" })
  .trim()
  .min(1, "Enter your mobile number")
  .transform(normaliseMobile)
  .refine((v) => MOBILE.test(v), "Enter a 10 digit mobile number");

const city = required("Enter your city or town", 80);

const message = optionalText(1000);

const email = z
  .string()
  .trim()
  .max(120, "Keep this under 120 characters")
  .default("")
  .refine((v) => v === "" || z.email().safeParse(v).success, "Enter an email address like name@example.com");

const requiredPin = z
  .string({ error: "Enter your 6 digit PIN code" })
  .trim()
  .min(1, "Enter your 6 digit PIN code")
  .refine((v) => PIN.test(v), "Enter a 6 digit PIN code");

const optionalPin = z
  .string()
  .trim()
  .default("")
  .refine((v) => v === "" || PIN.test(v), "Enter a 6 digit PIN code, or leave it blank");

const categoryList = z
  .array(z.string(), { error: "Choose at least one product range" })
  .refine((list) => list.every((v) => CATEGORY_NAMES.includes(v)), "Choose from the product ranges listed")
  .refine((list) => list.length > 0, "Choose at least one product range");

const oneOf = <T extends readonly [string, ...string[]]>(options: T, message: string) =>
  z.enum(options, { error: message });

const optionalOneOf = <T extends readonly [string, ...string[]]>(options: T, message: string) =>
  z.union([z.literal(""), z.enum(options)], { error: message }).default("");

export const dealerSchema = z.object({
  name,
  mobile,
  city,
  shopName: required("Enter the name of your shop"),
  pin: requiredPin,
  categories: categoryList,
  message,
});

export const distributorSchema = z.object({
  name,
  mobile,
  city,
  firmName: required("Enter the name of your firm"),
  email,
  state: oneOf(INDIAN_STATES, "Choose your state"),
  territory: required("Enter the districts or area you want to cover", 300),
  yearsInTrade: optionalOneOf(YEARS_IN_TRADE, "Choose how long you have been in the trade"),
  brandsHandled: optionalText(300),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .default("")
    .refine((v) => v === "" || GSTIN.test(v), "Enter the 15 character GSTIN, or leave it blank"),
  categories: categoryList,
  message,
});

export const bulkSchema = z.object({
  name,
  mobile,
  city,
  organisation: required("Enter the name of your organisation"),
  email,
  items: required("List the models and how many of each you need", 1000),
  deliveryCity: optionalText(80),
  neededBy: optionalText(80),
  message,
});

export const productSchema = z.object({
  name,
  mobile,
  city,
  pin: optionalPin,
  buyerType: oneOf(BUYER_TYPES, "Choose who the product is for"),
  message,
});

export const generalSchema = z.object({
  name,
  mobile,
  city,
  email,
  message: z
    .string({ error: "Write your message" })
    .trim()
    .min(10, "Write a little more so we know how to help (at least 10 characters)")
    .max(1000, "Keep this under 1000 characters"),
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
