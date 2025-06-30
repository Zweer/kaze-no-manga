import Image from 'next/image';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const user = session.user;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>

        {user.image && (
          <Image
            src={user.image}
            alt={user.name ?? 'User Avatar'}
            width={96}
            height={96}
            className="rounded-full mx-auto mb-4"
          />
        )}

        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-slate-500 mb-6">{user.email}</p>

        <div className="text-left bg-slate-100 p-4 rounded-md">
          <h3 className="font-semibold mb-2">Session Data (from Server):</h3>
          <pre className="text-xs overflow-x-auto bg-slate-800 text-white p-2 rounded">
            <code>{JSON.stringify(session, null, 2)}</code>
          </pre>
        </div>

        <Button asChild className="mt-6 w-full">
          <a href="/">Back to Home</a>
        </Button>
      </div>
    </div>
  );
}
