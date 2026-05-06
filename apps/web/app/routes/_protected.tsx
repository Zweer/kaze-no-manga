import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import '../lib/amplify';
import { getUser, login, logout } from '../lib/auth';

export default function ProtectedLayout() {
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then((u) => {
      if (!u) {
        login();
      } else {
        setUser(u);
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="font-heading text-lg font-bold text-primary-500">Kaze no Manga</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">{user?.name ?? user?.email}</span>
          <button
            type="button"
            onClick={() => logout()}
            className="text-sm text-text-secondary hover:text-foreground"
          >
            Logout
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
