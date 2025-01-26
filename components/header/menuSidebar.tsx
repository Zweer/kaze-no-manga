import { Link, NavbarMenu, NavbarMenuItem } from '@heroui/react';
import React from 'react';

import { MenuItem } from '@/components/header/items';

export default function HeaderNavbarMenuSidebar({ menuItems }: { menuItems: MenuItem[] }) {
  return (
    <NavbarMenu>
      {menuItems.map(({ href, isActive, label }) => (
        <NavbarMenuItem key={href}>
          <Link
            color={isActive ? 'primary' : 'foreground'}
            className="w-full"
            href={href}
            size="lg"
          >
            {label}
          </Link>
        </NavbarMenuItem>
      ))}
    </NavbarMenu>
  );
}
