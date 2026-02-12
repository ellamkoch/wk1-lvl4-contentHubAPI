//This is the main entry point for the project. It acts like a manager, saying the business is open and ready to accept customers.
import { ensureEnv } from '#utils/env';
import { createApp } from '#app';
import { createRepos } from '#repositories/index';
import { openDatabase } from './db/database.js';
import { runMigrations } from './db/migrate.js';

const env = ensureEnv(); // Initializes environment configuration

const db = openDatabase(env.DB_PATH); // Open SQLite DB. This creates the db file if it doesn't exist

runMigrations(db); // Apply schema migrations (creates tables if needed)

const repos = await createRepos(db); // Create repository layer using the shared DB connection

const app = createApp({
  // This uses the createApp file we built and hooks it up to the rest of the app.
  repos,
  config: { JWT_Secret: env.JWT_SECRET }, //passing the JWT_Secret into createApp, which allows middleware to access it.
});

// This starts the server and officially tells the internet that the app can be found at this address.
app.listen(env.PORT, () => {
  console.log(`ContentHub API listening on http://localhost:${env.PORT}`);
});
