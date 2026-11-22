/**
 * Company facts and contact details. This file is the only place they live.
 *
 * Empty strings mean "not supplied yet". Every part of the site that shows a
 * contact detail checks for a value first and renders nothing when it is empty,
 * so nothing here needs a placeholder.
 */
export const site = {
  name: "Virgo Electronics",
  brand: "Virgo",
  url: "https://www.virgoelectronics.com",
  descriptor: "Electrical appliances made in Ghaziabad",

  // Company facts as stated on the previous website. Pending written confirmation.
  founded: 2000,
  founder: "Mr. Naresh Chand",
  city: "Ghaziabad",
  state: "Uttar Pradesh",
  plantArea: "MG Road Industrial Area, Ghaziabad",

  contact: {
    /** Display form, e.g. "+91 98765 43210" */
    phone: "",
    /** Digits only with country code, e.g. "919876543210" */
    whatsapp: "",
    email: "",
    /** Postal address lines */
    address: [] as string[],
    hours: "",
    /** e.g. "2 working days". Shown on forms and confirmation screens when set. */
    replyWithin: "",
  },

  social: {
    instagram: "",
    youtube: "",
    facebook: "",
  },

  /**
   * Statements the company has to confirm before they are shown.
   * `noApplicationFee`: "We never charge a fee for a dealership or distributorship application."
   */
  statements: {
    noApplicationFee: false as boolean,
  },

  analytics: {
    gaId: "G-8G3FFRD5HN",
  },
} as const;

export type Site = typeof site;

export const hasPhone = () => site.contact.phone.length > 0;
export const hasWhatsApp = () => site.contact.whatsapp.length > 0;
export const hasEmail = () => site.contact.email.length > 0;

export function telHref(): string {
  return `tel:${site.contact.phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${site.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
