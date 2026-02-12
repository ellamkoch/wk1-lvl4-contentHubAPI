/**
 * Day 2: in-memory comments, nested under posts.
 *
  * Day 3: added authorId and update/delete with ownership.

  Repo responsibilities:
 * - Store and retrieve comment data.
 * - Enforce ownership at the data layer by returning:
 *    - null (comment not found)
 *    - 'forbidden' (comment exists but wrong owner)
 *    - success value (updated comment or true)
 *
 * Repo does NOT:
 * - Validate request input
 * - Check authentication
 * - Throw HTTP errors
 *
 * Controllers interpret repo return values and map them to HTTP responses.
 */
/**
 * @typedef {{ id: number, postId: number, body: string, authorId: number }} Comment
 */

/**
 * @typedef {Object} CommentsRepo
 * @property {(postId: number, opts?: {limit?: number, offset?: number}) => { items: Comment[], total: number }} listForPost
 * @property {(data: {postId: number, body: string, authorId: number}) => Comment} create
 */
/**
 * Think of this function as a mini-db factory. Controllers don’t manually push into arrays — they ask the repo to do it.
 */
export function createCommentsRepo() {
  /** @type {Comment[]} */
  const comments = []; //  This creates an empty array that will store Comment objects
  let nextId = 1; // keeps an auto-incrementing id counter for new comments

  return {
    // Returns an object with functions that are the only way the rest of the app should touch comments data
    listForPost(postId, { limit = 20, offset = 0 } = {}) {
      const all = comments.filter((c) => c.postId === postId); //only include comments that belong to this postId
      const total = all.length; //counts all the comments for that post before pagination
      const items = all.slice(offset, offset + limit); //slices is how we implement pagination in memory. return only this “page” of results (offset → start, limit → how many)
      return { items, total }; //returns items for the current page and the total used for pagination metadata
    },

    getById(id) {
      //gets the comments by id
      return comments.find((c) => c.id === id) ?? null; //returns the comments with the id that matches. if none match, returns null.
    },

    create({ postId, body, authorId }) {
      const comment = { id: nextId++, postId, body, authorId }; //builds a comment w/a unique id. nextId++ ensures Ids increment correctly each time.
      comments.push(comment); //stores the comment here
      return comment; //returns the comment so the controller can send it back to the client.
    },

    update({ id, body, authorId }) {
      // AuthorId enforces ownership: only the comment author can update
      const comment = comments.find((c) => c.id === id) ?? null; //finds the comment to update based on id. if the id isn't found, returns null.
      if (!comment) return null;
      if (comment.authorId !== authorId) return 'forbidden'; //if the author id doesn't match on the comment that is being updated, returns forbidden msg.

      comment.body = body;
      return comment; //returns the updated comment body.
    },

    delete({ id, authorId }) {
      // AuthorId enforces ownership: only the comment author can delete
      const idx = comments.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      if (comments[idx].authorId !== authorId) return 'forbidden';

      comments.splice(idx, 1); // removes 1 comment at position idx (array indexes shift, comment IDs do not change)
      return true;
    },
  };
}
