/**
 * Underline that grows under a name when anything in its `group` link is hovered
 * or focused. The shared `.underline-grow` class only reacts to its own hover or
 * a direct parent link, and as an unlayered rule it cannot be overridden by a
 * utility, so cards and tiles whose name sits deeper inside the link use this.
 */
export const groupUnderline =
  "bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-[length:0%_1.5px] bg-[position:0_100%] pb-[0.12em] transition-[background-size] duration-300 ease-out-quart group-hover:bg-[length:100%_1.5px] group-focus-visible:bg-[length:100%_1.5px]";
