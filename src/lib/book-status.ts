export const BOOK_STATUSES = ["TO_READ", "READING", "READ"] as const;
export type BookStatusValue = (typeof BOOK_STATUSES)[number];

export function parseStatus(value: unknown): BookStatusValue | undefined {
  return typeof value === "string" && (BOOK_STATUSES as readonly string[]).includes(value)
    ? (value as BookStatusValue)
    : undefined;
}
