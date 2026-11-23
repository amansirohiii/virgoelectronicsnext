import type { ReactNode } from "react";
import { AlertIcon } from "@/components/ui/icons";
import { cx } from "@/components/ui/control";

/** Label, hint and error shared by every form control. */
export type FieldChrome = {
  id: string;
  label: ReactNode;
  /** Adds "(optional)" after the label */
  optional?: boolean;
  hint?: ReactNode;
  /** Message shown under the control. Empty means no error. */
  error?: string | null;
  /** Classes for the outer wrapper, such as grid placement */
  className?: string;
};

/**
 * Element ids a single control points at with aria-labelledby and aria-describedby.
 * Under a single control the error takes the hint's place, so only one of the two exists.
 */
export function fieldIds(id: string, hint: ReactNode, error: string | null | undefined, ...extra: (string | undefined)[]) {
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return {
    labelId: `${id}-label`,
    hintId,
    errorId,
    describedBy: [hintId, errorId, ...extra].filter(Boolean).join(" ") || undefined,
  };
}

/**
 * Lays out a control with its label, hint and error.
 *
 * A single control has its hint under the box, so two fields side by side keep
 * their labels and boxes on the same lines whether or not one of them has a hint.
 * The error, when there is one, takes the hint's place.
 *
 * `group` renders a fieldset and legend for sets of checkboxes or radios. A group
 * is never beside another field, so its hint stays above the options.
 */
export function FieldShell({
  id,
  label,
  optional,
  hint,
  error,
  className,
  group = false,
  footer,
  children,
}: FieldChrome & {
  group?: boolean;
  /** Shown at the right of the line under the control, such as a character count */
  footer?: ReactNode;
  children: ReactNode;
}) {
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const labelText = (
    <>
      {label}
      {optional ? <span className="font-normal text-steel"> (optional)</span> : null}
    </>
  );
  const errorLine = error ? (
    <p id={errorId} className="field-error flex items-start gap-1.5">
      <AlertIcon className="mt-px size-4 shrink-0" />
      <span>{error}</span>
    </p>
  ) : null;

  if (group) {
    const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
    return (
      <fieldset id={id} aria-describedby={describedBy} className={cx("min-w-0", className)}>
        <legend id={labelId} className="field-label">
          {labelText}
        </legend>
        {hint ? (
          <p id={hintId} className="field-hint mb-2 mt-0">
            {hint}
          </p>
        ) : null}
        {children}
        {errorLine}
      </fieldset>
    );
  }

  const under =
    errorLine ??
    (hint ? (
      <p id={hintId} className="field-hint">
        {hint}
      </p>
    ) : null);
  return (
    <div className={className}>
      <label id={labelId} htmlFor={id} className="field-label">
        {labelText}
      </label>
      {children}
      {under || footer ? (
        <div className="flex items-start justify-between gap-4">
          {under ?? <span />}
          {footer}
        </div>
      ) : null}
    </div>
  );
}
