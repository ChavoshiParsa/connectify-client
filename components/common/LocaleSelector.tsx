'use client';

import { setUserLocale } from '@/actions/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fonts } from '@/constants/fonts';
import { localesList } from '@/constants/locales';
import { cn } from '@/lib/utils';
import { LocaleType } from '@/types/i18n';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function LocaleSelector({ className }: { className?: string }) {
  const locale = useLocale() as LocaleType;
  const router = useRouter();

  async function handleValueChange(newValue: LocaleType) {
    await setUserLocale(newValue);
    router.refresh();
  }

  return (
    <Select value={locale} onValueChange={handleValueChange}>
      <SelectTrigger className={cn('w-32', className)}>
        <Globe className="max-h-4 min-h-4 max-w-4 min-w-4 text-zinc-800 dark:text-zinc-200" />
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="text-sm md:text-base">
        {localesList.map((locale) => (
          <SelectItem className={cn(fonts[locale.value])} key={locale.value} value={locale.value}>
            {locale.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
