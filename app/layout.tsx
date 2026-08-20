import GlobalProvider from '@/components/providers/GlobalProvider';
import { fonts, geistSans, iranSans } from '@/constants/fonts';
import { rtlLocales } from '@/constants/locales';
import { withBasePath } from '@/lib/app-path';
import { cn } from '@/lib/utils';
import { LocaleType } from '@/types/i18n';
import type { Metadata, Viewport } from 'next';
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
    applicationName: 'Connectify',
    manifest: withBasePath('/manifest.webmanifest'),
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Connectify',
    },
    formatDetection: {
      telephone: false,
    },
    other: {
      'apple-mobile-web-app-capable': 'yes',
    },
    icons: {
      icon: [
        { url: withBasePath('/icons/icon-192x192.png'), sizes: '192x192', type: 'image/png' },
        { url: withBasePath('/icons/icon-512x512.png'), sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: withBasePath('/icons/apple-touch-icon.png'), sizes: '180x180', type: 'image/png' }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  colorScheme: 'light dark',
};
