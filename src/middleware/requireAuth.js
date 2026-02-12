/**
 * Auth Middleware – requireAuth
 *
 * Purpose:
 * Protects routes by requiring a valid JWT Bearer token.
 *
 * Flow:
 * 1. Reads Authorization header.
 * 2. Ensures format is: "Bearer <token>".
 * 3. Verifies token signature and expiration using JWT_SECRET.
 * 4. Extracts the user id from token payload (sub claim).
 * 5. Attaches req.user = { id } for downstream controllers.
 *
 * If anything fails:
 * - Passes an unauthorized error to centralized error middleware.
 *
 * Notes:
 * - JWT_SECRET comes from environment variables via app.locals.config.
 * - Only the user id is stored in the token (standard "sub" claim).
 * - Controllers can trust req.user exists after this middleware runs.
 */

import { unauthorized } from '#utils/httpErrors';
import { verifyToken } from '#utils/jwt';

/**
 * Requires a valid Bearer token.
 * Sets req.user = { id } on success.
 */
export function requireAuth(req, _res, next) {
  const header = req.headers.authorization ?? '';//reads the auth header safely so the missing header won't crash
  const [scheme, token] = header.split(' '); //splits scheme + token. expected format, i.e., Authorization: Bearer <token>

  //rejects if Bearer or missing token is not found or correct.
  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized('Missing Bearer token'));//next() passes control to the centralized error handler middleware and skips the remaining route logic, letting the error middleware format the response.
  }

  try {
    //verifies token with injected JWT secret
    const secret = req.app.locals.config.JWT_SECRET; //Secret comes from env → app.locals.config
    const payload = verifyToken({ token, secret });//Verifies signature + expiration using JWT_SECRET

    req.user = { id: Number(payload.sub) }; //Convert JWT "sub" (subject) to number for consistency with user IDs
    return next();
  } catch {
    return next(unauthorized('Invalid token')); //this msg is vague again to help protect security of app/db
  }
}
