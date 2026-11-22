/**
 * Enquiry form. One component for every enquiry on the site.
 *
 * The props below are the fixed interface other pages rely on.
 */
export type EnquiryType = "dealer" | "distributor" | "bulk" | "product" | "general";

export type EnquiryFormProps = {
  type: EnquiryType;
  /** Set when the form is opened from a product page */
  product?: { name: string; path: string; category: string };
  /** Heading shown above the form. Omit to render the form without one. */
  heading?: string;
};

export function EnquiryForm(_props: EnquiryFormProps) {
  return null;
}
