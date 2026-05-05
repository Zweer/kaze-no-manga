import { colors } from '../tokens/colors.js';
import { radius } from '../tokens/radius.js';
import { shadows } from '../tokens/shadows.js';
import { spacing } from '../tokens/spacing.js';
import { typography } from '../tokens/typography.js';

export const preset = {
  darkMode: ['class', 'media'],
  theme: {
    extend: {
      colors: {
        ...colors,
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        foreground: 'var(--color-text-primary)',
        muted: 'var(--color-text-muted)',
        border: 'var(--color-border)',
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      spacing,
      boxShadow: shadows,
      borderRadius: radius,
    },
  },
};
