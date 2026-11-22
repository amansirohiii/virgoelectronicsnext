"use client";

import type { FocusEvent } from "react";
import { cx } from "@/components/ui/control";
import { FieldShell, type FieldChrome } from "@/components/ui/field-shell";

export type ChoiceProps = FieldChrome & {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly string[];
  /** Called when focus leaves the whole group */
  onBlur?: () => void;
  disabled?: boolean;
};

/**
 * Pick one of a few options, drawn as joined buttons. Real radio inputs underneath,
 * so arrow keys, form posting and screen readers work as they do for any radio group.
 * Each radio's id is `${id}-${index}`.
 */
export function Choice({
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
}: ChoiceProps) {
  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
    onBlur?.();
  };

  return (
    <FieldShell group id={id} label={label} optional={optional} hint={hint} error={error} className={className}>
      <div
        onBlur={handleBlur}
        className={cx(
          "grid auto-cols-fr grid-flow-col border-[1.5px] bg-white transition-[border-color] duration-150 motion-reduce:transition-none",
          error ? "border-red-deep" : "border-mute hover:border-ink",
        )}
      >
        {options.map((option, i) => (
          <label
            key={option}
            className={cx(
              "relative flex min-h-12 cursor-pointer items-center justify-center px-3 py-2 text-center leading-tight",
              "transition-colors duration-150 motion-reduce:transition-none",
              "[&:not(:has(:checked)):hover]:bg-paper has-[:checked]:bg-ink has-[:checked]:font-semibold has-[:checked]:text-white",
              "has-[:focus-visible]:z-10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
              "has-[:disabled]:cursor-not-allowed",
              i > 0 && "border-l-[1.5px] border-mute",
            )}
          >
            <input
              id={`${id}-${i}`}
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onValueChange(option)}
              disabled={disabled}
              className="sr-only"
            />
            {option}
          </label>
        ))}
      </div>
    </FieldShell>
  );
}
