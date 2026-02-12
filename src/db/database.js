/**
 * database.js
 * ------------
 * Centralizes SQLite setup for the application.
 *
 * Responsibilities:
 * - Opens a SQLite database connection (file-backed or ':memory:')
 * - Ensures parent directory exists for file-backed databases
 * - Enables foreign key enforcement (PRAGMA foreign_keys = ON)
 *
 * This module does NOT:
 * - Read environment variables
 * - Hardcode database paths
 * - Define tables or run migrations
 *
 * Keeping this logic isolated makes the DB connection reusable and testable.
 */

import { DatabaseSync } from 'node:sqlite'; // Node's built-in SQLite driver
import fs from 'node:fs'; // Used to create directories if needed
import path from 'node:path'; // Safely resolves folder paths so we don't have ENOENT errors

/**
 * Opens a SQLite database (file-backed or ':memory:') using node:sqlite.
 *
 * @param {string} dbPath
 * @returns {DatabaseSync}
 */

/*** This function:
 * - Accepts a DB path
 * - Ensures the parent directory exists (for file-backed DBs)
 * - Returns a connected SQLite instance
 *
 * It does NOT:
 * - Read environment variables
 * - Hardcode a database path
 */
export function openDatabase(dbPath) {
  // Ensure dbPath is treated as a string
  const dbPathStr = String(dbPath);

  // For file-backed databases, ensures the parent directory exists
  if (dbPathStr !== ':memory:') {
    const dir = path.dirname(dbPathStr);
    fs.mkdirSync(dir, { recursive: true }); // recursive: true allows nested folders and avoids crashing if folder already exists
  }

  const db = new DatabaseSync(dbPathStr, { open: true }); //opens/creates the connection to the SQLite db file and immediately connects

  // Enable foreign key enforcement (SQLite does NOT enable this by default)
  db.exec('PRAGMA foreign_keys = ON;'); //with this turned on, if you attempt to delete a parent row, integrity is enforced.

  return db;
}
