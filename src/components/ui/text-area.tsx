"use client";

import type { TextareaHTMLAttributes } from "react";
import { controlFrame, controlInput, cx } from "@/components/ui/control";
import { FieldShell, fieldIds, type FieldChrome } from "@/components/ui/field-shell";
import { CheckIcon } from "@/components/ui/icons";

type NativeTextArea = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id" | "value" | "defaultValue" | "onChange" | "className" | "children" | "maxLength"
>;

export type TextAreaProps = FieldChrome &
  NativeTextArea & {
    value: string;
    onValueChange: (value: string) => void;
    /** Longest text allowed; also shows a count such as "0 / 1000" */
    maxLength?: number;
    /** Shows a quiet check inside the box */
    valid?: boolean;
  };

export function TextArea({
  id,
  label,
  optional,
  hint,
  error,
  className,
  value,
  onValueChange,
  maxLength,
  valid = false,
  rows = 4,
  ...textarea
}: TextAreaProps) {
  const countId = maxLength ? `${id}-count` : undefined;
  const { describedBy } = fieldIds(id, hint, error, countId);
  const atLimit = maxLength !== undefined && value.length >= maxLength;

  const count = maxLength ? (
    <p id={countId} className={cx("mt-1.5 shrink-0 text-sm tabular-nums", atLimit ? "font-semibold text-red-deep" : "text-steel")}>
      <span aria-hidden="true">
        {value.length} / {maxLength}
      </span>
      <span className="sr-only">
        {value.length} of {maxLength} characters
      </span>
    </p>
  ) : null;

  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint} error={error} className={className} footer={count}>
      <div className={controlFrame(Boolean(error))}>
        <textarea
          {...textarea}
          id={id}
          rows={rows}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onValueChange(e.currentTarget.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={optional ? undefined : true}
          className={cx(controlInput, "min-h-28 resize-y pr-10")}
        />
        {valid && !error ? (
          <CheckIcon className="pointer-events-none absolute right-3 top-3.5 size-5 text-steel transition-opacity duration-150 starting:opacity-0" />
        ) : null}
      </div>
    </FieldShell>
  );
}
