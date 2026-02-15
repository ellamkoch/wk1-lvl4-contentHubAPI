/**
 * SAFE database reset for development on Supabase.
 *
 * What it does:
 * - Deletes all rows in dependency order
 * - Reseeds deterministic demo data
 *
 * What it does NOT do:
 * - Drop schema
 * - Recreate migrations
 */
import { prisma } from '../src/db/prisma.js';
import { clearDatabase, seedDatabase } from '../prisma/seedData.js';


async function main() {
  await clearDatabase(prisma);
  const result = await seedDatabase(prisma);

  console.log('DB reset completed:', {
    users: result.users.length,
    posts: result.posts.length,
    comments: result.comments.length,
  });
}

main()
  .catch((err) => {
    console.error('DB reset failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
