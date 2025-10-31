import { LocaleConfig, LocaleType } from '@/types/i18n';

export const localesList: LocaleConfig[] = [
  { label: 'English', value: 'en', dir: 'ltr' },
  { label: 'فارسی', value: 'pr', dir: 'rtl' },
];

export const defaultLocale: LocaleType = localesList[0].value;

export const rtlLocales = new Set(localesList.filter((l) => l.dir === 'rtl').map((l) => l.value));

export const languagePatterns = [
  { regex: /[\u0600-\u06FF]/, locale: 'pr' },
  { regex: /[A-Za-z]/, locale: 'en' },
] as const;
