import { heroui } from '@heroui/react';
import type { Config } from 'tailwindcss';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            background: '#FDFEFE',
            foreground: '#2C3E50',
            primary: '#8E44AD',
            secondary: '#3498DB',
            danger: '#E74C3C',
          },
        },
        dark: {
          colors: {
            background: '#1A1A2E',
            foreground: '#EAEAEA',
            primary: '#9B59B6',
            secondary: '#2980B9',
            danger: '#C0392B',
          },
        },
      },
    }),
  ],
} satisfies Config;
