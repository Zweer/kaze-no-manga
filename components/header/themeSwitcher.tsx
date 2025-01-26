import { Button } from '@heroui/react';
import { useTheme } from 'next-themes';
import React from 'react';
import { CiDark, CiLight } from 'react-icons/ci';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark';

  function toggleDarkMode() {
    const newTheme = isDark ? 'light' : 'dark';
    console.log(newTheme);

    setTheme(newTheme);
  }

  return (
    <Button onPress={toggleDarkMode} variant="bordered" isIconOnly aria-label="Switch theme">
      {isDark ? <CiLight /> : <CiDark />}
    </Button>
  );
}
