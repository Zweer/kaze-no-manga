import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import '../lib/amplify';
import { isAuthenticated, login } from '../lib/auth';

export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    isAuthenticated().then((authed) => {
      if (authed) {
        navigate('/app', { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <h1 className="font-heading text-4xl font-bold text-primary-500">Kaze no Manga</h1>
      <p className="text-text-secondary">Never lose your place in manga again</p>
      <button
        type="button"
        onClick={() => login()}
        className="rounded-lg bg-primary-500 px-6 py-3 font-medium text-white hover:bg-primary-600"
      >
        Sign in with Google
      </button>
    </main>
  );
}
