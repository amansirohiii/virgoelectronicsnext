"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cx } from "@/components/ui/control";
import { SpinnerIcon } from "@/components/ui/icons";

export type SubmitButtonProps = {
  children: ReactNode;
  /** Text while the form is sending */
  pendingLabel?: string;
  /** Overrides the parent form's own pending state */
  pending?: boolean;
  className?: string;
};

/** The red send button. Shows a spinner and "Sending" while its form is on its way. */
export function SubmitButton({ children, pendingLabel = "Sending", pending, className }: SubmitButtonProps) {
  const status = useFormStatus();
  const busy = pending ?? status.pending;

  return (
    <>
      <button
        type="submit"
        disabled={busy}
        className={cx("btn btn-red w-full disabled:cursor-wait disabled:opacity-100 sm:w-auto sm:min-w-48", className)}
      >
        {busy ? (
          <>
            <SpinnerIcon className="size-5 animate-spin motion-reduce:animate-none" />
            {pendingLabel}
          </>
        ) : (
          children
        )}
      </button>
      <span role="status" className="sr-only">
        {busy ? pendingLabel : ""}
      </span>
    </>
  );
}
