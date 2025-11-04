'use client';

import { refresh } from '@/api/auth';
import { getMe } from '@/api/users';
import { useAuthStore } from '@/stores/auth-store';
import { isAxiosError } from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PROTECTED_ROUTES = ['/home', '/profile', '/preferences', '/saved-messages', '/contacts'];

export default function AuthRedirectProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isProtected = PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        if (pathname.startsWith('/auth')) {
          router.replace('/home');
        }
      } else {
        try {
          const response = await refresh();
          if (response.status === 200) {
            await getMe();
            if (pathname.startsWith('/auth')) {
              router.replace('/home');
            }
          }
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 401 && isProtected) {
            router.replace('/auth');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [pathname, router, isAuthenticated, isProtected]);

  if (loading) return null;

  if (isProtected && !isAuthenticated) {
    return <p>loading...</p>;
  }

  return <>{children}</>;
}
