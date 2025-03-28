'use client';

import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button'; // shadcn button

interface SignInButtonProps {
  provider?: string; // Optional: specify provider like 'google'
}

export function SignInButton({ provider }: SignInButtonProps) {
  return (
    <Button variant="outline" onClick={() => signIn(provider) as unknown as void}>
      Sign In
      {' '}
      {provider ? `with ${provider.charAt(0).toUpperCase() + provider.slice(1)}` : ''}
    </Button>
  );
}
