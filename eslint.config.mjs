import antfu from '@antfu/eslint-config';

export default antfu({
  react: true,
  stylistic: {
    semi: true,
  },
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
  rules: {
    'ts/strict-boolean-expressions': 'off',
    'perfectionist/sort-imports': ['error', {
      internalPattern: ['^~/.+', '^@/.+', '^#.+'],
      groups: [
        'type',
        ['parent-type', 'sibling-type', 'index-type', 'internal-type'],
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling', 'index'],
        'side-effect',
        'object',
        'unknown',
      ],
    }],
  },
});
