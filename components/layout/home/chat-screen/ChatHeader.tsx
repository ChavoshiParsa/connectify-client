import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { gradientAvatarClasses } from '@/constants/avatar-colors';
import { fonts } from '@/constants/fonts';
import { useApp } from '@/hooks/app/use-app';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { useRoomDetails } from '@/hooks/data/use-messages';
import { cn } from '@/lib/utils';
import { useTypingStore } from '@/stores/typing-store';
import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

type Props = {
  dmKey?: string;
};

export default function ChatHeader({ dmKey }: Props) {
  const { detectLocale, convertToPrDigitsIfPr, formatChatTime } = useLocaleUtils();

  const { isRtl } = useApp();
  const router = useRouter();
  const t = useTranslations('ChatScreen');

  const { data, isPending, isError, error } = useRoomDetails(dmKey as string);

  const isSomeoneTyping = useTypingStore((state) => state.typingUsers.some((u) => u.dmKey === dmKey));

  if (isPending) return <Spinner />;
  if (isError) return <div>{error?.message}</div>;

  const user = data?.recipient;

  const avatarFallback = `${user?.firstName?.charAt(0) ?? ''}‌${user?.lastName?.charAt(0) ?? ''}`.toUpperCase();
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
        <Avatar className="relative size-12 min-h-12 min-w-12 basis-12 flex-none overflow-visible rounded-xl">
          <AvatarImage
            className="rounded-xl"
            src={user.avatarUrl ?? ''}
            alt={`${user?.firstName} ${user?.lastName}'s avatar`}
          />
          <AvatarFallback
            className={cn(
              'rounded-xl bg-linear-to-br text-zinc-50',
              gradientAvatarClasses[user.avatarColor],
              fonts[nameLocal],
            )}
          >
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div className="flex h-full w-full flex-col justify-between">
          <span className={(cn('font-medium'), fonts[nameLocal])}>
            {user?.firstName} {user?.lastName}
          </span>
          <span
            className={cn(
              'text-sm font-light',
              user.status === 'ONLINE' ? 'text-sky-500 dark:text-sky-400' : 'text-zinc-500 dark:text-zinc-400',
            )}
          >
            {isSomeoneTyping
              ? t('typing')
              : user.status === 'ONLINE'
                ? t('online')
                : `${t('last_seen_at')} ${convertToPrDigitsIfPr(formatChatTime((user.lastActiveAt as Date).toString()))}`}
          </span>
        </div>
      </div>
      {/* search button */}
    </div>
  );
}
