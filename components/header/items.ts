import { User } from '@prisma/client';

export interface MenuItem {
  label: string;
  href: string;
  isActive: boolean;
}

const menuItems: Omit<MenuItem, 'isActive'>[] = [
  { label: 'Latest', href: '/latest' },
  { label: 'Browse', href: '/browse' },
  { label: 'Lists', href: '/lists' },
];

export function calculateItems(pathname: string, user?: User): MenuItem[] {
  return menuItems.map((item) => ({
    ...item,
    isActive: pathname.startsWith(item.href),
  }));
}
