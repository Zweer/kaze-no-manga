import { Button, NavbarContent, NavbarItem } from '@heroui/react';
import { User } from '@prisma/client';
import Link from 'next/link';
import React from 'react';

export default function HeaderNavbarProfile({ user }: { user?: User }) {
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
