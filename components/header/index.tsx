'use client';

import { User } from '@prisma/client';
import { usePathname } from 'next/navigation';
import React from 'react';

import { calculateItems } from '@/components/header/items';
import Navbar from '@/components/header/navbar';

export default function Header({ user }: { user?: User }) {
  const pathname = usePathname();

  const menuItems = calculateItems(pathname, user);

  return <Navbar menuItems={menuItems} user={user} />;
}
