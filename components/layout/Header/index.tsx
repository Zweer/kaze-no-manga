import Link from 'next/link';

import Icons from '@/components/Icons';
import { MainNav } from '@/components/layout/Header/MainNav';
import { MobileNav } from '@/components/layout/Header/MobileNav';
import ThemeToggle from '@/components/layout/Header/ThemeToggle';
import UserAuth from '@/components/layout/Header/UserAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import config from '@/lib/config';

export default function Header() {
  return (
    <header className="bg-background sticky top-0 z-50 w-full">
      <div className="container-wrapper px-6">
        <div className="flex h-(--header-height) items-center gap-2 **:data-[slot=separator]:!h-4">
          <MobileNav items={config.nav} className="flex lg:hidden" />

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden size-8 lg:flex"
          >
            <Link href="/">
              <Icons.logo className="size-5" />
              <span className="sr-only">{config.name}</span>
            </Link>
          </Button>

          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            <Link href="/">{config.name}</Link>
          </h2>

          <MainNav items={config.nav} className="hidden lg:flex" />

          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
              {/* <CommandMenu tree={pageTree} colors={colors} /> */}
            </div>

            <Separator
              orientation="vertical"
              className="ml-2 hidden lg:block"
            />

            <ThemeToggle />

            <Separator
              orientation="vertical"
              className="ml-2 hidden lg:block"
            />

            <UserAuth />
          </div>
        </div>
      </div>
    </header>
  );
}
