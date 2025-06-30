import Image from 'next/image';
import Link from 'next/link';
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
    <div className="container max-w-2xl py-10">
      <div className="bg-card text-card-foreground p-8 rounded-lg border">
        <h1 className="text-2xl font-bold mb-4 text-center">Profile</h1>

        {user.image && (
          <Image
            src={user.image}
            alt={user.name ?? 'User Avatar'}
            width={96}
            height={96}
            className="rounded-full mx-auto mb-4"
          />
        )}

        <h2 className="text-xl font-semibold text-center">{user.name}</h2>
        <p className="text-muted-foreground mb-6 text-center">{user.email}</p>

        <div className="text-left bg-muted p-4 rounded-md">
          <h3 className="font-semibold mb-2">Session Data (from Server):</h3>
          <pre className="text-xs overflow-x-auto bg-slate-800 text-white p-2 rounded">
            <code>{JSON.stringify(session, null, 2)}</code>
          </pre>
        </div>

        <Button asChild className="mt-6 w-full">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
