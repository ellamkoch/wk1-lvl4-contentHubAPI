/**
 * repositories/index.js
 * ----------------------
 * Creates repository instances (data layer).
 *
 * Day 1–3: In-memory repositories.
 * Day 4: Replaced with SQLite-backed repositories (db injected).
 *
 * Why this structure matters:
 * - Separation of concerns (data access vs business logic)
 * - Abstraction (controllers don’t care how data is stored)
 * - Testability (repos can be mocked)
 * - Centralized data access logic
 *
 * Day 4 change:
 * - Repositories no longer create their own data source.
 * - A database connection is injected for better control and flexibility.
 *
 * @param {import('node:sqlite').DatabaseSync} db
 * @returns {{
 *   posts: import('./posts.repo.js').PostsRepo,
 *   comments: import('./comments.repo.js').CommentsRepo,
 *   users: import('./users.repo.js').UsersRepo
 * }}
 */
// This function is a central factory that initializes and exposes all repositories.

export async function createRepos(db) {
  // Lazy import keeps this minimal for Day 1
  // (you can also use a direct import if you prefer).
  const { createPostsRepo } = await import('./posts.repo.js');
  const { createCommentsRepo } = await import('./comments.repo.js');
  const { createUsersRepo } = await import('./users.repo.js');

  return {
    posts: createPostsRepo(db),
    comments: createCommentsRepo(db),
    users: createUsersRepo(db),
  };
}
