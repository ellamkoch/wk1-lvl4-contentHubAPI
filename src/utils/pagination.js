/**
 * Parses pagination parameters from query objects.
 *
 * @param {{ limit?: string|number, offset?: string|number }} query
 * @returns {{ limit: number, offset: number }}
 */
export function parsePagination(query = {}) { //accepts a query object and defaults to an empty string array so it won't crash if nothing is passed.
  const rawLimit = query.limit ?? 20; //if limit is missing, default to 20
  const rawOffset = query.offset ?? 0; // if offset is missing, default to 0

  const limit = clampInt(rawLimit, 1, 100, 20); //limits, min. of 1 100 max, w/ a fallback of 20
  const offset = clampInt(rawOffset, 0, Number.MAX_SAFE_INTEGER, 0); //min of 0, max is a very large integer, 0 is the fallback

  return { limit, offset }; //returns numbers that the controller or repo can use
}

/**
 * @param {string|number} value
 * @param {number} min
 * @param {number} max
 * @param {number} fallback
 */
function clampInt(value, min, max, fallback) { //clampInt is a helper that converts inputs to a number, rejects non #'s, forces integers and enforces min/max bounds.
  const n = Number(value); //converts strings like "10" to 10 and "abc" to NaN (not a number)

  if (!Number.isFinite(n)) return fallback; //this says if the value is NaN or infinity, return the fallback identified above.

  const i = Math.trunc(n); //removes decimals, i.e. 5.9 to 5 or -3.2 to -3
  if (i < min) return min; //if the # is too small, it returns the min.
  if (i > max) return max; //if the # is too large, it returns the max
  return i;
}
