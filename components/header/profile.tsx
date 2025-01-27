import { NavbarContent } from '@heroui/react';
import { User } from '@prisma/client';
import React from 'react';

import Login from '@/components/header/login';

export default function HeaderNavbarProfile({ user }: { user?: User }) {
  return <NavbarContent justify="end">{user ? <></> : <Login />}</NavbarContent>;
}
