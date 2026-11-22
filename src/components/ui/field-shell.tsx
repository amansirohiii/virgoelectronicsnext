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

/** Element ids the control points at with aria-labelledby and aria-describedby. */
export function fieldIds(id: string, hint: ReactNode, error: string | null | undefined, ...extra: (string | undefined)[]) {
  const hintId = hint ? `${id}-hint` : undefined;
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
 * `group` renders a fieldset and legend for sets of checkboxes or radios.
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
  /** Shown at the right of the error line, such as a character count */
  footer?: ReactNode;
  children: ReactNode;
}) {
  const { labelId, hintId, errorId, describedBy } = fieldIds(id, hint, error);
  const labelText = (
    <>
      {label}
      {optional ? <span className="font-normal text-steel"> (optional)</span> : null}
    </>
  );
  const body = (
    <>
      {hint ? (
        <p id={hintId} className="field-hint -mt-0.5 mb-2">
          {hint}
        </p>
      ) : null}
      {children}
      {error || footer ? (
        <div className="flex items-start justify-between gap-4">
          {error ? (
            <p id={errorId} className="field-error flex items-start gap-1.5">
              <AlertIcon className="mt-px size-4 shrink-0" />
              <span>{error}</span>
            </p>
          ) : (
            <span />
          )}
          {footer}
        </div>
      ) : null}
    </>
  );

  if (group) {
    return (
      <fieldset id={id} aria-describedby={describedBy} className={cx("min-w-0", className)}>
        <legend id={labelId} className="field-label">
          {labelText}
        </legend>
        {body}
      </fieldset>
    );
  }
  return (
    <div className={className}>
      <label id={labelId} htmlFor={id} className="field-label">
        {labelText}
      </label>
      {body}
    </div>
  );
}
