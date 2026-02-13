import jwt from 'jsonwebtoken';

/**
 * Signs a JWT where `sub` is the user id.
 *
 * @param {{ userId: number, secret: string }} params
 * @returns {string}
 */
export function signToken({ userId, secret }) {
  return jwt.sign({ sub: userId }, secret, { expiresIn: '2h' });
}

/**
 * Verifies a JWT and returns payload.
 *
 * @param {{ token: string, secret: string }} params
 * @returns {{ sub: number }}
 */
export function verifyToken({ token, secret }) {
  return jwt.verify(token, secret);
}
