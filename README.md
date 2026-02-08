# wk1-lvl4-contentHubAPI

This is the repo for Week 1 of CodeX, Level 4. This is a simple API project for a content hub API.

## Day 1

Today’s work focused on setting up the project, getting comfortable with reading and deleting individual posts, and making sure the API responds clearly when something goes wrong.

### What I added

* **GET `/posts/:id`**
  * Returns a single post by id
  * Returns a `404` if the post doesn’t exist
* **DELETE `/posts/:id`**
  * Deletes a post by id
  * Returns:
    * `200` when the delete succeeds
    * `404` when the post doesn’t exist
    * `400` when the id is invalid (ex: `0` or non-numeric)

### Testing

* Wrote tests for:
  * Successful deletes
  * Missing posts (404)
  * Invalid ids (400)
* All tests are passing with Vitest + Supertest
* Also manually verified the full create → delete flow in Postman to confirm real request behavior

### Notes / bumps along the way

* Since posts are stored in memory, data only exists while the server is running — restarting the server clears everything.
* I learned the difference between:
  * a **missing** id (404)
  * and an **invalid** id (400)
* Accidentally tested the wrong HTTP verb at first (GET vs DELETE), which was a good reminder that verbs matter just as much as routes.

