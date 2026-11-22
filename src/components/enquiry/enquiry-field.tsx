"use client";

import type { EnquiryType } from "@/components/enquiry/enquiry-form";
import { fieldDef, type FieldKind } from "@/components/enquiry/fields";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Choice } from "@/components/ui/choice";
import { digitsOnly, indianMobile, noSpaces, upperAlphanumeric } from "@/components/ui/masks";
import { Select } from "@/components/ui/select";
import { TextArea } from "@/components/ui/text-area";
import { TextField, type TextFieldProps } from "@/components/ui/text-field";
import type { FormValues } from "@/lib/enquiry-options";
import { isRequired, maxLengthOf } from "@/lib/validate";

type TextKind = Exclude<FieldKind, "textarea" | "select" | "checkboxes" | "choice">;

/** Input settings for each kind of one-line field. */
const TEXT_KINDS: Record<TextKind, Pick<TextFieldProps, "type" | "inputMode" | "mask" | "prefix" | "spellCheck" | "autoCapitalize">> = {
  text: {},
  mobile: { type: "tel", inputMode: "numeric", prefix: "+91", mask: indianMobile, spellCheck: false },
  // A text input with the email keyboard: an email-type input cannot place the caret after the mask runs.
  email: { inputMode: "email", mask: noSpaces, spellCheck: false, autoCapitalize: "none" },
  pin: { inputMode: "numeric", mask: digitsOnly(6), spellCheck: false },
  gstin: { mask: upperAlphanumeric(15), spellCheck: false, autoCapitalize: "characters" },
};

export type EnquiryFieldProps = {
  type: EnquiryType;
  name: string;
  id: string;
  value: FormValues[string] | undefined;
  error?: string;
  valid: boolean;
  onChange: (value: string | string[]) => void;
  onLeave: () => void;
  className?: string;
};

/** One enquiry field, drawn with the control its kind calls for. */
export function EnquiryField({ type, name, id, value, error, valid, onChange, onLeave, className }: EnquiryFieldProps) {
  const def = fieldDef(type, name);
  const optional = !isRequired(type, name);
  const text = typeof value === "string" ? value : "";
  const chrome = { id, label: def.label, optional, hint: def.hint, error, className };

  switch (def.kind) {
    case "checkboxes":
      return (
        <CheckboxGroup
          {...chrome}
          name={name}
          value={Array.isArray(value) ? value : []}
          options={def.options ?? []}
          onValueChange={onChange}
          onBlur={onLeave}
        />
      );
    case "choice":
      return <Choice {...chrome} name={name} value={text} options={def.options ?? []} onValueChange={onChange} onBlur={onLeave} />;
    case "select":
      return (
        <Select
          {...chrome}
          name={name}
          value={text}
          options={def.options ?? []}
          emptyOption={optional ? "Not stated" : undefined}
          onValueChange={onChange}
          onBlur={onLeave}
        />
      );
    case "textarea":
      return (
        <TextArea
          {...chrome}
          name={name}
          value={text}
          maxLength={maxLengthOf(type, name)}
          valid={valid}
          onValueChange={onChange}
          onBlur={onLeave}
        />
      );
    default:
      return (
        <TextField
          {...chrome}
          {...TEXT_KINDS[def.kind]}
          name={name}
          value={text}
          autoComplete={def.autoComplete}
          maxLength={maxLengthOf(type, name)}
          valid={valid}
          onValueChange={onChange}
          onBlur={onLeave}
        />
      );
  }
}
