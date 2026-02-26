/**
 * Middleware: Enforce JSON Content-Type for body-carrying requests.
 *
 * For POST, PUT, and PATCH requests, this ensures the client sends
 * `Content-Type: application/json`.
 *
 * If the header is missing or incorrect, a 415 Unsupported Media Type
 * error is forwarded using the centralized HttpError model.
 *
 * This keeps API contracts strict and failure behavior predictable.
 */

import { unsupportedMediaType } from "#utils/httpErrors";

export function requireJson(req, _res, next) {
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
        return next(unsupportedMediaType('Content-Type must be application/json'));
    }
    next();

    }

