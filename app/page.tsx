import UserAuth from '@/components/UserAuth';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="absolute top-4 right-4">
        <UserAuth />
      </div>
      <h1 className="text-4xl font-bold">Welcome to MangaVerse</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Authentication is now set up. Try signing in!
      </p>
    </main>
  );
}
