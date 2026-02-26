/**The middleware runs after requireAuth and before the posts controller.
 * If validation fails, it throws and is caught by the global error handler.
 * */

import { ensureBodyFields } from '#utils/guard';

export function validateCreatePost(req, _res, next) {
  ensureBodyFields(req.body, ['title', 'body']);
  next();
}
