import LocaleSelector from '@/components/common/LocaleSelector';
import ModeToggle from '@/components/common/ModeToggle';
import { useApp } from '@/hooks/use-app';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Home() {
  const { appName } = useApp();
  const t = useTranslations('LandingPage');

  return (
    <div className="flex size-full flex-col items-center justify-between p-4">
      <nav className="flex w-full items-center justify-between">
        <div className="flex items-center justify-center gap-2">
          <Link
            className="rounded bg-indigo-600 px-4 py-2 text-center text-nowrap text-white hover:bg-indigo-700"
            href="auth?page=sign-in"
          >
            {t('sign_in')}
          </Link>
          <Link
            className="rounded bg-sky-600 px-4 py-2 text-center text-nowrap text-white hover:bg-sky-700"
            href="auth?page=sign-up"
          >
            {t('sign_up')}
          </Link>
        </div>
        <div className="flex items-center justify-center gap-1">
          <LocaleSelector />
          <ModeToggle />
        </div>
      </nav>
      <div className="flex size-full flex-col items-center justify-center space-y-8">
        <h1 className="text-5xl font-bold">{appName}</h1>
        <h2 className="text-3xl font-medium">{t('welcome')}</h2>
      </div>
    </div>
  );
}
