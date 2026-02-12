/**
 * Loads and validates environment variables for the application.
 * This is intentionally small and explicit for teaching purposes.
 * Day 3 - Added in JWT Secret loading with a validation to ensure the proper # of chars is input for the JWT secret key.
 * - App cannot load now without JWT Secret Key
 */
import dotenv from 'dotenv';

dotenv.config();

/**
 * @returns {{ PORT: number }}
 */
export function ensureEnv() {
  const PORT = Number(process.env.PORT ?? 3000);

  const JWT_SECRET = process.env.JWT_Secret ?? ''; //loads the JWT Secret

  if (!Number.isFinite(PORT) || PORT <= 0) {
    throw new Error('Invalid PORT. Please set PORT to a valid number.');
  }

  //validation of the length of the key
  if (JWT_SECRET.trim().length < 31) {
    throw new Error('Invalid JWT_SECRET. Please set a long random string (32+ chars).');
  }

  return { PORT, JWT_SECRET };
}
