import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { gradientAvatarClasses } from '@/constants/avatar-colors';
import { user } from '@/constants/dummy-data';
import { fonts } from '@/constants/fonts';
import { useApp } from '@/hooks/use-app';
import { useLocaleUtils } from '@/hooks/use-locale-utils';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function ChatHeader() {
  const { detectLocale, convertToPrDigitsIfPr, formatChatTime } = useLocaleUtils();

  const { isRtl } = useApp();
  const router = useRouter();
  const t = useTranslations('ChatScreen');

  const avatarFallback = `${user.firstName.charAt(0)}‌${user.lastName.charAt(0)}`.toUpperCase(); // there is shift + space at the between.
  const nameLocal = detectLocale(avatarFallback);

  return (
    <div className="flex w-full items-center justify-center gap-2 border-b border-zinc-200 bg-zinc-100 p-2 dark:border-zinc-800 dark:bg-zinc-950">
      <Button
        className="min-h-10 min-w-10 cursor-pointer border border-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:border-zinc-900 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        variant="ghost"
        size="icon"
        onClick={() => router.push('/home')}
      >
        <ChevronLeft className={cn(isRtl ? 'rotate-180' : 'rotate-0')} />
      </Button>
      <div className="flex h-full w-full items-center justify-center gap-3 rounded-lg">
        <Avatar className="relative size-11 overflow-visible rounded-lg">
          <AvatarImage
            className="rounded-lg"
            src={user.avatarImage}
            alt={`${user.firstName} ${user.lastName}'s avatar`}
          />
          <AvatarFallback
            className={cn(
              'rounded-lg bg-linear-to-br text-zinc-50',
              gradientAvatarClasses[user.avatarColor],
              fonts[nameLocal],
            )}
          >
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div className="flex h-full w-full flex-col justify-between">
          <span className={(cn('font-medium'), fonts[nameLocal])}>
            {user.firstName} {user.lastName}
          </span>
          <span
            className={cn(
              'text-sm font-light',
              user.isOnline ? 'text-sky-500 dark:text-sky-400' : 'text-zinc-500 dark:text-zinc-400',
            )}
          >
            {user.isOnline ? t('online') : `${t('last_seen')} ${convertToPrDigitsIfPr(formatChatTime(user.lastSeen))}`}
          </span>
        </div>
      </div>
      {/* search button */}
    </div>
  );
}
