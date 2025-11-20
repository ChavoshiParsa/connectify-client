import GlobalProvider from '@/components/providers/GlobalProvider';
import { fonts, geistSans, iranSans } from '@/constants/fonts';
import { rtlLocales } from '@/constants/locales';
import { cn } from '@/lib/utils';
import { LocaleType } from '@/types/i18n';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import './globals.css';

export default async function RootLayout(props: LayoutProps<'/'>) {
  const locale = (await getLocale()) as LocaleType;
  const isRtl = rtlLocales.has(locale);

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={cn(geistSans.variable, iranSans.variable, fonts[locale])}>
        <GlobalProvider>{props.children}</GlobalProvider>
      </body>
    </html>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: LocaleType }> }): Promise<Metadata> {
  const locale = (await params).locale;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}
