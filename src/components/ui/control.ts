/** Joins class names, skipping empty ones. */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

/**
 * The box every text-like control sits in: square, 1.5 px mid-grey border that
 * turns ink on hover and focus, red when invalid, and the site's focus ring.
 * Works whether the focusable element is the frame itself (a button) or inside it (an input).
 */
export function controlFrame(invalid: boolean): string {
  return cx(
    "relative flex w-full min-h-12 items-stretch border-[1.5px] bg-white text-base text-ink",
    "transition-[border-color] duration-150 ease-out motion-reduce:transition-none",
    "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink",
    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-ink",
    "disabled:cursor-not-allowed disabled:bg-paper has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-paper",
    invalid
      ? "border-red-deep"
      : "border-mute hover:border-ink focus-visible:border-ink has-[:focus-visible]:border-ink",
  );
}

/** The bare input or textarea inside a frame. The frame draws the border and focus ring. */
export const controlInput =
  "min-w-0 flex-1 bg-transparent px-3.5 py-3 text-base text-ink outline-none placeholder:text-steel disabled:cursor-not-allowed";
