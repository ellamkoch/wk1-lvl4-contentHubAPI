/**
 * Repository Factory (Prisma-backed)
 *
 * This module centralizes creation of all data repositories.
 * It injects the Prisma Client into each repository and returns
 * a structured object used by the application layer.
 *
 * Responsibilities:
 * - Lazily import repository modules
 * - Inject shared Prisma client
 * - Preserve repository contracts
 * - Keep controllers unaware of database implementation
 *
 * Architecture Notes:
 * - Controllers depend on repository interfaces only
 * - Repositories remain HTTP-agnostic
 * - Ownership enforcement stays inside individual repos
 * - This file enables swapping database engines without
 *   modifying controllers or route logic
 *
 * Engine:
 * - Prisma Client (Supabase Postgres)
 * - Replaces previous SQLite injection
 *
 * @param {import('../../generated/prisma/client.js').PrismaClient} prisma
 * @returns {{
 *   posts: import('./posts.repo.js').PostsRepo,
 *   comments: import('./comments.repo.js').CommentsRepo,
 *   users: import('./users.repo.js').UsersRepo
 * }}
 */

// This function is a central factory that lazily initializes and exposes all repositories.

export async function createRepos(prisma) {
  // Lazy import keeps this minimal for Day 1
  // (you can also use a direct import if you prefer).
  const { createPostsRepo } = await import('./posts.repo.js');
  const { createCommentsRepo } = await import('./comments.repo.js');
  const { createUsersRepo } = await import('./users.repo.js');

  return {
    posts: createPostsRepo(prisma),
    comments: createCommentsRepo(prisma),
    users: createUsersRepo(prisma),
  };
}
