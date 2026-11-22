const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** "six" for 6, digits from 13 up. */
export function numberWord(n: number): string {
  return WORDS[n] ?? String(n);
}

/** "A", "A and B", "A, B and C" */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
