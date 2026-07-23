import NewMessageBadge from '@/components/common/NewMessageBadge';
import OnlineBadge from '@/components/common/OnlineBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { gradientAvatarClasses } from '@/constants/avatar-colors';
import { fonts } from '@/constants/fonts';
import { rtlLocales } from '@/constants/locales';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useTypingStore } from '@/stores/typing-store';
import { DmRoomSummary } from '@/types/messages';
import { Check, CheckCheck, CircleAlert, Clock, FileText, ImageIcon, Mic, Pencil, Video } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ChatItem({ recipient, lastMessage, dmKey, unreadCount }: DmRoomSummary) {
  const { detectLocale, convertToPrDigitsIfPr, formatChatTime } = useLocaleUtils();
  const t = useTranslations('ChatList');

  const avatarFallback =
    `${recipient?.firstName?.charAt(0) ?? ''}‌${recipient?.lastName?.charAt(0) ?? ''}`.toUpperCase();
  const nameLocal = detectLocale(avatarFallback);
  const isImageMessage = lastMessage?.attachments?.some((attachment) => attachment.type === 'IMAGE') ?? false;
  const isVoiceMessage = lastMessage?.attachments?.some((attachment) => attachment.type === 'VOICE') ?? false;
  const isVideoMessage = lastMessage?.attachments?.some((attachment) => attachment.type === 'VIDEO') ?? false;
  const isFileMessage = lastMessage?.attachments?.some((attachment) => attachment.type === 'FILE') ?? false;
  const messagePreview =
    lastMessage?.content ||
    (isImageMessage
      ? t('photo')
      : isVoiceMessage
        ? t('voice')
        : isVideoMessage
          ? t('video')
          : isFileMessage
            ? t('file')
            : '');
  const messageLocal = detectLocale(messagePreview);
  const myPublicId = useAuthStore((state) => state.user?.publicId);

  const isMyMessage = myPublicId === lastMessage?.sender.publicId;
  const isAlreadyRead = lastMessage?.receipts.some((item) => item.readAt);

  let icon;
  if (!isMyMessage) icon = null;
  else if (lastMessage?.isPending) icon = <Clock className="size-2.5 text-zinc-500" />;
  else if (lastMessage?.isError) icon = <CircleAlert className="text-destructive size-2.5" />;
  else if (isAlreadyRead) icon = <CheckCheck className="size-3 text-sky-500" />;
  else icon = <Check className="size-3 text-sky-500" />;

  const pathname = usePathname();
  const isActive = pathname.endsWith(dmKey);

  const isSomeoneTyping = useTypingStore((state) => state.typingUsers.some((u) => u.dmKey === dmKey));

  return (
    <Link
      className={cn(
        'flex w-full cursor-pointer items-center justify-center gap-3 p-3 transition hover:bg-zinc-200 dark:hover:bg-zinc-900',
        isActive && 'bg-zinc-200 dark:bg-zinc-900',
      )}
      href={`/home/${dmKey}`}
    >
      <Avatar className="relative size-12 min-h-12 min-w-12 flex-none overflow-visible rounded-xl">
        <AvatarImage
          className="rounded-xl"
          src={recipient.avatarUrl ?? ''}
          alt={`${recipient?.firstName} ${recipient?.lastName}'s avatar`}
        />
        <AvatarFallback
          className={cn(
            'rounded-xl bg-linear-to-br text-zinc-50',
            gradientAvatarClasses[recipient.avatarColor],
            fonts[nameLocal],
          )}
        >
          {avatarFallback}
        </AvatarFallback>
        {recipient.status === 'ONLINE' && <OnlineBadge />}
      </Avatar>
      <div className="flex h-full w-full flex-col items-start justify-between">
        <div className="flex w-full items-center justify-between">
          <span className={cn('text-sm font-medium', fonts[nameLocal])}>
            {recipient.firstName} {recipient.lastName}
          </span>
          <div className="flex items-center justify-center gap-1">
            {lastMessage?.editedAt && <Pencil className="size-2.5 text-zinc-500" />}
            {icon}
            <span className="text-xs font-light text-zinc-500">
              {convertToPrDigitsIfPr(formatChatTime(lastMessage?.createdAt.toString() as string))}
            </span>
          </div>
        </div>
        <div className="flex w-full min-w-0 items-center justify-center gap-2">
          {isSomeoneTyping && !isActive ? (
            <p className="line-clamp-1 w-full min-w-0 overflow-hidden text-start text-xs break-all text-sky-500 dark:text-sky-400">
              {t('typing')}
            </p>
          ) : (
            <p
              className={cn(
                'line-clamp-1 w-full min-w-0 overflow-hidden text-start text-xs break-all text-zinc-500 dark:text-zinc-400',
                fonts[messageLocal],
              )}
              dir={rtlLocales.has(messageLocal) ? 'rtl' : 'ltr'}
            >
              {isImageMessage && <ImageIcon className="me-1 inline size-3" />}
              {isVoiceMessage && <Mic className="me-1 inline size-3" />}
              {isVideoMessage && <Video className="me-1 inline size-3" />}
              {isFileMessage && <FileText className="me-1 inline size-3" />}
              {messagePreview}
            </p>
          )}

          {!isActive && <NewMessageBadge newMessageCount={unreadCount} />}
        </div>
      </div>
    </Link>
  );
}
