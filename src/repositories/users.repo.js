/** Day 3: in-memory users
 * This repo stores hashed passwords in order to protect the security of the app and the user's password.
 *  - hashing is handled before the data reaches the repo.
 * @typedef {{ id: number, email: string, name: string, passwordHash: string }} User
 */

export function createUsersRepo() {
  /**@type {User[]}
   */
  const users = [];
  let nextId = 1;

  return {
    /**
     * @param {{ email: string, name: string, passwordHash: string }} data
     * @returns {User}
     */
    create(data) {
      //we are creating user ids here. when a user id object is created with the email, name and the hashed password. When a new user id is made, it adds on to the last userid that was created to set the next userID automatically.
      const user = { id: nextId++, ...data };
      users.push(user);
      return user;
    },
    /**
     * This finds a user by email. Password comparison happens in the auth controller
     * @param {string} email
     * @returns {User|null}
     */
    findByEmail(email) {
      return users.find((u) => u.email === email) ?? null;
    },

    /**
     * This will be used by the auth middleware after verifying JWT
     *  - token payload has sub (userId)
     *  - middleware fetches the user
     * - attaches user to req.user (or similar)
     * @param {number} id
     * @returns {User|null}
     */
    findById(id) {
      return users.find((u) => u.id === id) ?? null;
    },
  };
}
