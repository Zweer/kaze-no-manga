import { Link, NavbarContent, NavbarItem } from '@heroui/react';
import React from 'react';

import { MenuItem } from '@/components/header/items';

export default function HeaderNavbarMenu({ menuItems }: { menuItems: MenuItem[] }) {
  return (
    <NavbarContent className="hidden sm:flex gap-4" justify="center">
      {menuItems.map(({ href, isActive, label }) => (
        <NavbarItem key={label}>
          <Link color={isActive ? 'primary' : 'foreground'} href={href}>
            {label}
          </Link>
        </NavbarItem>
      ))}
    </NavbarContent>
  );
}
