import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import '../lib/amplify';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Amplify handles the OAuth callback automatically
    navigate('/app', { replace: true });
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-text-secondary">Signing in...</p>
    </main>
  );
}
