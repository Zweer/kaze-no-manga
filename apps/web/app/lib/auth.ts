import { fetchAuthSession, getCurrentUser, signInWithRedirect, signOut } from 'aws-amplify/auth';

export async function login(): Promise<void> {
  await signInWithRedirect({ provider: 'Google' });
}

export async function logout(): Promise<void> {
  await signOut();
}

export async function getUser(): Promise<{ email: string; name?: string } | null> {
  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;

    return {
      email: (idToken?.payload.email as string) ?? user.signInDetails?.loginId ?? '',
      name: idToken?.payload.name as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}
