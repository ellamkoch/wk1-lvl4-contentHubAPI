/**
 * Posts Repository (Prisma-backed)
 *
 * Provides data access methods for Post entities.
 *
 * Responsibilities:
 * - List posts with pagination
 * - Count total posts
 * - Fetch a single post by ID
 * - Create new posts
 * - Update posts (with ownership enforcement)
 * - Delete posts (with ownership enforcement)
 *
 * Architecture Notes:
 * - Backed by Prisma Client (Supabase Postgres)
 * - Replaces previous SQLite implementation
 * - Controllers remain unchanged
 * - Repository remains HTTP-agnostic
 * - Ownership enforcement stays inside this layer
 *
 * Return Contracts:
 * - Success → returns entity object (or true for delete)
 * - Not found → returns null
 * - Not owner → returns 'forbidden'
 *
 * Pagination:
 * - Uses skip/take for offset pagination
 * - Ordered by createdAt DESC (newest first)
 * - Returns { items, total }
 *
 * Engine Swap Guarantee:
 * - No changes to response envelopes
 * - No changes to controller behavior
 * - Only the persistence layer has changed
 *
 * @param {import('../../generated/prisma/client.js').PrismaClient} prisma
 */


//This function  creates the actual "manager" function that other parts of your API project will call when they need to deal with posts.
export function createPostsRepo(prisma) {

  return {
   /**
     * List posts with pagination.
     *
     * @param {{ limit?: number, offset?: number }} params
     */
    async list({ limit = 20, offset = 0 } = {}) {
      const [items, total] = await Promise.all([
        prisma.post.findMany({
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.post.count(),
      ]);
      return { items, total };
    },

    /**
     * Get a post by id.
     *
     * @param {string} id
     */
    async getById(id) {
      return prisma.post.findUnique({ where: { id } });
    },

  /**
     * Create a post.
     *
     * @param {{ title: string, body: string, authorId: string }} data
     */
    async create({ title, body, authorId }) {
      return prisma.post.create({
        data: { title, body, authorId },
      });
    },

     /**
     * Update a post if exists and user owns it.
     *
     * Returns:
     * - updated post object
     * - null (not found)
     * - 'forbidden' (not owner)
     *
     * @param {{ id: string, title: string, body: string, authorId: string }} data
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
     * Delete a post if exists and user owns it.
     *
     * Returns:
     * - true (deleted)
     * - null (not found)
     * - 'forbidden' (not owner)
     *
     * @param {{ id: string, authorId: string }} data
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
