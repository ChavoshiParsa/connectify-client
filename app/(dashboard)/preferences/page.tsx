'use client';

import MobileDrawer from '@/components/layout/drawer/MobileDrawer';
import LocaleSelector from '@/components/common/LocaleSelector';
import ModeToggle from '@/components/common/ModeToggle';
import PwaSettings from '@/components/common/PwaSettings';
import { useWindowWidth } from '@/hooks/app/use-window-width';
import { cn } from '@/lib/utils';
import { ColorTheme, FontSize, usePreferencesStore } from '@/stores/preferences-store';
import { Check, Languages, Palette, Type } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PreferencesPage() {
  const { isXs } = useWindowWidth();
  const t = useTranslations('PreferencesPage');
  const colorTheme = usePreferencesStore((state) => state.colorTheme);
  const fontSize = usePreferencesStore((state) => state.fontSize);
  const setColorTheme = usePreferencesStore((state) => state.setColorTheme);
  const setFontSize = usePreferencesStore((state) => state.setFontSize);

  return (
    <div className="xs:ms-14 xs:w-[calc(100%-3.5rem)] flex h-full w-full items-start overflow-x-hidden overflow-y-auto bg-zinc-100 p-2 md:m-0 md:w-full dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-2xl min-w-0 flex-col gap-6 p-2 sm:p-8">
        <div className="flex min-w-0 items-start gap-3">
          {!isXs && <MobileDrawer />}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>
          </div>
        </div>

        <PwaSettings />

        <section className="bg-card divide-y overflow-hidden rounded-2xl border shadow-sm">
          <div className="flex flex-col items-stretch gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="bg-muted grid size-10 shrink-0 place-items-center rounded-xl">
                <Languages className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="font-medium">{t('language')}</h2>
                <p className="text-muted-foreground text-sm">{t('language_help')}</p>
              </div>
            </div>
            <LocaleSelector className="w-full sm:w-32" />
          </div>
          <div className="flex flex-col items-stretch gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="bg-muted grid size-10 shrink-0 place-items-center rounded-xl">
                <Palette className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="font-medium">{t('theme')}</h2>
                <p className="text-muted-foreground text-sm">{t('theme_help')}</p>
              </div>
            </div>
            <ModeToggle />
          </div>
          <div className="grid gap-4 p-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="bg-muted grid size-10 shrink-0 place-items-center rounded-xl">
                <Palette className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="font-medium">{t('color_theme')}</h2>
                <p className="text-muted-foreground text-sm">{t('color_theme_help')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 min-[22rem]:grid-cols-2 sm:grid-cols-5">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  className={cn(
                    'hover:bg-muted relative flex items-center gap-2 rounded-xl border p-3 text-sm transition',
                    colorTheme === theme.value && 'border-primary ring-primary/20 ring-2',
                  )}
                  onClick={() => setColorTheme(theme.value)}
                >
                  <span className={cn('size-5 shrink-0 rounded-full', theme.className)} />
                  <span className="min-w-0 truncate">{t(theme.label)}</span>
                  {colorTheme === theme.value && <Check className="text-primary ms-auto size-4" />}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 p-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="bg-muted grid size-10 shrink-0 place-items-center rounded-xl">
                <Type className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="font-medium">{t('font_size')}</h2>
                <p className="text-muted-foreground text-sm">{t('font_size_help')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 min-[22rem]:grid-cols-3">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  className={cn(
                    'hover:bg-muted rounded-xl border p-3 transition',
                    fontSize === size.value && 'border-primary bg-primary/5 ring-primary/20 ring-2',
                    size.className,
                  )}
                  onClick={() => setFontSize(size.value)}
                >
                  {t(size.label)}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const COLOR_THEMES: { value: ColorTheme; label: string; className: string }[] = [
  { value: 'sky', label: 'color_sky', className: 'bg-sky-500' },
  { value: 'violet', label: 'color_violet', className: 'bg-violet-500' },
  { value: 'emerald', label: 'color_emerald', className: 'bg-emerald-500' },
  { value: 'rose', label: 'color_rose', className: 'bg-rose-500' },
  { value: 'amber', label: 'color_amber', className: 'bg-amber-500' },
];

const FONT_SIZES: { value: FontSize; label: string; className: string }[] = [
  { value: 'small', label: 'font_small', className: 'text-xs' },
  { value: 'medium', label: 'font_medium', className: 'text-base' },
  { value: 'large', label: 'font_large', className: 'text-lg' },
];
