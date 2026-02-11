/**
 * Day 2: in-memory comments, nested under posts.
 *  Note: Repos do not validate postID, limit, offset or body. Validation like that belongs to the controller layer. Repos are for storing.
    This repo assumes inputs are already validated/clamped by controllers/utilities
 * @typedef {{ id: number, postId: number, body: string }} Comment
 */

/**
 * @typedef {Object} CommentsRepo
 * @property {(postId: number, opts?: {limit?: number, offset?: number}) => { items: Comment[], total: number }} listForPost
 * @property {(data: {postId: number, body: string}) => Comment} create
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

    create({ postId, body }) {
      const comment = { id: nextId++, postId, body }; //builds a comment w/a unique id. nextId++ ensures IDs increment correctly each time.
      comments.push(comment); //stores the comment here
      return comment; //returns the comment so the controller can send it back to the client.
    },
  };
}
