'use client';

import { Button } from '@heroui/react';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import { CiDark, CiDesktop, CiLight } from 'react-icons/ci';

export default function FooterThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { name: 'light', icon: <CiLight /> },
    { name: 'system', icon: <CiDesktop /> },
    { name: 'dark', icon: <CiDark /> },
  ];

  return (
    <div className="flex flex-row items-center justify-center md:order-3 md:items-end border border-default rounded-full">
      {themes.map(({ name, icon }) => (
        <Button
          key={name}
          radius="full"
          variant="light"
          color={theme === name ? 'primary' : 'default'}
          isIconOnly
          aria-label={`Switch to ${name} mode`}
          onPress={() => setTheme(name)}
        >
          {icon}
        </Button>
      ))}
    </div>
  );
}
