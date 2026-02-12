/**
 * Parses pagination parameters from query objects.
 *
 * @param {{ limit?: string|number, page?: string|number }} query
 * @returns {{ limit: number, page: number, offset: number }}
 */
export function parsePagination(query = {}) {
  //accepts a query object and defaults to an empty object so it won't crash if nothing is passed.
  const rawLimit = query.limit ?? 20; //if limit is missing, default to 20
  const rawPage = query.page ?? 1; // if page is missing, default to 0

  const limit = clampInt(rawLimit, 1, 100, 20); //limits, min. of 1 100 max, w/ a fallback of 20
  const page = clampInt(rawPage, 1, Number.MAX_SAFE_INTEGER, 1); //min of 1, max is a very large integer, 1 is the fallback

  const offset = (page - 1) * limit;

  return { limit, page, offset }; //returns numbers that the controller or repo can use
}

/**
 * @param {string|number} value
 * @param {number} min
 * @param {number} max
 * @param {number} fallback
 */
function clampInt(value, min, max, fallback) {
  //clampInt is a helper that converts inputs to a number, rejects non #'s, forces integers and enforces min/max bounds.
  const n = Number(value); //converts strings like "10" to 10 and "abc" to NaN (not a number)

  if (!Number.isFinite(n)) return fallback; //this says if the value is NaN or infinity, return the fallback identified above.

  const i = Math.trunc(n); //removes decimals, i.e. 5.9 to 5 or -3.2 to -3
  if (i < min) return min; //if the # is too small, it returns the min.
  if (i > max) return max; //if the # is too large, it returns the max
  return i;
}
