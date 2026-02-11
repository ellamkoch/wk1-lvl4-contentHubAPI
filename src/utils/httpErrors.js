/**
 * Lightweight HTTP error model to standardize error handling across the API.
 * Controllers can throw these errors or call `next(err)` with them.
 *
 * Error middleware now checks `instanceof HttpError`, users 'err.Status', and returns a consistent JSON shape with the following params below.
 *
 * Starting Day 2, all error responses follow:
 *   { error: { message, code, details? } }
 *
 *
 */
export class HttpError extends Error {
  /**
   * @param {number} status - HTTP status code that's sent (400, 404, etc.)
   * @param {string} code - predictable machine-friendly error code (e.g., 'not_found')
   * @param {string} message - human-friendly message to understand the error
   * @param {any} [details] - optional extra details for debugging/validation
   */
  constructor(status, code, message, details) {
    super(message); // this sets the normal Error msg so logging/debugging still work like a standard error.
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Helper constructors for common errors.
 * Keep them in one place so the whole class uses the same shapes/codes.
 */
export const badRequest = (message = 'Bad Request', details) =>
  new HttpError(400, 'bad_request', message, details);

export const unauthorized = (message = 'Unauthorized', details) =>
  new HttpError(401, 'unauthorized', message, details);

export const forbidden = (message = 'Forbidden', details) =>
  new HttpError(403, 'forbidden', message, details);

export const notFound = (message = 'Not Found', details) =>
  new HttpError(404, 'not_found', message, details);

export const conflict = (message = 'Conflict', details) =>
  new HttpError(409, 'conflict', message, details);
