import { useState } from "react";
import type { EnquiryType } from "@/components/enquiry/enquiry-form";
import { ENQUIRY_FIELDS, type FormValues } from "@/lib/enquiry-options";
import { isRequired, validateField, validateForm, type FieldError } from "@/lib/validate";

type Errors = Record<string, string>;

function withError(errors: Errors, key: string, error: FieldError): Errors {
  if ((errors[key] ?? null) === error) return errors;
  const next = { ...errors };
  if (error) next[key] = error;
  else delete next[key];
  return next;
}

const addTo = (set: ReadonlySet<string>, keys: string[]): ReadonlySet<string> =>
  keys.every((k) => set.has(k)) ? set : new Set([...set, ...keys]);

const hasValue = (value: FormValues[string] | undefined) =>
  typeof value === "string" ? value.trim() !== "" : (value?.length ?? 0) > 0;

/**
 * Values and errors of one enquiry form, with the timing people expect:
 * a field is checked when it is left; once it has shown an error it is
 * rechecked on every change so the error clears the moment it is fixed.
 */
export function useEnquiryValidation(
  type: EnquiryType,
  initialValues: FormValues,
  initialErrors: Errors,
  /** True when the values came back from the server, so every field counts as visited */
  returned: boolean,
) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Errors>(initialErrors);
  // Fields the person has left at least once
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set(returned ? ENQUIRY_FIELDS[type] : []));
  // Fields that have shown an error, and so are checked as they change
  const [live, setLive] = useState<ReadonlySet<string>>(() => new Set(Object.keys(initialErrors)));

  const change = (key: string, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (live.has(key)) setErrors((prev) => withError(prev, key, validateField(type, key, value)));
  };

  const leave = (key: string) => {
    const error = validateField(type, key, values[key]);
    setVisited((prev) => addTo(prev, [key]));
    setErrors((prev) => withError(prev, key, error));
    if (error) setLive((prev) => addTo(prev, [key]));
  };

  /** Checks every field, shows every error and returns them. */
  const checkAll = (): Errors => {
    const next = validateForm(type, values);
    setErrors(next);
    setVisited((prev) => addTo(prev, ENQUIRY_FIELDS[type]));
    setLive((prev) => addTo(prev, Object.keys(next)));
    return next;
  };

  /** A visited required field the server would accept: earns the quiet check. */
  const isValid = (key: string) =>
    visited.has(key) &&
    isRequired(type, key) &&
    !errors[key] &&
    hasValue(values[key]) &&
    validateField(type, key, values[key]) === null;

  return { values, errors, change, leave, checkAll, isValid };
}
