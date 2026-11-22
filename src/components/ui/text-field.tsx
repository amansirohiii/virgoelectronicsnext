"use client";

import type { ChangeEvent, InputHTMLAttributes } from "react";
import { controlFrame, controlInput } from "@/components/ui/control";
import { FieldShell, fieldIds, type FieldChrome } from "@/components/ui/field-shell";
import { CheckIcon } from "@/components/ui/icons";
import type { Mask } from "@/components/ui/masks";

type NativeInput = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "value" | "defaultValue" | "onChange" | "type" | "prefix" | "className" | "children"
>;

export type TextFieldProps = FieldChrome &
  NativeInput & {
    value: string;
    onValueChange: (value: string) => void;
    type?: "text" | "tel" | "url" | "search";
    /** Fixed text inside the box before the input, such as "+91" */
    prefix?: string;
    /** Rewrites the value as it is typed */
    mask?: Mask;
    /** Shows a quiet check inside the box */
    valid?: boolean;
  };

const isWordChar = (c: string) => /[0-9A-Za-z]/.test(c);

/** Index in `text` just after its `count`-th letter or digit. */
function indexAfter(text: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (isWordChar(text.charAt(i)) && ++seen === count) return i + 1;
  }
  return text.length;
}

export function TextField({
  id,
  label,
  optional,
  hint,
  error,
  className,
  value,
  onValueChange,
  type = "text",
  prefix,
  mask,
  valid = false,
  ...input
}: TextFieldProps) {
  const { describedBy } = fieldIds(id, hint, error);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const raw = el.value;
    if (!mask) {
      onValueChange(raw);
      return;
    }
    const next = mask(raw, value);
    onValueChange(next);
    if (next === raw || el.selectionStart === null) return;
    // Keep the caret beside the character just typed, not at the end, after the mask
    // adds spaces or drops characters. Runs after React has written the new value.
    const caret = indexAfter(next, [...raw.slice(0, el.selectionStart)].filter(isWordChar).length);
    queueMicrotask(() => {
      if (document.activeElement === el) el.setSelectionRange(caret, caret);
    });
  };

  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error} className={className}>
      <div className={controlFrame(Boolean(error))}>
        {prefix ? (
          <span aria-hidden="true" className="flex select-none items-center border-r border-line pl-3.5 pr-3 text-steel">
            {prefix}
          </span>
        ) : null}
        <input
          {...input}
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={optional ? undefined : true}
          className={controlInput}
        />
        {valid && !error ? (
          <CheckIcon className="mr-3 size-5 shrink-0 self-center text-steel transition-opacity duration-150 starting:opacity-0" />
        ) : null}
      </div>
    </FieldShell>
  );
}
