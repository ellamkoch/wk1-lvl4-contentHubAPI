/**
 * Creates repositories (data layer).
 * Day 1: in-memory only. Day 4: replaced with SQLite-backed repositories.
 * //This structure is important because of:
 *  * Separation of concerns as it divides code responsibility for accessing data from business logic
 *  * Abstraction/Flexibility as the app doesn't need to know the details of how its stored. It just calls methods on the posts repo and gets the data needed. Can easily change the underlying db tech w/o affecting the rest of the code if you do this.
 *  * Testability is easier because data access is abstract, so its easier to write automated tests and mock the repo to ensure logic works correctly.
 *  * Centralized data logic helps to make code easier to manage, maintain and scale as it grow.
 *
 * @returns {{
 *   posts: import('./posts.repo.js').PostsRepo,
 *   comments: import('./comments.repo.js').CommentsRepo
 * }}
 */
//This function acts like a central point to initialize and expose all different repos (data sources) in one place, making them easily accessible throughout the entire app w/ cleaner import statements.
export async function createRepos() {
  // Lazy import keeps this minimal for Day 1
  // (you can also use a direct import if you prefer).
  const { createPostsRepo } = await import('./posts.repo.js');
  const { createCommentsRepo } = await import('./comments.repo.js');

  return {
    posts: createPostsRepo(),
    comments: createCommentsRepo(),
  };
}
