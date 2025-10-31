import { rtlLocales } from '@/constants/locales';
import { LocaleType } from '@/types/i18n';
import { useLocale, useTranslations } from 'next-intl';

export function useApp() {
  const t = useTranslations('App');
  const locale = useLocale() as LocaleType;
  const isRtl = rtlLocales.has(locale);

  return { appName: t('app_name'), isRtl, locale };
}
