// eslint.config.js
const globals = require('globals')

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 13,
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'camelcase': ['error', { properties: 'always' }],
    },
  },
  {
    ignores: ['images/*', 'node_modules/*'],
  },
]