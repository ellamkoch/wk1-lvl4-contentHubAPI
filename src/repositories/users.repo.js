/**
 * Users Repository (Prisma-backed)
 *
 * Provides minimal data access methods for User entities.
 *
 * Responsibilities:
 * - Create new users (during registration)
 * - Find user by email (for login)
 * - Find user by ID (for auth/ownership checks)
 *
 * Architecture Notes:
 * - Backed by Prisma Client (Supabase Postgres)
 * - Replaces previous SQLite / in-memory implementation
 * - Repository remains HTTP-agnostic (no status codes here)
 * - Controllers handle validation, hashing, and response shaping
 *
 * Security Model:
 * - Password hashing is handled before reaching this layer
 * - Repository stores passwordHash but does not compare passwords
 * - Unique email constraint enforced at the database level
 *
 * Return Contracts:
 * - Returns user object on success
 * - Returns null if user not found
 * - Throws Prisma errors for unique constraint violations
 *
 * Engine Swap Guarantee:
 * - Controller behavior unchanged
 * - Auth middleware unchanged
 * - Only persistence layer updated
 *
 * @param {import('../../generated/prisma/client.js').PrismaClient} prisma
 */

export function createUsersRepo(prisma) {

  return {
    /**
     * Create a user.
     *
     * @param {{ email: string, name: string, passwordHash: string }} data
     */
    async create(data) {
      return prisma.user.create({ data });
    },

    /**
     * Find a user by email.
     *
     * @param {string} email
     */
    async findByEmail(email) {
      return prisma.user.findUnique({ where: { email } });
    },

  /**
     * Find a user by id.
     *
     * @param {string} id
     */
    async findById(id) {
      return prisma.user.findUnique({ where: { id } });
    },
  };
}
