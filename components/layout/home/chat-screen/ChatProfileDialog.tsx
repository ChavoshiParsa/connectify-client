import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { gradientAvatarClasses } from '@/constants/avatar-colors';
import { fonts } from '@/constants/fonts';
import { rtlLocales } from '@/constants/locales';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { resolveAvatarUrl } from '@/lib/avatar-url';
import { cn } from '@/lib/utils';
import type { ChatProfileUser } from '@/types/messages';
import { AtSign, Expand, Info, Mail, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type Props = {
  user: ChatProfileUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ChatProfileDialog({ user, open, onOpenChange }: Props) {
  const t = useTranslations('ChatProfile');
  const { convertToPrDigitsIfPr, detectLocale, formatChatTime } = useLocaleUtils();
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const avatarFallback = `${user.firstName.charAt(0)}${user.lastName?.charAt(0) ?? ''}`.toUpperCase();
  const avatarUrl = resolveAvatarUrl(user.avatarUrl);
  const nameLocale = detectLocale(fullName);
  const biographyLocale = detectLocale(user.biography ?? '');
  const presenceText =
    user.status === 'ONLINE'
      ? t('online')
      : user.lastActiveAt
        ? t('last_seen', {
            time: convertToPrDigitsIfPr(formatChatTime(new Date(user.lastActiveAt).toString())),
          })
        : t('offline');

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setIsPhotoOpen(false);
    onOpenChange(nextOpen);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-md">
          <div className="from-primary/20 via-primary/5 bg-linear-to-br to-transparent px-6 pt-8 pb-6">
            <DialogHeader className="items-center text-center sm:text-center">
              <button
                type="button"
                className={cn(
                  'group/photo relative rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
                  avatarUrl ? 'cursor-zoom-in' : 'cursor-default',
                )}
                onClick={() => {
                  if (avatarUrl) setIsPhotoOpen(true);
                }}
                disabled={!avatarUrl}
                aria-label={t('open_profile_photo')}
              >
                <Avatar className="size-32 rounded-3xl shadow-lg ring-4 ring-white/70 dark:ring-zinc-900/70">
                  <AvatarImage className="rounded-3xl object-cover" src={user.avatarUrl ?? ''} alt={fullName} />
                  <AvatarFallback
                    className={cn(
                      'rounded-3xl bg-linear-to-br text-3xl text-white',
                      gradientAvatarClasses[user.avatarColor],
                      fonts[nameLocale],
                    )}
                  >
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
                {avatarUrl && (
                  <span className="absolute inset-0 grid place-items-center rounded-3xl bg-black/0 text-white opacity-0 transition group-hover/photo:bg-black/25 group-hover/photo:opacity-100 group-focus-visible/photo:bg-black/25 group-focus-visible/photo:opacity-100">
                    <Expand className="size-7 drop-shadow" />
                  </span>
                )}
              </button>

              <DialogTitle className={cn('mt-3 text-xl', fonts[nameLocale])}>{fullName}</DialogTitle>
              <DialogDescription className="sr-only">{t('description', { name: fullName })}</DialogDescription>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    'size-2 rounded-full',
                    user.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-600',
                  )}
                />
                {presenceText}
              </div>
            </DialogHeader>
          </div>

          <div className="grid gap-3 p-5">
            <ProfileDetail icon={AtSign} label={t('username')}>
              <span className="select-text" dir="ltr">
                @{user.username}
              </span>
            </ProfileDetail>

            <ProfileDetail icon={Mail} label={t('email')}>
              <a
                className="hover:text-primary break-all transition-colors select-text"
                href={`mailto:${user.email}`}
                dir="ltr"
              >
                {user.email}
              </a>
            </ProfileDetail>

            <ProfileDetail icon={Info} label={t('biography')} alignStart>
              <p
                className={cn('wrap-anywhere whitespace-pre-line select-text', fonts[biographyLocale])}
                dir={rtlLocales.has(biographyLocale) ? 'rtl' : 'ltr'}
              >
                {user.biography || t('no_biography')}
              </p>
            </ProfileDetail>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPhotoOpen} onOpenChange={setIsPhotoOpen}>
        <DialogContent
          className="inset-0 top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black/95 p-0 text-white sm:max-w-none"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{t('profile_photo', { name: fullName })}</DialogTitle>
          <DialogDescription className="sr-only">{t('profile_photo', { name: fullName })}</DialogDescription>

          <header className="z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4">
            <span className={cn('min-w-0 truncate text-sm text-white/80', fonts[nameLocale])}>{fullName}</span>
            <DialogClose asChild>
              <Button
                className="border-white/20 bg-black/20 text-white hover:bg-white/15 hover:text-white"
                type="button"
                variant="outline"
                size="icon"
                aria-label={t('close_profile_photo')}
              >
                <X />
              </Button>
            </DialogClose>
          </header>

          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            {/* The avatar endpoint is served directly by GridFS, so next/image cannot optimize it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="max-h-full max-w-full object-contain"
              src={avatarUrl}
              alt={t('profile_photo', { name: fullName })}
              draggable={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

type ProfileDetailProps = {
  icon: typeof AtSign;
  label: string;
  children: React.ReactNode;
  alignStart?: boolean;
};

function ProfileDetail({ icon: Icon, label, children, alignStart = false }: ProfileDetailProps) {
  return (
    <div className={cn('bg-muted/60 flex gap-3 rounded-xl p-3', alignStart ? 'items-start' : 'items-center')}>
      <div className="bg-background text-muted-foreground grid size-10 shrink-0 place-items-center rounded-lg shadow-sm">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        <div className="mt-0.5 text-sm">{children}</div>
      </div>
    </div>
  );
}
