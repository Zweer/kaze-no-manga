'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { DropdownMenu } from 'radix-ui';

export default function UserDropdown() {
  const { data: session } = useSession();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="rounded-full bg-gray-200 p-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:hover:bg-gray-600">
          {/* Display user avatar or initials here */}
          {/* eslint-disable-next-line ts/strict-boolean-expressions */}
          {session?.user?.image
            ? (
                <img src={session.user.image} alt="User Avatar" className="h-8 w-8 rounded-full" />
              )
            : (
                <span className="text-gray-700 dark:text-gray-300">
                  {session?.user?.name?.slice(0, 2).toUpperCase()}
                </span> // get the first 2 chars
              )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800"
          align="end"
        >
          <DropdownMenu.Item asChild>
            <Link href="/profile">
              <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                Profile
              </div>
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <button type="button" onClick={() => signOut() as unknown as void}>
              <div className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                Sign Out
              </div>
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
