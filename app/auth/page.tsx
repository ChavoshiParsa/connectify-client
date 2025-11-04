import AuthLayout from '@/components/layout/auth/AuthLayout';
import { redirect } from 'next/navigation';

export type AuthPageMode = 'sign-in' | 'sign-up';

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ page?: AuthPageMode | string }> }) {
  const { page = 'sign-in' } = await searchParams;

  if (!['sign-in', 'sign-up'].includes(page)) {
    redirect('/auth?page=sign-in');
  }

  return <AuthLayout initialPage={page as AuthPageMode} />;
}
