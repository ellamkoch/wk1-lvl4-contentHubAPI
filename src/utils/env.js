/**
 * Loads and validates environment variables for the application.
 * This is intentionally small and explicit for teaching purposes.
 */
import dotenv from 'dotenv';

dotenv.config();

/**
 * @returns {{ PORT: number }}
 */
export function ensureEnv() {
  const PORT = Number(process.env.PORT ?? 3000);

  if (!Number.isFinite(PORT) || PORT <= 0) {
    throw new Error('Invalid PORT. Please set PORT to a valid number.');
  }

  return { PORT };
}
