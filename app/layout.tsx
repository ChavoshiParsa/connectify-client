import GlobalProvider from '@/components/providers/GlobalProvider';
import { cn } from '@/lib/utils';
import { LocaleType } from '@/types/i18n';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: '../public/fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const iranSans = localFont({
  src: [
    {
      path: '../public/fonts/IRANSansWeb_Light.woff2',
      weight: '300',
    },
    {
      path: '../public/fonts/IRANSansWeb.woff2',
      weight: '400',
    },
    {
      path: '../public/fonts/IRANSansWeb_Medium.woff2',
      weight: '500',
    },
    {
      path: '../public/fonts/IRANSansWeb_Bold.woff2',
      weight: '700',
    },
  ],
  variable: '--font-iran-sans',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const isRtl = locale === 'pr';

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={cn(geistSans.variable, iranSans.variable, locale === 'en' ? 'font-geist' : 'font-iran')}>
        <GlobalProvider>{children}</GlobalProvider>
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
