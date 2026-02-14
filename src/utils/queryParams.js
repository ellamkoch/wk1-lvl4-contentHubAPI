/**
 * This file contains small, reusable query parsing helpers for controllers.
 * Its purpose is to:
  * - Keep controllers clean and consistent.
  * - Centralize query param parsing logic
  * - Normalize user input from the URL (which is always a string)
  *
  * * Important:
 *   - Query parameters from Express always come in as strings.
 *   - These helpers safely convert them into usable data types
 *     (booleans, Sets, etc.).
 *
 * This file:
 *   - Does NOT access the database
 *   - Does NOT write HTTP responses
 *   - Does NOT perform business logic
 *
 * It simply transforms raw query input into consistent, safe values
 * so controllers don’t have to duplicate parsing logic.
 */

/**
 * Parse boolean query params safely.
 * Accepts: true/false/1/0 (case-insensitive).
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function parseBoolean(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim().toLowerCase();
  return v === 'true' || v === '1';
}

/**
 * Parse a CSV string like "comments,author" into a Set.
 *
 * @param {unknown} value
 * @returns {Set<string>}
 */
export function parseCsvSet(value) {
  if (typeof value !== 'string') return new Set();
  return new Set(
    value
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}
