/**
 * Pure input-validation helpers shared by the Convex mutations.
 *
 * These are intentionally free of any Convex runtime dependency so they can be
 * unit-tested directly (see `tests/validation.test.ts`).
 */

/** Trim a required string and enforce a max length, throwing on violations. */
export function trimRequired(value: string, label: string, maxLength: number): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} не может быть пустым.`);
  }
  if (trimmed.length > maxLength) {
    throw new Error(`${label} слишком длинный: максимум ${maxLength} символов.`);
  }
  return trimmed;
}

/** Trim an optional string and enforce a max length (empty is allowed). */
export function trimOptional(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new Error(`Слишком длинный текст: максимум ${maxLength} символов.`);
  }
  return trimmed;
}

/** Assert a string is a real calendar date in `YYYY-MM-DD` form. */
export function assertIsoDate(value: string, label: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} должна быть датой в формате YYYY-MM-DD.`);
  }
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${label} выглядит как дата, но календарь с этим не согласен.`);
  }
}
