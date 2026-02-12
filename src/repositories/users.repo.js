/**
 * users.repo.js
 * -------------
 * Day 4: SQLite-backed users repository.
 *
 * Stores hashed passwords (hashing happens before reaching the repo).
 * This file is responsible only for database access.
 *
 * @typedef {{ id: number, email: string, name: string, passwordHash: string }} User
 */

export function createUsersRepo(db) {
  // Prepared statement for inserting a new user
  const stmtInsert = db.prepare(`
    INSERT INTO users (email, name, password_hash)
    VALUES (?, ?, ?)
  `);
  // Prepared statement for retrieving a user by email
  const stmtByEmail = db.prepare(`
    SELECT id, email, name, password_hash AS passwordHash
    FROM users
    WHERE email = ?
    LIMIT 1
  `);

  return {
    /**
     * Inserts a new user into the database.
     * @param {{ email: string, name: string, passwordHash: string }} data
     * @returns {User}
     */

    create({ email, name, passwordHash }) {
      const info = stmtInsert.run(email, name, passwordHash);
      return { id: Number(info.lastInsertRowid), email, name, passwordHash };
    },

    /**
     * Finds a user by email.
     * @param {string} email
     * @returns {User | null}
     */
    findByEmail(email) {
      return stmtByEmail.get(email) ?? null;
    },
  };
}
