/**
 * comments.repo.js
 * ----------------
 * SQLite-backed comments repository.
 *
 * Day 3:
 * - Added authorId and ownership enforcement for update/delete.
 *
 * Day 4:
 * - Replaced in-memory storage with SQLite queries.
 *
 * Ownership contract:
 * - null       => comment not found
 * - 'forbidden'=> comment exists but wrong owner
 * - success    => updated comment or true
 *
 * @param {import('node:sqlite').DatabaseSync} db
 */

/**
 * @typedef {Object} CommentsRepo
 * @property {(postId: number, opts?: {limit?: number, offset?: number}) => { items: Comment[], total: number }} listForPost
 * @property {(data: {postId: number, body: string, authorId: number}) => Comment} create
 */
/**
 * Think of this function as a mini-db factory. Controllers don’t manually push into arrays — they ask the repo to do it by calling methods exposed here.
 */
export function createCommentsRepo(db) {
  // Prepared statements are compiled once and reused. This improves performance and prevents SQL injection.
  const stmtListForPost = db.prepare(`
    SELECT id, post_id AS postId, body, author_id AS authorId, created_at AS createdAt, updated_at AS updatedAt
    FROM comments
    WHERE post_id = ?
    ORDER BY id ASC
    LIMIT ? OFFSET ?
  `);
  // Used to calculate total count for pagination metadata.
  const stmtCountForPost = db.prepare(`
    SELECT COUNT(*) AS total
    FROM comments
    WHERE post_id = ?
  `);
  // Inserts a new comment row
  const stmtInsert = db.prepare(`
    INSERT INTO comments (post_id, body, author_id)
    VALUES (?, ?, ?)
  `);

  // Updates the comment body, but only if the author matches. updated_at is refreshed automatically.
  const stmtUpdate = db.prepare(`
    UPDATE comments
    SET body = ?, updated_at = datetime('now')
    WHERE id = ? AND author_id = ?
  `);

  // Deletes comments, but only if the author matches.
  const stmtDelete = db.prepare(`
    DELETE FROM comments
    WHERE id = ? AND author_id = ?
  `);
  // Used after insert/update to fetch the fully hydrated row (including timestamps and aliased fields).
  const stmtGetById = db.prepare(`
    SELECT id, post_id AS postId, body, author_id AS authorId, created_at AS createdAt, updated_at AS updatedAt
    FROM comments
    WHERE id = ?
    LIMIT 1
  `);

  return {
    /**
     * Lists comments for a specific post with pagination.
     * Pagination is driven by controller (limit + offset).
     */
    listForPost(postId, { limit = 20, offset = 0 } = {}) {
      const total = Number(stmtCountForPost.get(postId).total); // Total number of comments for that post (for pagination meta)
      const items = stmtListForPost.all(postId, limit, offset); // Retrieves only the requested slice
      return { items, total }; //returns items for the current page and the total used for pagination metadata
    },

    /**
     * Creates a new comment.
     * We insert first, then re-fetch by ID to return a full row.
     */
    create({ postId, body, authorId }) {
      const info = stmtInsert.run(postId, body, authorId);
      return stmtGetById.get(Number(info.lastInsertRowid)); // lastInsertRowid gives us the new primary key
    },
    /**
     * Updates a comment if ownership matches.
     * If no rows changed:
     *   - comment might not exist → return null
     *   - comment exists but wrong author → return 'forbidden'
     */
    update({ id, body, authorId }) {
      // AuthorId enforces ownership: only the comment author can update
      const info = stmtUpdate.run(body, id, authorId);
      if (info.changes === 0) {
        const exists = stmtGetById.get(id);
        if (!exists) return null; // comment does not exist
        return 'forbidden'; //comment exists, but wrong author is trying to edit it.
      }
      return stmtGetById.get(id); //returns the updated record
    },

    /**
     * Deletes a comment if ownership matches.
     * Uses the same contract pattern as update().
     */
    delete({ id, authorId }) {
      // AuthorId enforces ownership: only the comment author can delete
      const info = stmtDelete.run(id, authorId);
      if (info.changes === 0) {
        const exists = stmtGetById.get(id);
        if (!exists) return null; //this happens if the comment does not exist
        return 'forbidden'; //this is what is returned if the comment exists, but the wrong author is trying to delete it
      }
      return true;
    },
  };
}
