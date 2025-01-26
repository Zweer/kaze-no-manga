'use client';

import React from 'react';

import Copyright from '@/components/footer/copyright';
import ThemeSwitcher from '@/components/footer/themeSwitcher';

export default function Footer() {
  return (
    <footer className="flex w-full flex-col">
      <div className="mx-auto w-full max-w-5xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <ThemeSwitcher />
        <Copyright />
      </div>
    </footer>
  );
}
