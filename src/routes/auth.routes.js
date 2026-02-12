/**
 * Auth Routes
 *
 * This file contains the public authentication endpoints.
 *
 * POST /auth/register
 * - Creates a new user
 * - Returns JWT token on success
 *
 * POST /auth/login
 * - Validates credentials
 * - Returns JWT token on success
 *
 * No authentication required for these routes.
 */

import { Router } from 'express';
import { registerUser, loginUser } from '#controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
