import OnlineBadge from '@/components/common/OnlineBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { gradientAvatarClasses } from '@/constants/avatar-colors';
import { fonts } from '@/constants/fonts';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { cn, makeDmKey } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { SafeUser } from '@/types/users';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function SearchResultItem({
  publicId,
  firstName,
  lastName,
  avatarColor,
  avatarUrl,
  status,
  lastActiveAt,
}: SafeUser) {
  const { detectLocale, convertToPrDigitsIfPr, formatChatTime } = useLocaleUtils();
  const myPublicId = useAuthStore((state) => state.user?.publicId) as string;
  const dmKey = makeDmKey(myPublicId, publicId);

  const avatarFallback = `${firstName?.charAt(0) ?? ''}‌${lastName?.charAt(0) ?? ''}`.toUpperCase();
  const nameLocal = detectLocale(avatarFallback);

  const t = useTranslations('ChatList');

  return (
    <Link
      className="flex w-full cursor-pointer items-center justify-center gap-3 p-3 transition hover:bg-zinc-200 dark:hover:bg-zinc-900"
      href={`/home/${dmKey}`}
    >
      <Avatar className="relative size-12 min-h-12 min-w-12 flex-none overflow-visible rounded-xl">
        <AvatarImage className="rounded-xl" src={avatarUrl ?? ''} alt={`${firstName} ${lastName}'s avatar`} />
        <AvatarFallback
          className={cn(
            'rounded-xl bg-linear-to-br text-zinc-50',
            gradientAvatarClasses[avatarColor],
            fonts[nameLocal],
          )}
        >
          {avatarFallback}
        </AvatarFallback>
        {status === 'ONLINE' && <OnlineBadge />}
      </Avatar>
      <div className="flex h-full w-full flex-col items-start justify-between">
        <div className="flex w-full items-center justify-between">
          <span className={cn('text-sm font-medium', fonts[nameLocal])}>
            {firstName} {lastName}
          </span>

          <span
            className={cn(
              'text-sm font-light',
              status === 'ONLINE' ? 'text-sky-500 dark:text-sky-400' : 'text-zinc-500 dark:text-zinc-400',
            )}
          >
            {status === 'ONLINE'
              ? t('online')
              : `${t('last_seen_at')} ${convertToPrDigitsIfPr(formatChatTime((lastActiveAt as Date).toString()))}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
