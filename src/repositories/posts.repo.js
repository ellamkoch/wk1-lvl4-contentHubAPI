/** This repository acts as an in-memory data layer for blog posts.
 * It simulates a database while the server is running.
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
 * @typedef {{ id: number, title: string, body: string, authorId: number }} Post
 */
/**
 * @typedef {Object} PostsRepo
 * @property {(opts?: {limit?: number, offset?: number}) => { items: Post[], total: number }} list
 * @property {(data: {title: string, body: string, authorId: number}) => Post} create
 * @property {(data: {id: number, title: string, body: string, authorId: number}) => Post | null | 'forbidden'} update
 * @property {(data: {id: number, authorId: number}) => true | null | 'forbidden'} delete
 *
 */
//This function  creates the actual "manager" function that other parts of your API project will call when they need to deal with posts.
export function createPostsRepo() {
  /** @type {Post[]} */
  const posts = []; //empty array to store the posts in.
  let nextId = 1; //ensures that every new post gets a unique id, starting @ 1.

  return {
    //Returns a paginated slice of posts plus the total number of posts available.
    list({ limit = 20, offset = 0 } = {}) {
      const total = posts.length;

      // TODO: update this to the proper function once we have databases
      const filteredPosts = posts.slice(offset, offset + limit);

      return { items: filteredPosts, total };
    },

    //get a post by id
    getById(id) {
      return posts.find((post) => post.id === id); //finds the post id that matches the id we are requesting
    },

    //This part creates a new post object with a title and body assigns it to the current unique id and adds it to the temp posts list and increases the id counter, so the next post gets a different id
    create({ title, body, authorId }) {   // Builds a new post and attaches the authorId for ownership tracking
      const post = { id: nextId++, title, body, authorId };
      posts.push(post);
      return post;
    },

    //updates a post by that author and id
     update({ id, title, body, authorId }) {
      // Finds post to update by id
      const post = posts.find((p) => p.id === id) ?? null;
      if (!post) return null;
      if (post.authorId !== authorId) return 'forbidden';   // Enforces ownership: only the author can update

      post.title = title;
      post.body = body;
      return post;
    },

    //delete a post by id and user
    delete({ id, authorId }) {
      // Locates the post to delete in the index in the array
      const idx = posts.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      if (posts[idx].authorId !== authorId) return 'forbidden'; // Enforce ownership: only author can delete their own posts

      posts.splice(idx, 1); // Removes the post from array (IDs do not change)
      return true;
    },
  };
}
