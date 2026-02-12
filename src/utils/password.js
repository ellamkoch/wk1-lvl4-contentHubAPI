import bcrypt from 'bcryptjs';

/**
 * This file hashes a password using bcrypt
 * NOTE: bcryptjs is JS-only and works well in teaching environments
 *
 * @param {string} password
 * @returns {string}
 */
/**This function:
 * - Takes plaintext password
 * - Generates salt internally
 * - Hashes password + salt
 * - Returns a secure string
 */

export function hashPassword(password) {
    const saltRounds = 10; // salt rounds are computational costs. 10 is standard and safe for learning. Higher salt rounds makes your app slower but more secure.

    return bcrypt.hashSync(password, saltRounds);
}

/**
 * This function compares the plaintext password with stored hash, rehashes the plaintext internally, and returns true or fals. 
 * @param {string} password
 * @param {string} hash
 * @returns {boolean}
 */

export function verifyPassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}
