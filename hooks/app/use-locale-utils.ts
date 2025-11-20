import { languagePatterns } from '@/constants/locales';
import { LocaleType } from '@/types/i18n';
import { useLocale, useTranslations } from 'next-intl';

export function useLocaleUtils() {
  const locale = useLocale();
  const t = useTranslations('Date');

  const formatChatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();

    const formatTime = (date: Date): string => {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return formatTime(date);
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return t('Yesterday');
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    if (date > sevenDaysAgo) {
      return t(date.toLocaleDateString('en-US', { weekday: 'long' }));
    }

    if (locale !== 'pr') {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } else {
      return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const detectLocale = (text: string): LocaleType => {
    const trimmed = text.trim();
    for (const { regex, locale } of languagePatterns) {
      if (regex.test(trimmed)) return locale;
    }
    return 'en';
  };

  const convertToPrDigitsIfPr = (text: string): string => {
    if (locale !== 'pr') return String(text);

    const englishNumbers = '0123456789';
    const persianNumbers = '۰۱۲۳۴۵۶۷۸۹';

    return text.replace(/\d/g, (digit) => persianNumbers[englishNumbers.indexOf(digit)]);
  };

  return { locale, t, formatTime, detectLocale, convertToPrDigitsIfPr, formatChatTime };
}
