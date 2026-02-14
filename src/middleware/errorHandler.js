/**
 * Global error handler middleware (Express).
 *
 * Responsibilities:
 *  - Normalize all errors into the API error envelope:
 *      { ok: false, error: { code, message, details } }
 *  - Map known Prisma DB errors into appropriate HTTP status codes.
 *  - Handle app-defined HttpError instances thrown from controllers.
 *  - Provide a safe fallback for unexpected errors.
 *
 * Prisma error codes we map here:
 *  - P2002: unique constraint violation
 *  - P2003: foreign key constraint violation
 *  - P2025: record not found for an operation
 *
 * Note:
 *  - This file does NOT decide business logic.
 *  - It only translates errors into consistent HTTP responses.
 *  - Must be installed LAST in createApp (Express recognizes error middleware by 4 args).
 */

import { HttpError } from '#utils/httpErrors';
import { Prisma } from '../../generated/prisma/index.js';

/**
 * Sends a standardized error response in our API envelope shape.
 *
 * @param {import('express').Response} res
 * @param {number} status - HTTP status code (e.g., 404, 409, 500)
 * @param {string} code - Machine-readable error code (e.g., "RECORD_NOT_FOUND")
 * @param {string} message - Human-readable message
 * @param {unknown} [details=null] - Extra info (optional), safe for debugging
 * @returns {import('express').Response}
 */

function sendError(res, status, code, message, details = null) {
  return res.status(status).json({
    ok: false,
    error: { code, message, details },
  });
}
/**
 * Map Prisma known request errors to HttpError objects we can send consistently.
 *
 * If the error isn't a PrismaClientKnownRequestError, return null (meaning: "not ours").
 *
 * @param {unknown} err
 * @returns {HttpError|null}
 */

function mapPrismaError(err) {
// Prisma recommends handling errors by checking their type/code.
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return null;

  switch (err.code) {
    case 'P2002':
      return new HttpError(
        409,
        'UNIQUE_CONSTRAINT',
        'A record with these unique fields already exists.',
        err.meta ?? null,
      );
    case 'P2003':
      return new HttpError(
        409,
        'FOREIGN_KEY_CONSTRAINT',
        'A related record was not found (foreign key constraint).',
        err.meta ?? null,
      );
    case 'P2025':
      return new HttpError(404, 'RECORD_NOT_FOUND', 'Record not found.', err.meta ?? null);
    default:
      return new HttpError(500, 'DATABASE_ERROR', 'A database error occurred.', {
     meta: err.meta ?? null,
      });
  }
}
/**
 * Factory that returns the actual Express error-handling middleware.
 *
 * Why a factory?
 * - Leaves room to inject config later (logging verbosity, environment behavior, etc.)
 * - Makes testing/overrides easier if needed
 *
 * @returns {(err: unknown, req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => any}
 */
export function createErrorHandler() {
  // eslint-disable-next-line no-unused-vars
  return function errorHandler(err, req, res, next) {
     // 1) Prisma DB errors → mapped to HttpError → standardized response
    const prismaMapped = mapPrismaError(err);
    if (prismaMapped) {
      return sendError(
        res,
        prismaMapped.status,
        prismaMapped.code,
        prismaMapped.message,
        prismaMapped.details,
      );
    }
    // 2) App-thrown HttpError instances → standardized response
    if (err instanceof HttpError) {
      return sendError(res, err.status, err.code, err.message, err.details);
    }

    // 3) Fallback for unknown/unexpected errors
    console.error(err);

    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Something went wrong.');
  };
}
