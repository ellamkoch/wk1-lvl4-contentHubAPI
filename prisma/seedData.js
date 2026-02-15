/**
 * Seed helpers for the ContentHub API.
 *
 * Goals:
 * - Provide deterministic demo data for class and Postman usage.
 * - Provide a SAFE reset strategy for Supabase (remote DB):
 *   clear tables -> seed again (without dropping schema).
 *
 * Notes:
 * - We delete in dependency order (comments -> posts -> users) to avoid FK issues.
 * - This module is imported by both prisma/seed.js and scripts/dbReset.js.
 */

/**
 * Clears all rows from application tables.
 *
 * @param {import('../generated/prisma/index.js').PrismaClient} prisma
 */
export async function clearDatabase(prisma) {
  // Delete children first, then parents
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
}


/**
 * Inserts deterministic demo data.
 *
 * @param {import('../generated/prisma/index.js').PrismaClient} prisma
 * @returns {Promise<{ users: any[], posts: any[], comments: any[] }>}
 */
export async function seedDatabase(prisma) {
  // Create demo users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'teacher@example.com',
        name: 'Teacher User',
        // For class seed we store a placeholder hash.
        // Students should still register/login normally via the API for auth demos.
        passwordHash: 'seeded_password_hash_not_for_login',
      },
    }),
    prisma.user.create({
      data: {
        email: 'student@example.com',
        name: 'Student User',
        passwordHash: 'seeded_password_hash_not_for_login',
      },
    }),
  ]);

  // Create posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Welcome to ContentHub',
        body: 'This is a seeded post used for demo and testing.',
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'API Tips',
        body: 'Try GET /posts?includeCounts=true and GET /posts/:id?include=comments,author',
        authorId: users[0].id,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Student Post',
        body: 'This post was created by the seeded student user.',
        authorId: users[1].id,
      },
    }),
  ]);

  // Create comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        body: 'First seeded comment!',
        postId: posts[0].id,
        authorId: users[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        body: 'Second seeded comment!',
        postId: posts[0].id,
        authorId: users[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        body: 'This comment belongs to the student post.',
        postId: posts[2].id,
        authorId: users[0].id,
      },
    }),
  ]);

  return { users, posts, comments };
}
