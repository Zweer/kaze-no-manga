'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

import { calculateItems } from '@/components/header/items';
import Navbar from '@/components/header/navbar';

export default function Header() {
  const pathname = usePathname();

  const menuItems = calculateItems(pathname);

  return <Navbar menuItems={menuItems} />;
}
