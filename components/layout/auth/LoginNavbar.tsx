import LocaleSelector from '@/components/common/LocaleSelector';
import ModeToggle from '@/components/common/ModeToggle';
import { useApp } from '@/hooks/app/use-app';
import { useTranslations } from 'next-intl';

type Props = {
  page: 'sign_in' | 'sign_up';
};

export default function LoginNavbar({ page }: Props) {
  const { appName } = useApp();
  const t = useTranslations('LoginPage');

  return (
    <header className="flex w-full flex-col items-center justify-center space-y-10">
      <nav className="flex w-full items-center justify-between">
        <h1 className="animate-pulse text-2xl text-sky-400 md:text-3xl dark:text-sky-600">{appName}</h1>
        <div className="flex items-center justify-center gap-1">
          <LocaleSelector />
          <ModeToggle />
        </div>
      </nav>
      <div className="flex w-full flex-col items-center justify-center space-y-3 md:items-start">
        <h2 className="text-2xl font-medium md:text-3xl">
          {t(page === 'sign_in' ? 'welcome_back' : 'create_account')}
        </h2>
        <p className="text-md text-start text-zinc-500 md:text-base">
          {t(page === 'sign_in' ? 'welcome_back_text' : 'create_account_text')}
        </p>
      </div>
    </header>
  );
}
