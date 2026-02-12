/**
 * This file is essentially a self-contained mini-database manager for handling blog "posts," but it stores all data temporarily in your computer's memory while the program is running.
 * Day 2: We extended the in-memory repo with getById and paginated list.
 * @typedef {{ id: number, title: string, body: string }} Post
 */
/**
 * @typedef {Object} PostsRepo
 * @property {(opts?: {limit?: number, offset?: number}) => { items: Post[], total: number }} list
 * @property {(id: number) => Post|null} getById
 * @property {(id: number) => Post|null} deleteById
 * @property {(data: {title: string, body: string}) => Post} create
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
    create({ title, body }) {
      const post = { id: nextId++, title, body };
      posts.push(post);
      return post;
    },

    //delete a post by id
    deleteById(id) {
      const idx = posts.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      // if (posts[idx].id !== id) return false;

      const [deleted] = posts.splice(idx, 1); // Removes 1 post at the index
      return deleted; // Indicates successful deletion
    },
  };
}
