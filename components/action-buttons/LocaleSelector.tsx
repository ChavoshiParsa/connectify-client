'use client';

import { setUserLocale } from '@/actions/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LocaleType } from '@/types/i18n';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';

export const locales: { label: string; value: LocaleType; dir: 'rtl' | 'ltr' }[] = [
  { label: 'English', value: 'en', dir: 'ltr' },
  { label: 'فارسی', value: 'pr', dir: 'rtl' },
];

export default function LocaleSelector() {
  const locale = useLocale();

  async function handleValueChange(newValue: LocaleType) {
    await setUserLocale(newValue);
  }

  return (
    <Select value={locale} onValueChange={handleValueChange}>
      <SelectTrigger className="w-28 md:w-32">
        <Globe className="max-h-4 min-h-4 max-w-4 min-w-4 text-zinc-800 dark:text-zinc-200" />
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="text-sm md:text-base">
        {locales.map((locale) => (
          <SelectItem
            className={cn(locale.value === 'en' ? 'font-geist' : 'font-iran')}
            key={locale.value}
            value={locale.value}
          >
            {locale.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
