/**
 * This file is essentially a self-contained mini-database manager for handling blog "posts," but it stores all data temporarily in your computer's memory while the program is running.
 * @typedef {{ id: number, title: string, body: string }} Post
 */

/**
 * @typedef {Object} PostsRepo
 * @property {() => Post[]} list
 * @property {(data: {title: string, body: string}) => Post} create
 */
//This function  creates the actual "manager" function that other parts of your API project will call when they need to deal with posts.
export function createPostsRepo() {
  /** @type {Post[]} */
  const posts = []; //empty array to store the posts in.
  let nextId = 1; //ensures that every new post gets a unique id, starting @ 1.

  return { //when lists are called it returns a list if all posts that have been created so far.
    list() {
      return posts;
    },

    //get a post by id
    getById(id) {
      return posts.find((post) => post.id === id)//finds the post id that matches the id we are requesting
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
    }
  };
}
