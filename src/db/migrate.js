/**
 * migrate.js
 * -----------
 * Runs database schema setup using a simple SQL file.
 *
 * Responsibilities:
 * - Locate the initial migration file (001_init.sql)
 * - Read its contents
 * - Execute the SQL against the provided SQLite connection
 *
 * This is intentionally simple for teaching purposes.
 * In production, a migration tool would track versions and history.
 */

//these are used to locate the SQL file and read it as text
import fs from 'node:fs';
import path from 'node:path';

/**
 * Runs migrations in a simple single-file approach (teaching-focused).
 * For production, you would typically use a migration tool.
 *
 * @param {import('node:sqlite').DatabaseSync} db
 */

//This function accepts a live SQLite connection (DatabaseSync), which loads the SQL file and executes it against the DB
export function runMigrations(db) {
  const sqlPath = path.resolve('src/db/migrations/001_init.sql'); //resolves the path to the migration file. path.resolve ensures the file path works regardless of where the script is executed from to prevent relative path confusion.
  const sql = fs.readFileSync(sqlPath, 'utf8'); //reads the sql file as a string.
  db.exec(sql); //executes the full SQL file
}
