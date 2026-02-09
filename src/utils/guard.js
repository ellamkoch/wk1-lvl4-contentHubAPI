/**This file holds small, reusable validation helpers that:
    - do no HTTP response writing
    - do no data storage
    - simply throw meaningful errors when assumptions are violated
That keeps controllers clean and readable.
*/

import { badRequest } from '#utils/httpErrors';

/**
 * //This is a helper that throws the provided error when a condition is false and stops request processing. It's used to enforce assumptions and stop request processing early.
 *
 * @param {any} condition
 * @param {Error} err
 */
export function ensure(condition, err) {
  if (!condition) {
    throw err;
  }
}

/**
 * Ensures required fields exist in an object (simple teaching-focused validation).
 * Throws a 400 Bad Request when missing.
 *
 * @param {object} obj
 * @param {string[]} fields
 */
export function ensureBodyFields(obj, fields) {
  const missing = fields.filter((f) => !obj?.[f]);
  if (missing.length > 0) {
    throw badRequest('Missing required fields', { missing });
  }
}
