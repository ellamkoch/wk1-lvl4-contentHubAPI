import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  // Base JS recommendations
  js.configs.recommended,

  // Project JS rules
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Keep backend logging allowed for now
      'no-console': 'off',

      // Keep unused args allowed if prefixed with _
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Useful correctness rule for students
      eqeqeq: ['error', 'always'],
    },
  },

  // Disable ESLint rules that conflict with Prettier formatting
  prettier,
];
