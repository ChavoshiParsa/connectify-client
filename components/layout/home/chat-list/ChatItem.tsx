import NewMessageBadge from '@/components/common/NewMessageBadge';
import OnlineBadge from '@/components/common/OnlineBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { gradientAvatarClasses } from '@/constants/avatar-colors';
import { fonts } from '@/constants/fonts';
import { rtlLocales } from '@/constants/locales';
import { useLocaleUtils } from '@/hooks/use-locale-utils';
import { cn } from '@/lib/utils';
import { ChatItemType } from '@/types/chat';
import { Check, CheckCheck, CircleAlert, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ChatItem({
  connectId,
  avatarColor,
  avatarImageSrc,
  firstName,
  lastName,
  lastMessage,
  newMessageCount,
  isOnline,
  time,
  status,
}: ChatItemType) {
  const { detectLocale, convertToPrDigitsIfPr, formatChatTime } = useLocaleUtils();
  const avatarFallback = `${firstName.charAt(0)}‌${lastName.charAt(0)}`.toUpperCase(); // there is shift + space at the between.

  const nameLocal = detectLocale(avatarFallback);
  const messageLocal = detectLocale(lastMessage);

  let icon;
  if (status === 'sent') icon = <Check className="size-3 text-sky-500" />;
  else if (status === 'seen') icon = <CheckCheck className="size-3 text-sky-500" />;
  else if (status === 'sending') icon = <Clock className="size-2.5 text-zinc-500" />;
  else if (status === 'error') icon = <CircleAlert className="text-destructive size-2.5" />;

  const pathname = usePathname();
  const isActive = pathname.endsWith(connectId);

  return (
    <Link
      className={cn(
        'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 transition hover:bg-zinc-200 dark:hover:bg-zinc-900',
        isActive && 'bg-zinc-200 dark:bg-zinc-900',
      )}
      href={'/home/' + connectId}
    >
      <Avatar className="relative size-12 overflow-visible rounded-lg">
        <AvatarImage className="rounded-lg" src={avatarImageSrc} alt={`${firstName} ${lastName}'s avatar`} />
        <AvatarFallback
          className={cn(
            'rounded-lg bg-linear-to-br text-zinc-50',
            gradientAvatarClasses[avatarColor],
            fonts[nameLocal],
          )}
        >
          {avatarFallback}
        </AvatarFallback>
        {isOnline && <OnlineBadge />}
      </Avatar>
      <div className="flex h-full w-full flex-col items-start justify-between">
        <div className="flex w-full items-center justify-between">
          <span className={(cn('font-medium'), fonts[nameLocal])}>
            {firstName} {lastName}
          </span>
          <div className="flex items-center justify-center gap-1">
            {icon}
            <span className="text-xs font-light text-zinc-500">{convertToPrDigitsIfPr(formatChatTime(time))}</span>
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-2">
          <p
            className={cn(
              'line-clamp-1 w-full overflow-hidden text-start text-sm wrap-break-word text-zinc-500',
              fonts[messageLocal],
            )}
            dir={rtlLocales.has(messageLocal) ? 'rtl' : 'ltr'}
          >
            {lastMessage}
          </p>
          <NewMessageBadge newMessageCount={newMessageCount} />
        </div>
      </div>
    </Link>
  );
}
