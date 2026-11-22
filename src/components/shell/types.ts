/** Shape of a category in the header menus. Kept apart from the catalogue so client code stays small. */
export type MenuCategory = {
  slug: string;
  name: string;
  href: string;
  count: number;
  image: { src: string } | null;
};

export const modelsLabel = (n: number) => `${n} ${n === 1 ? "model" : "models"}`;
