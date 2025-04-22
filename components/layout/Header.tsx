import { BookOpenText } from 'lucide-react';
import Link from 'next/link';

import { AuthButtons } from '@/components/auth/AuthButtons';

import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <BookOpenText className="h-6 w-6 text-primary" />
            {' '}
            {/* Logo Icon */}
            <span className="font-bold inline-block">
              Kaze No Manga
            </span>
          </Link>
          {/* Optional: Main navigation links for desktop */}
          {/*
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/library" className="text-foreground/60 transition-colors hover:text-foreground/80">
              Library
            </Link>
             <Link href="/lists" className="text-foreground/60 transition-colors hover:text-foreground/80">
              Lists
            </Link>
          </nav>
          */}
        </div>

        {/* Spacer to push right items */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Optional: Search Bar could go here */}

          {/* Theme Toggle and Auth Buttons */}
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButtons />
          </nav>
        </div>

        {/* Mobile Navigation (Hamburger - future implementation) */}
        {/*
        <div className="md:hidden">
           <Button variant="ghost" size="icon">
             <Menu className="h-5 w-5" />
             <span className="sr-only">Toggle Menu</span>
           </Button>
        </div>
        */}

      </div>
    </header>
  );
}
