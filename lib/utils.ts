import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) {
    return '';
  };

  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime()))
    return ''; // Invalid date

  return new Intl.DateTimeFormat('en-US', { // Adjust locale and options as needed
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}
