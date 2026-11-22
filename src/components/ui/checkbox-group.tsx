"use client";

import type { FocusEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldShell, type FieldChrome } from "@/components/ui/field-shell";

export type CheckboxGroupProps = FieldChrome & {
  name: string;
  value: readonly string[];
  /** Receives the checked options in the order they are listed */
  onValueChange: (value: string[]) => void;
  options: readonly string[];
  /** Called when focus leaves the whole group */
  onBlur?: () => void;
  disabled?: boolean;
};

/** A set of checkbox tiles under one legend. Each box's id is `${id}-${index}`. */
export function CheckboxGroup({
  id,
  label,
  optional,
  hint,
  error,
  className,
  name,
  value,
  onValueChange,
  options,
  onBlur,
  disabled,
}: CheckboxGroupProps) {
  const toggle = (option: string, checked: boolean) =>
    onValueChange(options.filter((o) => (o === option ? checked : value.includes(o))));

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
    onBlur?.();
  };

  return (
    <FieldShell group id={id} label={label} optional={optional} hint={hint} error={error} className={className}>
      <div onBlur={handleBlur} className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
        {options.map((option, i) => (
          <Checkbox
            key={option}
            tile
            id={`${id}-${i}`}
            name={name}
            value={option}
            label={option}
            checked={value.includes(option)}
            onChange={(e) => toggle(option, e.currentTarget.checked)}
            aria-invalid={error ? true : undefined}
            disabled={disabled}
          />
        ))}
      </div>
    </FieldShell>
  );
}
