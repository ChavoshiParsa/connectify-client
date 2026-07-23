import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { fonts } from '@/constants/fonts';
import { rtlLocales } from '@/constants/locales';
import { useApp } from '@/hooks/app/use-app';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { useDeleteMessage, useEditMessage } from '@/hooks/data/use-messages';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { RoomMessageItem } from '@/types/messages';
import { Check, CheckCheck, CircleAlert, Clock, Copy, Pencil, Reply, Save, Trash2 } from 'lucide-react';
import { motion, Variants } from 'motion/react';
import { useTranslations } from 'next-intl';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import FileMessage from './FileMessage';
import MessageImage from './MessageImage';
import MessageReplyPreview from './MessageReplyPreview';
import VideoMessage from './VideoMessage';
import VoiceMessage from './VoiceMessage';

type Props = RoomMessageItem & {
  dmKey: string;
  onVisible: (messageId: string) => void;
  onReply: () => void;
  onNavigateToMessage: (messageId: string) => void;
  onImageLoad: (messageId: string) => void;
};

const bubbleVariants: Variants = {
  hidden: { y: 20, scale: 0.5 },
  visible: {
    y: 0,
    scale: [0.5, 1.05, 1],
    transition: {
      duration: 0.3,
      ease: 'easeOut',
      times: [0, 0.8, 1],
    },
  },
};

export default function Message({
  id,
  content,
  attachments,
  replyTo,
  editedAt,
  isPending,
  isError,
  receipts,
  sender,
  createdAt,
  dmKey,
  onVisible,
  onReply,
  onNavigateToMessage,
  onImageLoad,
}: Props) {
  const t = useTranslations('ChatScreen');
  const { detectLocale, convertToPrDigitsIfPr, formatTime } = useLocaleUtils();
  const myPublicId = useAuthStore((state) => state.user?.publicId);
  const { isRtl } = useApp();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isMyMessage = myPublicId === sender.publicId;
  const canCopy = Boolean(content.trim());
  const canDelete = isMyMessage && !isPending && !isError;
  const canEdit = canDelete && canCopy;
  const canReply = !isPending && !isError;
  const messageLocal = detectLocale(content);
  const editLocal = detectLocale(editContent);
  const imageAttachments = attachments?.filter((attachment) => attachment.type === 'IMAGE') ?? [];
  const voiceAttachments = attachments?.filter((attachment) => attachment.type === 'VOICE') ?? [];
  const videoAttachments = attachments?.filter((attachment) => attachment.type === 'VIDEO') ?? [];
  const fileAttachments = attachments?.filter((attachment) => attachment.type === 'FILE') ?? [];

  let icon;
  if (!isMyMessage) icon = null;
  else if (isPending) icon = <Clock className="size-2.5 text-zinc-500" />;
  else if (isError) icon = <CircleAlert className="text-destructive size-2.5" />;
  else if (receipts.some((item) => item.readAt)) icon = <CheckCheck className="size-3 text-sky-500" />;
  else icon = <Check className="size-3 text-sky-500" />;

  const messageRef = useRef<HTMLDivElement>(null);
  const hasBeenSeen = useRef(false);

  useEffect(() => {
    if (hasBeenSeen.current || isMyMessage || receipts.some((item) => item.readAt)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenSeen.current) {
          hasBeenSeen.current = true;
          onVisible(id);
        }
      },
      {
        threshold: 1.0,
      },
    );

    const current = messageRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [id, isMyMessage, receipts, onVisible]);

  function startEditing() {
    setEditContent(content);
    editMessage.reset();
    setIsEditDialogOpen(true);
  }

  function cancelEditing() {
    setEditContent(content);
    setIsEditDialogOpen(false);
  }

  function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedContent = editContent.trim();
    if (!normalizedContent || normalizedContent === content) {
      if (normalizedContent === content) setIsEditDialogOpen(false);
      return;
    }

    editMessage.mutate(
      { messageId: id, content: normalizedContent, dmKey },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          toast.success(t('message_edited'));
        },
        onError: () => toast.error(t('edit_message_failed')),
      },
    );
  }

  async function copyMessage() {
    if (!canCopy) return;

    try {
      await navigator.clipboard.writeText(content);
      toast.success(t('message_copied'));
    } catch {
      toast.error(t('copy_message_failed'));
    }
  }

  function confirmDelete() {
    deleteMessage.mutate(
      { messageId: id, dmKey },
      {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          toast.success(t('message_deleted'));
        },
        onError: () => toast.error(t('delete_message_failed')),
      },
    );
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild disabled={isEditDialogOpen || (!canCopy && !canDelete && !canReply)}>
          <motion.div
            id={`message-${id}`}
            className={cn(
              'bubble flex w-fit max-w-[80%] min-w-24 flex-col gap-1 p-2',
              isMyMessage
                ? `right bg-primary/20 dark:bg-primary/40 ${!isRtl ? 'self-end' : 'self-start'}`
                : `left bg-zinc-200 dark:bg-zinc-800 ${isRtl ? 'self-end' : 'self-start'}`,
            )}
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            ref={messageRef}
          >
            {replyTo && (
              <MessageReplyPreview
                message={replyTo}
                onClick={replyTo.deletedAt ? undefined : () => onNavigateToMessage(replyTo.id)}
              />
            )}

            {imageAttachments.map((attachment) => (
              <MessageImage
                key={attachment.fileId}
                messageId={id}
                attachment={attachment}
                onLoad={() => onImageLoad(id)}
              />
            ))}

            {voiceAttachments.map((attachment) => (
              <VoiceMessage key={attachment.fileId} messageId={id} attachment={attachment} />
            ))}
            {videoAttachments.map((attachment) => (
              <VideoMessage key={attachment.fileId} messageId={id} attachment={attachment} />
            ))}
            {fileAttachments.map((attachment) => (
              <FileMessage key={attachment.fileId} messageId={id} attachment={attachment} />
            ))}

            {content && (
              <p
                className={cn('min-w-0 text-start text-sm wrap-anywhere whitespace-pre-line', fonts[messageLocal])}
                dir={rtlLocales.has(messageLocal) ? 'rtl' : 'ltr'}
              >
                {content}
              </p>
            )}

            <span className="flex items-center gap-1 self-end text-[10px] font-light text-zinc-700 dark:text-zinc-300">
              {editedAt && <span>{t('edited')}</span>}
              {convertToPrDigitsIfPr(formatTime(createdAt.toString()))}
              {icon}
            </span>
          </motion.div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem disabled={!canReply} onSelect={onReply}>
            <Reply />
            {t('reply_message')}
          </ContextMenuItem>
          <ContextMenuItem disabled={!canCopy} onSelect={() => void copyMessage()}>
            <Copy />
            {t('copy_message')}
          </ContextMenuItem>
          {isMyMessage && (
            <>
              <ContextMenuItem disabled={!canEdit} onSelect={startEditing}>
                <Pencil />
                {t('edit_message')}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                variant="destructive"
                disabled={!canDelete}
                onSelect={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 />
                {t('delete_message')}
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!editMessage.isPending) setIsEditDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form className="grid min-w-0 gap-4" onSubmit={submitEdit}>
            <DialogHeader className="text-start sm:text-start">
              <DialogTitle>{t('edit_message_title')}</DialogTitle>
              <DialogDescription>{t('edit_message_description')}</DialogDescription>
            </DialogHeader>
            <Textarea
              className={cn('max-h-72 min-h-32 w-full resize-y', fonts[editLocal])}
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
              maxLength={5000}
              dir={rtlLocales.has(editLocal) ? 'rtl' : 'ltr'}
              disabled={editMessage.isPending}
              autoFocus
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={cancelEditing}
                disabled={editMessage.isPending}
              >
                {t('cancel_edit')}
              </Button>
              <Button type="submit" disabled={editMessage.isPending || !editContent.trim()}>
                <Save />
                {editMessage.isPending ? t('saving_edit') : t('save_edit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleteMessage.isPending) setIsDeleteDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete_message_title')}</DialogTitle>
            <DialogDescription>{t('delete_message_description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMessage.isPending}
            >
              {t('cancel_edit')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMessage.isPending}
            >
              <Trash2 />
              {deleteMessage.isPending ? t('deleting_message') : t('delete_message')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
