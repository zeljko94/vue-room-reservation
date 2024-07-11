module.exports = {
    root: true,
    env: {
      node: true,
    },
    extends: [
      'plugin:vue/vue3-essential',
      'eslint:recommended',
      '@vue/typescript/recommended',
      'plugin:@typescript-eslint/recommended',  // Add this line
    ],
    parserOptions: {
      ecmaVersion: 2020,
      parser: '@typescript-eslint/parser',
      sourceType: 'module',
    },
    rules: {
      // Add any custom rules you need here
      'indent': ['error', 2],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      '@typescript-eslint/no-explicit-any': 'off',
      'prettier/prettier': ['error', {
        'singleQuote': true,
        'semi': true,
        'useTabs': false,
        'tabWidth': 2,
        'printWidth': 80,
        'trailingComma': 'es5',
        'bracketSpacing': true,
        'arrowParens': 'avoid',
        'endOfLine': 'auto',
      }],
    },
    overrides: [
      {
        files: ['*.ts', '*.tsx'],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          project: './tsconfig.json',
        },
        plugins: ['@typescript-eslint'],
        extends: [
          'plugin:@typescript-eslint/recommended',
          'plugin:@typescript-eslint/recommended-requiring-type-checking',
        ],
      },
    ],
  };
  