import shopifyEslintPlugin from '@shopify/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...shopifyEslintPlugin.configs.node,
  ...shopifyEslintPlugin.configs.react,
  ...shopifyEslintPlugin.configs.typescript,
  ...shopifyEslintPlugin.configs.prettier,
  ...shopifyEslintPlugin.configs['typescript-type-checking'],
  {
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
    rules: {
      'no-console': 'off',
      'no-process-env': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'line-comment-position': 'off',
      'import/no-cycle': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'prettier/prettier': 'warn',
      'no-warning-comments': 'off',
    },
    ignores: ['.git/', '.next/', '**/node_modules/'],
  },
];

export default config;
