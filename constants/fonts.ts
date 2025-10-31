import { LocaleType } from '@/types/i18n';
import localFont from 'next/font/local';

export const fonts: Record<LocaleType, string> = {
  en: 'font-geist',
  pr: 'font-iran',
};

export const geistSans = localFont({
  src: '../public/fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

export const iranSans = localFont({
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
