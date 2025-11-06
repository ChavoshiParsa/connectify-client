'use client';

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

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isAuthRoute = pathname === '/auth' || pathname.startsWith('/auth');

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        try {
          const response = await getMe();
          console.log(response);

          if (response.statusText === 'OK' && isAuthRoute) {
            router.replace('/home');
          }
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 401 && isProtectedRoute) {
            router.replace('/auth');
          }
        }
      } else if (isAuthRoute) {
        router.replace('/home');
      }

      setLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, isProtectedRoute, isAuthRoute, router]);

  if (loading) return null;

  if (!isAuthenticated && isProtectedRoute) return null;

  if (isAuthenticated && isAuthRoute) return null;

  return <>{children}</>;
}
