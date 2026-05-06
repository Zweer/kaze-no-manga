import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Amplify handles the OAuth callback automatically
    // Just redirect to home after processing
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-text-secondary">Signing in...</p>
    </main>
  );
}
