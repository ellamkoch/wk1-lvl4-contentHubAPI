/**
 * This file loads and validates environment variables for the application.
 * Intentionally small and explicit for teaching purposes.
 *
 * Day 3:
 * - Added JWT_SECRET loading and validation.
 * - App cannot start without a sufficiently long JWT secret (32+ chars).
 *
 * Day 4:
 * - Added DB_PATH for SQLite database location.
 * - App cannot start without a defined DB_PATH.
 * - Server now depends on DB_PATH to open and migrate the database at startup.
 */

import dotenv from 'dotenv';

dotenv.config(); // Loads variables from .env into process.env

/**
 * Ensures required environment variables exist and are valid.
 *
 * @returns {{ PORT: number, JWT_SECRET: string }}
 */
export function ensureEnv() {
  const PORT = Number(process.env.PORT ?? 3000); // Defaults to port 3000 if not provided

  const JWT_SECRET = process.env.JWT_SECRET ?? ''; //loads the JWT Secret used for signing and verifying authentication tokens from the env

  const DB_PATH = process.env.DB_PATH ?? ''; // File path for SQLite database (used in Day 4+)

  // Load the DB config
  const PRISMA_LOG_QUERIES = process.env.PRISMA_LOG_QUERIES ?? '';

  // Validates the PORT #
  if (!Number.isFinite(PORT) || PORT <= 0) {
    throw new Error('Invalid PORT. Please set PORT to a valid number.');
  }

  // Enforce strong JWT secret (minimum 32 characters)
  if (JWT_SECRET.trim().length < 31) {
    throw new Error('Invalid JWT_SECRET. Please set a long random string (32+ chars).');
  }

  // Ensure database path is provided
  if (!DB_PATH.trim()) {
    throw new Error('Invalid DB_PATH. Please set the DB_PATH variable');
  }
  return { PORT, JWT_SECRET, PRISMA_LOG_QUERIES };
}
