import { rtlLocales } from '@/constants/locales';
import { LocaleType } from '@/types/i18n';
import { getLocale } from 'next-intl/server';
import { Toaster } from '../ui/sonner';
import AuthRedirectProvider from './AuthRedirectProvider';
import NextIntlProvider from './NextIntlProvider';
import QueryProvider from './QueryProvider';
import ThemeProvider from './ThemeProvider';
import PreferencesProvider from './PreferencesProvider';

export default async function GlobalProvider({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as LocaleType;
  const isRtl = rtlLocales.has(locale);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <PreferencesProvider>
        <NextIntlProvider>
          <QueryProvider>
            <AuthRedirectProvider>
              {children}
              <Toaster position={isRtl ? 'bottom-left' : 'bottom-right'} richColors />
            </AuthRedirectProvider>
          </QueryProvider>
        </NextIntlProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
