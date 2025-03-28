import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome to Manga Tracker</h1>
      {session
        ? (
            <p>
              You are signed in as
              {' '}
              {session.user?.name ?? session.user?.email}
              .
            </p>
          )
        : (
            <p>Please sign in to track your manga.</p>
          )}

      {/* Add components for "Recently Updated" and "Most Read" here later */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-3">Recently Updated</h2>
        {/* Placeholder */}
        <p className="text-muted-foreground">Recently updated manga will appear here...</p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-3">Most Read</h2>
        {/* Placeholder */}
        <p className="text-muted-foreground">Most read manga will appear here...</p>
      </div>

    </div>
  );
}
