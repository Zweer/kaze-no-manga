import { Button, NavbarContent, NavbarItem } from '@heroui/react';
import Link from 'next/link';
import React from 'react';

export default function HeaderNavbarProfile() {
  return (
    <NavbarContent justify="end">
      <NavbarItem className="hidden lg:flex">
        <Link href="#">Login</Link>
      </NavbarItem>
      <NavbarItem>
        <Button as={Link} color="primary" href="#" variant="flat">
          Sign Up
        </Button>
      </NavbarItem>
    </NavbarContent>
  );
}
