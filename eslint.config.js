const {
  defineConfig,
  globalIgnores,
} = require('eslint/config')

const globals = require('globals')

module.exports = defineConfig([{
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.commonjs,
    },

    'ecmaVersion': 13,
    parserOptions: {},
  },

  'rules': {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],

    'camelcase': ['error', {
      properties: 'always',
    }],
  },
}, globalIgnores(['images/*', 'node_modules/*'])])
