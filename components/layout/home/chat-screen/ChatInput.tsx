import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fonts } from '@/constants/fonts';
import { useApp } from '@/hooks/app/use-app';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { useSendImage, useSendMessage, useSetTyping } from '@/hooks/data/use-messages';
import { compressImageToTarget, dataUrlToFile } from '@/lib/image-compress';
import { cn, getPartnerPublicKey } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { ImagePlus, SendHorizontal, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type Props = { dmKey: string };

export default function ChatInput({ dmKey }: Props) {
  const t = useTranslations('ChatScreen');
  const { locale, isRtl } = useApp();

  const myPublicId = useAuthStore((state) => state.user?.publicId) as string;
  const recipientPublicId = getPartnerPublicKey(myPublicId, dmKey) as string;

  const submitFormRef = useRef<HTMLButtonElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string>();
  const [isPreparingImage, setIsPreparingImage] = useState(false);

  const lastTypingEventRef = useRef<number>(0);
  const TYPING_EVENT_INTERVAL = 800;

  const setTyping = useSetTyping();
  const sendMessage = useSendMessage(textAreaRef, setMessage);
  const sendImage = useSendImage();
  const isSending = sendMessage.isPending || sendImage.isPending;

  function textareaChangeHandler(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setMessage(value);

    if (!value.trim() || !recipientPublicId) {
      return;
    }

    const now = Date.now();

    if (now - lastTypingEventRef.current > TYPING_EVENT_INTERVAL) {
      setTyping.mutate({ recipientPublicId });
      lastTypingEventRef.current = now;
    }
  }

  function sendMessageHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if ((!trimmed && !selectedImage) || !recipientPublicId) return;

    if (selectedImage) {
      sendImage.mutate(
        { recipientPublicId, image: selectedImage, content: trimmed },
        {
          onSuccess: () => {
            setMessage('');
            clearSelectedImage();
            textAreaRef.current?.focus();
          },
          onError: () => toast.error(t('image_send_failed')),
        },
      );
      return;
    }

    sendMessage.mutate({ recipientPublicId, content: trimmed });
  }

  function keyDownHandler(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitFormRef.current?.click();
    }
  }

  async function prepareImage(file: File) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error(t('image_invalid_type'));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error(t('image_too_large'));
      return;
    }

    setIsPreparingImage(true);
    try {
      const { dataUrl, mime } = await compressImageToTarget(file, {
        targetKB: 1500,
        maxWidth: 2048,
        maxHeight: 2048,
      });
      const extension = mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1];
      setSelectedImage(dataUrlToFile(dataUrl, `chat-image-${Date.now()}.${extension}`));
      setImagePreview(dataUrl);
    } catch {
      toast.error(t('image_prepare_failed'));
    } finally {
      setIsPreparingImage(false);
    }
  }

  function imageInputHandler(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void prepareImage(file);
  }

  function pasteHandler(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith('image/'));
    const image = imageItem?.getAsFile();
    if (!image) return;

    event.preventDefault();
    void prepareImage(image);
  }

  function clearSelectedImage() {
    setSelectedImage(undefined);
    setImagePreview(undefined);
  }

  const { detectLocale } = useLocaleUtils();
  const messageLocal = detectLocale(message);

  return (
    <form
      className="z-10 flex w-full flex-col gap-2 border-t border-zinc-200 bg-zinc-100 p-2 dark:border-zinc-800 dark:bg-zinc-950"
      onSubmit={sendMessageHandler}
    >
      {imagePreview && (
        <div className="relative w-fit rounded-xl border bg-zinc-200 p-1 dark:bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="max-h-40 max-w-64 rounded-lg object-contain" src={imagePreview} alt={t('image_preview')} />
          <Button
            className="absolute -top-2 -right-2 size-7 rounded-full"
            type="button"
            variant="destructive"
            size="icon"
            onClick={clearSelectedImage}
            aria-label={t('remove_image')}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      <div className="flex w-full gap-2">
        <input
          ref={imageInputRef}
          className="hidden"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={imageInputHandler}
        />
        <Button
          className="min-h-12 min-w-12 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          type="button"
          variant="outline"
          size="icon"
          disabled={isSending || isPreparingImage}
          onClick={() => imageInputRef.current?.click()}
          aria-label={t('attach_image')}
        >
          <ImagePlus />
        </Button>
        <Textarea
          className={cn(
            'max-h-12 min-h-12 resize-none py-3 text-sm wrap-break-word',
            fonts[message !== '' ? messageLocal : locale],
          )}
          ref={textAreaRef}
          placeholder={selectedImage ? t('write_caption') : t('write_message')}
          name="message-field"
          value={message}
          onChange={textareaChangeHandler}
          onKeyDown={keyDownHandler}
          onPaste={pasteHandler}
          autoComplete="off"
          required={!selectedImage}
          disabled={isSending}
        />
        <Button
          className="min-h-12 min-w-12 bg-zinc-100 hover:bg-sky-400 dark:bg-zinc-950 dark:hover:bg-sky-500"
          variant="outline"
          size="icon"
          ref={submitFormRef}
          disabled={isSending || isPreparingImage || (!message.trim() && !selectedImage)}
        >
          <SendHorizontal className={cn(isRtl ? 'rotate-180' : 'rotate-0')} />
        </Button>
      </div>
    </form>
  );
}
