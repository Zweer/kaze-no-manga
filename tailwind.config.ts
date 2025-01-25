import type { Config } from 'tailwindcss';
import tailwindPresetMantine from 'tailwind-preset-mantine';

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [tailwindPresetMantine],
  plugins: [],
} satisfies Config;
