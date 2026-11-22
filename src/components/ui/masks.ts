/**
 * Input masks for `TextField`. Each takes what is now in the box and what was
 * there before, and returns what the box should show.
 */
export type Mask = (next: string, previous: string) => string;

export const digitsOnly =
  (max: number): Mask =>
  (next) =>
    next.replace(/\D/g, "").slice(0, max);

export const upperAlphanumeric =
  (max: number): Mask =>
  (next) =>
    next
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, "")
      .slice(0, max);

export const noSpaces: Mask = (next) => next.replace(/\s/g, "");

/**
 * Indian mobile shown as "98765 43210" beside a fixed +91.
 * A pasted or autofilled "+91 98765 43210" or "098765 43210" loses its prefix;
 * a valid mobile never starts with 0, so leading zeros are dropped as you type.
 */
export const indianMobile: Mask = (next, previous) => {
  let digits = next.replace(/\D/g, "");
  const pasted = digits.length - previous.replace(/\D/g, "").length > 1;
  if (pasted && digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  digits = digits.replace(/^0+/, "").slice(0, 10);
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
};
