'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const requireAuth = () => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/login');
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    requireAuth
  };
}
