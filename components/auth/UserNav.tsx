'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { SignInButton } from './SignInButton';

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!session) {
    // Let's list available providers or have a generic sign-in
    // For now, keeping GitHub/Google example logic might require adjustment
    // based on your actual providers in lib/auth.ts
    return (
      <div className="flex space-x-2">
        <SignInButton provider="google" />
        {/* Add other provider buttons if needed */}
        {/* <SignInButton provider="github" /> */}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session.user?.image ?? undefined}
              alt={session.user?.name ?? 'User'}
            />
            <AvatarFallback>
              {session.user?.name
                ? session.user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                : 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">My Mangas</Link>
        </DropdownMenuItem>
        {/* You might want a profile/settings link later */}
        {/* <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
        </DropdownMenuItem> */}
        <DropdownMenuSeparator />
        {/* Updated Sign Out Item */}
        <DropdownMenuItem onClick={() => signOut() as unknown as void} className="cursor-pointer">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
