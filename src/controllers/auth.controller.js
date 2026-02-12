import { conflict, unauthorized } from '#utils/httpErrors';
import { ensureBodyFields } from '#utils/guard';
import { hashPassword, verifyPassword } from '#utils/password';
import { signToken } from '#utils/jwt';

/**
 * POST /auth/register
 */

export function registerUser(req, res) {
  const { users } = res.locals.repos;

  ensureBodyFields(req.body, ['email', 'name', 'password']); //controller validates the presence of required fields

  //these are normalized so they're all lower case and any excess spaces are trimmed and each is a string to prevent accidental non-string input.
  const email = String(req.body.email).toLowerCase().trim();
  const name = String(req.body.name).trim();
  const password = String(req.body.password);

  //Controller checks for duplicate email; throws conflict if found
  if (users.findByEmail(email)) {
    throw conflict('Email already registered');
  }

  const user = users.create({
    email,
    name,
    passwordHash: hashPassword(password), // password hashing happens before the repo. no plaintext is ever stored. repo only stores the hashed pw
  });

  const token = signToken({ userId: user.id, secret: req.app.locals.config.JWT_SECRET }); //ensures the token is signed with the JWT Secret key. JWT_SECRET comes from env via app.locals.config; keeps secret out of code.

  return res.created({
    //uses custom middleware in the responds.js to return a custom 201 msg instead of res.status(201).json()
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}

/**
 * POST /auth/login
 */

export function loginUser(req, res) {
  const { users } = res.locals.repos;

  ensureBodyFields(req.body, ['email', 'password']); //controller validates the presence of required fields

  const email = String(req.body.email).toLowerCase().trim();
  const password = String(req.body.password);

  const user = users.findByEmail(email);

  if (!user) {
    throw unauthorized('Invalid credentials'); //better to say invalid credentials instead of invalid pw or email. helps protect security of app/db.
  }

  if (!verifyPassword(password, user.passwordHash)) {
    throw unauthorized('Invalid credentials');
  }

  const token = signToken({ userId: user.id, secret: req.app.locals.config.JWT_SECRET });

  return res.ok({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}
