/**
 * Posts Repository (Prisma-backed)
 *
 * Provides data access methods for Post entities.
 *
 * Responsibilities:
 * - List posts with pagination (optionally include comment counts)
 * - Count total posts
 * - Fetch a single post by ID
 *   - basic version (no includes)
 *   - extended version (optional includes: author, comments)
 * - Create new posts
 * - Update posts (with ownership enforcement)
 * - Delete posts (with ownership enforcement)
 *
 * Architecture Notes:
 * - Backed by Prisma Client (Supabase Postgres)
 * - Repository is HTTP-agnostic (no req/res, no status codes)
 * - Controllers decide HTTP responses based on return contracts
 * - Ownership enforcement stays inside this layer
 *
 * Return Contracts:
 * - Success → returns entity object (or { items, total } for list / true for delete)
 * - Not found → returns null
 * - Not owner → returns 'forbidden'
 *
 * Pagination:
 * - Uses skip/take for offset pagination
 * - Ordered by createdAt DESC (newest first)
 * - Returns { items, total }
 *
 * NOTE:
 * This layer does NOT decide HTTP status codes.
 * It returns data and special markers where needed.
 *
 * @param {import('../../generated/prisma/index.js').PrismaClient} prisma
 */

// Factory function that creates the Posts repository. Other parts of the API use this "repo object" to interact with posts data.
export function createPostsRepo(prisma) {

  return {
   /**
     * List posts with pagination.
     *
     * Optional behavior:
     * - includeCounts=true adds Prisma _count data (ex: number of comments per post)
     *
     * @param {{ limit?: number, offset?: number, includeCounts?: boolean }} params
     * @returns {Promise<{ items: any[], total: number }>}
     */
    async list({ limit = 20, offset = 0, includeCounts = false } = {}) {
      // Prisma "include" lets us attach related data.
      // _count is a Prisma feature that can return counts of relations.
      const includeCountsFlag = includeCounts ? { _count: { select: { comments: true } } } : undefined;

      const [items, total] = await Promise.all([
        prisma.post.findMany({
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: includeCountsFlag,
        }),
        prisma.post.count(),
      ]);
      return { items, total };
    },

   /**
     * Get a post by id (no includes).
     *
     * Use this when you only need the Post itself.
     *
     * @param {string} id
     * @returns {Promise<any|null>}
     */

    async getById(id) {
      return prisma.post.findUnique({ where: { id } });
    },

    /**
     * Get a post by id with optional includes.
     *
     * Includes supported:
     * - includeAuthor: attach the post's author (selected fields only)
     * - includeComments: attach comments (ordered oldest → newest) and each comment's author
     *
     * NOTE: We only pass "include" to Prisma when it actually has keys.
     * (If include is empty, we send undefined.)
     *
     * @param {string} id
     * @param {{ includeAuthor?: boolean, includeComments?: boolean }} options
     * @returns {Promise<any|null>}
     */
    async getByIdWithIncludes(id, { includeAuthor = false, includeComments = false } = {}) {
      const include = {};

      if (includeAuthor) {
        include.author = {
          select: { id: true, name: true, email: true, createdAt: true },
        };
      }

      if (includeComments) {
        include.comments = {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, name: true, email: true, createdAt: true },
            },
          },
        };
      }

      return prisma.post.findUnique({
        where: { id },
        include: Object.keys(include).length ? include : undefined,
      });
    },

 /**
     * Create a post.
     *
     * @param {{ title: string, body: string, authorId: string }} data
     * @returns {Promise<any>}
     */

    async create({ title, body, authorId }) {
      return prisma.post.create({
        data: { title, body, authorId },
      });
    },

   /**
     * Update a post if it exists and the user owns it.
     *
     * Returns:
     * - updated post object (success)
     * - null (not found)
     * - 'forbidden' (not owner)
     *
     * @param {{ id: string, title: string, body: string, authorId: string }} data
     * @returns {Promise<any|null|'forbidden'>}
     */

    async update({ id, title, body, authorId }) {
      const existing = await prisma.post.findUnique({ where: { id } });
      if (!existing) return null;
      if (existing.authorId !== authorId) return 'forbidden';

      return prisma.post.update({
        where: { id },
        data: { title, body },
      });
    },

   /**
     * Delete a post if it exists and the user owns it.
     *
     * Returns:
     * - true (deleted)
     * - null (not found)
     * - 'forbidden' (not owner)
     *
     * @param {{ id: string, authorId: string }} data
     * @returns {Promise<true|null|'forbidden'>}
     */

    async delete({ id, authorId }) {
      const existing = await prisma.post.findUnique({ where: { id } });
      if (!existing) return null;
      if (existing.authorId !== authorId) return 'forbidden';

      await prisma.post.delete({ where: { id } });
      return true;
    },
  };
}
