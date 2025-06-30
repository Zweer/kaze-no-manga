import antfu from '@antfu/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';

export default antfu({
  react: true,
  stylistic: {
    semi: true,
    overrides: {
      'style/brace-style': ['error', '1tbs'],
      'no-console': 'off',
    },
  },
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
}, {
  plugins: {
    '@next/next': nextPlugin,
  },
}, {
  rules: {
    'node/prefer-global/process': 'off',
    'ts/no-floating-promises': 'off',
    'ts/no-misused-promises': 'off',
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
}, {
  files: ['./hooks/use-mobile.ts'],
  rules: {
    'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
  },
}, {
  ignores: ['.next/*', '.vercel/*', './components/ui/*.tsx'],
});
