/**
 * Central error handler.
 * IMPORTANT: Express recognizes this as error middleware because it has 4 args.
 * A centralized error handler in an API project is important because it provides a single, consistent way to manage all unexpected problems, ensuring your application remains stable and user-friendly by preventing crashes, having cleaner code, consistent responses, better debugging and security. 
 *
 * @param {Error} err
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export function errorHandler(err, _req, res, _next) {
  console.error(err);

  res.status(500).json({
    error: {
      message: 'Internal Server Error',
    },
  });
}
