//This is the main entry point for the project. It acts like a manager, saying the business is open and ready to accept customers.
import { ensureEnv } from '#utils/env';
import { createApp } from '#app';
import { createRepos } from '#repositories/index';
import { prisma } from './db/prisma.js';

const env = ensureEnv(); // Initializes environment configuration

const repos = await createRepos(prisma);

const app = createApp({
  // This uses the createApp file we built and hooks it up to the rest of the app.
  repos,
  config: { JWT_SECRET: env.JWT_SECRET }, //passing the JWT_Secret into createApp, which allows middleware to access it.
});

// This starts the server and officially tells the internet that the app can be found at this address.
app.listen(env.PORT, () => {
  console.log(`ContentHub API listening on http://localhost:${env.PORT}`);
});

/**
 * Graceful shutdown closes DB connections.
 */
async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
