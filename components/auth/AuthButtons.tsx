'use client';

import { LogIn, LogOut, User } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';

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
import { Skeleton } from '@/components/ui/skeleton';

export function AuthButtons() {
  // useSession hook provides session data and status
  const { data: session, status } = useSession();
  const user = session?.user;

  // Handle loading state
  if (status === 'loading') {
    // Show a skeleton loader while session is being determined
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  // If user is logged in, show Avatar and Dropdown Menu
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost" // Use ghost or outline for less emphasis
            className="relative h-8 w-8 rounded-full focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <Avatar className="h-8 w-8">
              {/* Display user image if available */}
              <AvatarImage
                src={user.image ?? undefined} // Use null or undefined if no image
                alt={user.name ?? 'User'}
              />
              {/* Fallback initials or icon if no image */}
              <AvatarFallback>
                {user.name
                  ? user.name.charAt(0).toUpperCase()
                  : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.name ?? 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* Add other menu items here if needed (e.g., Profile, Settings) */}
          {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
          <DropdownMenuItem
            onClick={async () => signOut()} // Call signOut from next-auth/react
            className="cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If user is logged out, show Sign In button
  return (
    <Button
      variant="outline" // Or default variant
      onClick={async () => signIn('google')} // Trigger Google sign-in flow
    >
      <LogIn className="mr-2 h-4 w-4" />
      Sign In
    </Button>
  );
}
