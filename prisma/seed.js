/**
 * Prisma seed entrypoint.
 *
 * This script is executed by:
 *   npx prisma db seed
 *
 * Prisma ORM v7 runs seeding ONLY when invoked explicitly. :contentReference[oaicite:9]{index=9}
 */
import { prisma } from '../src/db/prisma.js';
import { seedDatabase } from './seedData.js';

// Also, we'll review if the environment is not development to prevent this action
if (process.env.NODE_ENV !== 'development') {
  throw new Error('Seeding only works on development');
}

async function main() {
  const result = await seedDatabase(prisma);

  console.log('Seed completed:', {
    users: result.users.length,
    posts: result.posts.length,
    comments: result.comments.length,
  });
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
