'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session) {
    router.push('/'); // Redirect to home if already logged in
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Login</h1>

      <button
        type="button"
        onClick={() => signIn('google') as unknown as void}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Sign in with Google
      </button>

      <button
        type="button"
        onClick={() => signIn('github') as unknown as void}
        className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 mt-4 rounded focus:outline-none focus:shadow-outline"
      >
        Sign in with GitHub
      </button>
    </div>
  );
}
