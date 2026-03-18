// eslint.config.js (Flat Config CommonJS)
const js = require('@eslint/js')
const globals = require('globals')

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node
    },
    ignores: [
      'images/**',
      'node_modules/**'
    ],
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      camelcase: ['error', { properties: 'always' }]
    }
  }
]
