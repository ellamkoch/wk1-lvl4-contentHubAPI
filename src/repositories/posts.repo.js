/**
 * SQLite-backed repository for blog posts.
 *
 * Day 2:
 * - Added getById and pagination support.
 *
 * Day 3:
 * - Added authorId to posts.
 * - Enforced ownership rules for update/delete.
 *
 * Repo responsibilities:
 * - Store and retrieve post data.
 * - Enforce ownership by returning:
 *    - null (post not found)
 *    - 'forbidden' (post exists but wrong owner)
 *    - success value (updated post or true)
 *
 * Repo does NOT:
 * - Validate request input
 * - Check authentication
 * - Throw HTTP errors
 *
 * Controllers translate repo results into HTTP responses.
 *
 * @param {import('node:sqlite').DatabaseSync} db
 */

//This function  creates the actual "manager" function that other parts of your API project will call when they need to deal with posts.
export function createPostsRepo(db) {
  // Prepared statements (compiled SQL we reuse)
  const stmtList = db.prepare(`
    SELECT id, title, body, author_id AS authorId, created_at AS createdAt, updated_at AS updatedAt
    FROM posts
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `);
  const stmtCount = db.prepare(`SELECT COUNT(*) AS total FROM posts`);

  const stmtGetById = db.prepare(`
    SELECT id, title, body, author_id AS authorId, created_at AS createdAt, updated_at AS updatedAt
    FROM posts
    WHERE id = ?
    LIMIT 1
  `);

  const stmtInsert = db.prepare(`
    INSERT INTO posts (title, body, author_id)
    VALUES (?, ?, ?)
  `);

  const stmtUpdate = db.prepare(`
    UPDATE posts
    SET title = ?, body = ?, updated_at = datetime('now')
    WHERE id = ? AND author_id = ?
  `);

  const stmtDelete = db.prepare(`
    DELETE FROM posts
    WHERE id = ? AND author_id = ?
  `);

  return {
    list({ limit = 20, offset = 0 } = {}) {
      const total = Number(stmtCount.get().total);
      const items = stmtList.all(limit, offset);
      return { items, total };
    },

    //get a post by id
    getById(id) {
      return stmtGetById.get(id) ?? null; //finds the post id that matches the id we are requesting
    },

    //This part creates a new post object with a title and body assigns it to the current unique id and adds it to the temp posts list and increases the id counter, so the next post gets a different id
    create({ title, body, authorId }) {
      // Builds a new post and attaches the authorId for ownership tracking
      const info = stmtInsert.run(title, body, authorId);
      return this.getById(Number(info.lastInsertRowid));
    },

    //updates a post by that author and id
    update({ id, title, body, authorId }) {
      // Finds post to update by id
      const info = stmtUpdate.run(title, body, id, authorId);
      if (info.changes === 0) {
        const exists = this.getById(id);
        if (!exists) return null;
        return 'forbidden';
      }
      return this.getById(id);
    },

    // delete a post by id + author (ownership enforced)
    delete({ id, authorId }) {
      const info = stmtDelete.run(id, authorId);

      // If nothing deleted, either it doesn't exist or wrong owner
      if (info.changes === 0) {
        const exists = this.getById(id);
        if (!exists) return null;
        return 'forbidden';
      }

      return true;
    },
  };
}
