import type { CSSProperties } from "react";

/** Inline style that sets the `--i` stagger step read by `.rise` and `.reveal`. */
export const stagger = (i: number) => ({ "--i": i }) as CSSProperties;
