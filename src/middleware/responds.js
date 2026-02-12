/**
 * Attaches global response helpers to res.
 *
 * Starting Day 2, all successful responses follow:
 *   { data: <payload>, meta?: {...} }
 */
export function respond(_req, res, next) {
  /**
   * 200 OK
   * @param {any} data
   * @param {object} [meta]
   */
  res.ok = (data, meta) => res.status(200).json({ data, ...(meta ? { meta } : {}) });
  //sends http 200 ok msg, always includes data and meta data is included, if its provided.

  /**
   * 201 Created
   * @param {any} data
   * @param {object} [meta]
   */
  res.created = (data, meta) => res.status(201).json({ data, ...(meta ? { meta } : {}) });
  //sends a 201 created response,
  /**
   * 204 No Content
   */
  res.noContent = () => res.status(204).send();

  next(); // need this here otherwise every request would stop here. lets the request continue to routes/controllers.
}
