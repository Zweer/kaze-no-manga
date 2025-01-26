import { Navbar } from '@heroui/react';
import React from 'react';

import NavbarBrand from '@/components/header/brand';
import { MenuItem } from '@/components/header/items';
import NavbarMenu from '@/components/header/menu';
import NavbarMenuSidebar from '@/components/header/menuSidebar';
import NavbarProfile from '@/components/header/profile';

export default function HeaderNavbar({ menuItems }: { menuItems: MenuItem[] }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarBrand isMenuOpen={isMenuOpen} />
      <NavbarMenu menuItems={menuItems} />
      <NavbarProfile />
      <NavbarMenuSidebar menuItems={menuItems} />
    </Navbar>
  );
}
