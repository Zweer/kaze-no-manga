import { NavbarBrand, NavbarContent, NavbarMenuToggle } from '@heroui/react';
import Image from 'next/image';
import React from 'react';

import { logo } from '@/app/images';

export default function HeaderNavbarBrand({ isMenuOpen }: { isMenuOpen: boolean }) {
  return (
    <NavbarContent>
      <NavbarMenuToggle
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        className="sm:hidden"
      />

      <NavbarBrand>
        <Image src={logo} alt="ACME" height={50} />
      </NavbarBrand>
    </NavbarContent>
  );
}
