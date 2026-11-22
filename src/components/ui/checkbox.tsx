import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "@/components/ui/control";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "children"> & {
  label: ReactNode;
  /** Draws the row as a bordered tile that is selected as a whole */
  tile?: boolean;
  className?: string;
};

/**
 * A real checkbox, so forms post it and screen readers know it, with the
 * browser's look replaced by a drawn box and a tick that draws itself in.
 */
export function Checkbox({ label, tile = false, className, ...input }: CheckboxProps) {
  return (
    <label
      className={cx(
        "flex min-h-11 cursor-pointer items-center gap-3 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
        tile &&
          "border-[1.5px] border-line bg-white px-3 py-2 transition-[border-color,box-shadow] duration-150 hover:border-ink has-[:checked]:border-ink has-[:checked]:shadow-[inset_0_0_0_1px_var(--color-ink)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink motion-reduce:transition-none",
        className,
      )}
    >
      <span className="relative grid size-5 shrink-0 place-items-center">
        <input
          {...input}
          type="checkbox"
          className={cx(
            "peer absolute inset-0 m-0 cursor-pointer appearance-none border-[1.5px] border-mute bg-white",
            "transition-[background-color,border-color] duration-150 motion-reduce:transition-none",
            "hover:border-ink checked:border-ink checked:bg-ink aria-[invalid=true]:border-red-deep disabled:cursor-not-allowed",
            tile ? "focus-visible:outline-none" : "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
          )}
        />
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
          className="pointer-events-none relative size-4 text-white [stroke-dasharray:16] [stroke-dashoffset:16] transition-[stroke-dashoffset] duration-150 ease-out peer-checked:[stroke-dashoffset:0] motion-reduce:transition-none"
        >
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
        </svg>
      </span>
      <span className="leading-snug">{label}</span>
    </label>
  );
}
