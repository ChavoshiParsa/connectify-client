import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { MessageAttachment } from '@/types/messages';

type ReplyPreviewMessage = {
  id: string;
  content: string;
  attachments: MessageAttachment[] | null;
  deletedAt?: Date | null;
  sender: {
    firstName: string;
    lastName: string | null;
    publicId: string;
  };
};

type Props = {
  message: ReplyPreviewMessage;
  className?: string;
  onClick?: () => void;
};

export default function MessageReplyPreview({ message, className, onClick }: Props) {
  const t = useTranslations('ChatScreen');
  const isDeleted = Boolean(message.deletedAt);
  const senderName = [message.sender.firstName, message.sender.lastName].filter(Boolean).join(' ');
  const attachment = message.attachments?.[0];
  const summary = isDeleted
    ? t('deleted_message')
    : message.content.trim()
      ? message.content.replace(/\s+/g, ' ').trim()
      : attachment?.type === 'IMAGE'
        ? t('photo')
        : attachment?.type === 'VOICE'
          ? t('voice_message')
          : attachment?.type === 'VIDEO'
            ? t('video')
            : attachment?.type === 'FILE'
              ? t('file')
              : t('message');

  return (
    <button
      type="button"
      className={cn(
        'border-primary/70 bg-background/35 hover:bg-background/55 flex w-full min-w-0 flex-col rounded-md border-s-2 px-2.5 py-1.5 text-start transition-colors disabled:pointer-events-none',
        className,
      )}
      onClick={isDeleted ? undefined : onClick}
      disabled={!onClick || isDeleted}
      aria-label={onClick && !isDeleted ? t('go_to_replied_message') : undefined}
    >
      <span className="text-primary w-full truncate text-xs font-semibold">{senderName}</span>
      <span className="text-muted-foreground w-full truncate text-xs">{summary}</span>
    </button>
  );
}
