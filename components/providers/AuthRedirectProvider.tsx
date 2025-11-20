'use client';

import { usersService } from '@/api/users';
import { useAuthStore } from '@/stores/auth-store';
import { isAxiosError } from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Spinner } from '../ui/spinner';

const PROTECTED_ROUTES = ['/home', '/profile', '/preferences', '/saved-messages', '/contacts'];

export default function AuthRedirectProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isAuthRoute = pathname === '/auth' || pathname.startsWith('/auth');
  const isLandingRoute = pathname === '/';

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        try {
          const { statusText } = await usersService.getMe();

          if (statusText === 'OK' && (isAuthRoute || isLandingRoute)) {
            router.replace('/home');
          }
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 401 && isProtectedRoute) {
            router.replace('/auth');
          }
        }
      } else if (isAuthRoute || isLandingRoute) {
        router.replace('/home');
      }

      setLoading(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (loading || (!isAuthenticated && isProtectedRoute) || (isAuthenticated && (isAuthRoute || isLandingRoute)))
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <Spinner className="size-12 text-sky-500 dark:text-sky-600" />
      </div>
    );

  return <>{children}</>;
}
