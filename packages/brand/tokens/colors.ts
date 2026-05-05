export const colors = {
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    900: '#14532d',
  },
  warning: {
    50: '#fefce8',
    500: '#eab308',
    900: '#713f12',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    900: '#7f1d1d',
  },
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
  background: { light: '#fafafa', dark: '#0a0a0a' },
  surface: { light: '#ffffff', dark: '#171717' },
  text: {
    primary: { light: '#171717', dark: '#fafafa' },
    secondary: { light: '#525252', dark: '#a3a3a3' },
    muted: { light: '#737373', dark: '#737373' },
  },
  border: { light: '#e5e5e5', dark: '#404040' },
} as const;

export type Colors = typeof colors;
