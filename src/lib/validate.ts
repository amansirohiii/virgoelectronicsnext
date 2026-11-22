/**
 * Browser validators that mirror the server schemas in `lib/enquiry.ts`.
 *
 * The server stays the authority. These only let the form say what is wrong
 * before sending, with the same wording, so they read the same patterns and
 * messages from `enquiry-options` and never import the validation library.
 * Each rule trims first, as the schemas do.
 */
import {
  BUYER_TYPES,
  CATEGORY_NAMES,
  ENQUIRY_FIELDS,
  ENQUIRY_MESSAGES as M,
  GSTIN_PATTERN,
  INDIAN_STATES,
  MOBILE_PATTERN,
  PIN_PATTERN,
  YEARS_IN_TRADE,
  keepUnder,
  normaliseMobile,
  type EnquiryType,
  type FormValues,
} from "@/lib/enquiry-options";

export type FieldValue = string | readonly string[] | undefined;
export type FieldError = string | null;

/*
 * The email pattern the server's email check uses (zod 4 `z.email()`), copied
 * because the browser must not load the validation library.
 */
const EMAIL_PATTERN =
  /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;

export function requiredText(value: string, message: string, max: number): FieldError {
  const v = value.trim();
  if (v === "") return message;
  return v.length > max ? keepUnder(max) : null;
}

export function maxLength(value: string, max: number): FieldError {
  return value.trim().length > max ? keepUnder(max) : null;
}

export function minLength(value: string, min: number, max: number, message: string): FieldError {
  const v = value.trim();
  if (v.length < min) return message;
  return v.length > max ? keepUnder(max) : null;
}

/** Accepts spaces, dashes, brackets, +91, 91 or a leading 0 around the 10 digits. */
export function indianMobile(value: string): FieldError {
  const v = value.trim();
  if (v === "") return M.mobileMissing;
  return MOBILE_PATTERN.test(normaliseMobile(v)) ? null : M.mobileInvalid;
}

/** Optional: an empty value passes. */
export function email(value: string): FieldError {
  const v = value.trim();
  if (v.length > 120) return keepUnder(120);
  return v === "" || EMAIL_PATTERN.test(v) ? null : M.email;
}

export function pinCode(value: string, required: boolean): FieldError {
  const v = value.trim();
  if (v === "") return required ? M.pinMissing : null;
  if (PIN_PATTERN.test(v)) return null;
  return required ? M.pinInvalid : M.pinOptional;
}

/** Optional: an empty value passes. Case does not matter. */
export function gstin(value: string): FieldError {
  const v = value.trim().toUpperCase();
  return v === "" || GSTIN_PATTERN.test(v) ? null : M.gstin;
}

export function oneOf(value: string, options: readonly string[], message: string, required: boolean): FieldError {
  if (value === "" && !required) return null;
  return options.includes(value) ? null : message;
}

export function atLeastOne(values: readonly string[], options: readonly string[]): FieldError {
  if (!values.every((v) => options.includes(v))) return M.categoriesUnknown;
  return values.length > 0 ? null : M.categoriesMissing;
}

type Rule = {
  required: boolean;
  /** Longest text the server accepts, after trimming */
  max?: number;
  check: (value: FieldValue) => FieldError;
};

const asText = (value: FieldValue): string => (typeof value === "string" ? value : "");
const asList = (value: FieldValue): readonly string[] => (value === undefined || typeof value === "string" ? [] : value);

const required = (message: string, max = 120): Rule => ({
  required: true,
  max,
  check: (v) => requiredText(asText(v), message, max),
});

const optional = (max = 120): Rule => ({ required: false, max, check: (v) => maxLength(asText(v), max) });

const RULES: Record<string, Rule> = {
  name: required(M.name, 80),
  mobile: { required: true, check: (v) => indianMobile(asText(v)) },
  city: required(M.city, 80),
  shopName: required(M.shopName),
  firmName: required(M.firmName),
  organisation: required(M.organisation),
  pin: { required: true, check: (v) => pinCode(asText(v), true) },
  email: { required: false, max: 120, check: (v) => email(asText(v)) },
  state: { required: true, check: (v) => oneOf(asText(v), INDIAN_STATES, M.state, true) },
  territory: required(M.territory, 300),
  yearsInTrade: { required: false, check: (v) => oneOf(asText(v), YEARS_IN_TRADE, M.yearsInTrade, false) },
  brandsHandled: optional(300),
  gstin: { required: false, check: (v) => gstin(asText(v)) },
  categories: { required: true, check: (v) => atLeastOne(asList(v), CATEGORY_NAMES) },
  items: required(M.items, 1000),
  deliveryCity: optional(80),
  neededBy: optional(80),
  buyerType: { required: true, check: (v) => oneOf(asText(v), BUYER_TYPES, M.buyerType, true) },
  message: optional(1000),
};

/** Where one enquiry type's schema differs from the shared field rule. */
const OVERRIDES: Partial<Record<EnquiryType, Record<string, Rule>>> = {
  product: { pin: { required: false, check: (v) => pinCode(asText(v), false) } },
  general: {
    message: { required: true, max: 1000, check: (v) => minLength(asText(v), 10, 1000, M.messageShort) },
  },
};

function ruleFor(type: EnquiryType, key: string): Rule | undefined {
  if (!ENQUIRY_FIELDS[type].includes(key)) return undefined;
  return OVERRIDES[type]?.[key] ?? RULES[key];
}

export function isRequired(type: EnquiryType, key: string): boolean {
  return ruleFor(type, key)?.required ?? false;
}

export function maxLengthOf(type: EnquiryType, key: string): number | undefined {
  return ruleFor(type, key)?.max;
}

/** The server's message for this value, or null when the server would accept it. */
export function validateField(type: EnquiryType, key: string, value: FieldValue): FieldError {
  return ruleFor(type, key)?.check(value) ?? null;
}

/** Every failing field of a form, keyed by field name, in display order. */
export function validateForm(type: EnquiryType, values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const key of ENQUIRY_FIELDS[type]) {
    const error = validateField(type, key, values[key]);
    if (error) errors[key] = error;
  }
  return errors;
}
