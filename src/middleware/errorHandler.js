/**
 * Central error handler.
 * IMPORTANT: Express recognizes this as error middleware because it has 4 arguments.
 * A centralized error handler in an API project is important because it provides a single, consistent way to manage all unexpected problems, ensuring your application remains stable and user-friendly by preventing crashes, having cleaner code, consistent responses, better debugging and security.
 *
 * @param {Error} err
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
import { HttpError } from '#utils/httpErrors';

export function errorHandler(err, _req, res, _next) {
  console.error(err);

  // Our known HTTP error branch of code.
  //If the known error is one of our HTTP errors, it will use the code stored on the err.status and return the msg stored in the error.
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
  }

  // fall back/guard for unknown/unexpected errors
  return res.status(500).json({
    error: {
      message: 'Internal Server Error',
      code: 'internal_error',
    },
  });
}
