/**
 * Comments Repository (Prisma-backed)
 *
 * This repository provides data access methods for Comment entities.
 * It is responsible for:
 *
 * - Querying comments for a specific post (with pagination)
 * - Counting comments for a post
 * - Creating new comments
 * - Updating comments (with ownership enforcement)
 * - Deleting comments (with ownership enforcement)
 * - Fetching a single comment by ID
 *
 * Architecture Notes:
 * - Backed by Prisma Client (Supabase Postgres)
 * - HTTP-agnostic (no status codes or response shaping here)
 * - Controllers handle response envelopes and pagination semantics
 * - Ownership enforcement remains at the repository layer
 * - Returns:
 *     - Entity object on success
 *     - null if resource not found
 *     - 'forbidden' if user does not own the resource
 *
 * This file replaces the previous SQLite implementation
 * while preserving repository contracts and controller behavior.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 */
/**
 * Think of this function as a mini-db factory. Controllers don’t manually push into arrays — they ask the repo to do it by calling methods exposed here.
 */
export function createCommentsRepo(prisma) {
  // Prepared statements are compiled once and reused. This improves performance and prevents SQL injection.

  return {
/**
     * List comments for a given post.
     *
     * @param {string} postId
     * @param {{ limit?: number, offset?: number }} params
     */
    async listForPost(postId, { limit = 50, offset = 0 } = {}) {
      const [items, total] = await Promise.all([
        prisma.comment.findMany({
          where: { postId },
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'asc' },
        }),
        prisma.comment.count({ where: { postId } }),
      ]);

      return { items, total }; //returns items for the current page and the total used for pagination metadata
    },

    /**
     * Get comment by id.
     *
     * @param {string} id
     */
    async getById(id) {
      return prisma.comment.findUnique({ where: { id } });
    },
   /**
     * Create a comment.
     *
     * @param {{ postId: string, body: string, authorId: string }} data
     */
    async create({ postId, body, authorId }) {
      return prisma.comment.create({
        data: { postId, body, authorId },
      });
    },

     /**
     * Update a comment if exists and user owns it.
     *
     * Returns: updated | null | 'forbidden'
     *
     * @param {{ id: string, body: string, authorId: string }} data
     */
    async update({ id, body, authorId }) {
      const existing = await prisma.comment.findUnique({ where: { id } });
      if (!existing) return null;
      if (existing.authorId !== authorId) return 'forbidden';

      return prisma.comment.update({
        where: { id },
        data: { body },
      });
    },

    /**
     * Delete a comment if exists and user owns it.
     *
     * Returns: true | null | 'forbidden'
     *
     * @param {{ id: string, authorId: string }} data
     */
    async delete({ id, authorId }) {
      const existing = await prisma.comment.findUnique({ where: { id } });
      if (!existing) return null;
      if (existing.authorId !== authorId) return 'forbidden';

      await prisma.comment.delete({ where: { id } });
      return true;
    },
  };
}
