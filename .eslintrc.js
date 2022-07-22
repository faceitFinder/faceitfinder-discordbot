module.exports = {
  'env': {
    'node': true,
    'commonjs': true,
    'es2021': true
  },
  'parserOptions': {
    'ecmaVersion': 13
  },
  'ignorePatterns': [
    'images/*',
    'node_modules/*',
  ],
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'camelcase': [
      'error',
      {
        properties: 'always'
      }
    ]
  }
}
