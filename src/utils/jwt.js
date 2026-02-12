/** This file is where:
 - tokens are signed and verified
 - and the JWT secret key is used.
*/

import jwt from 'jsonwebtoken';

/**
 * signs a JWT where `sub` is the user id.
 *
 * @param {{ userID: number, secret: string }} params
 * @returns {string}
 * sub = subject, a standard JWT claim
 */

export function signToken({ userId, secret }) { //secret is injected from env
    return jwt.sign({ sub: userId }, secret, { expiresIn: '2h' });
}

/**
 * Validates the JWT signature
 * Validates the expiration
 * Returns payload, which is the { sub: userId }
 * @param {{ token: string, secret: string }} params
 * @returns {{ sub: number }}
*/

export function verifyToken({ token, secret }) {
    return jwt.verify(token,secret);
}

