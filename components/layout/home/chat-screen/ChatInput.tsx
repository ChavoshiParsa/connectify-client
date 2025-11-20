import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fonts } from '@/constants/fonts';
import { useApp } from '@/hooks/app/use-app';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { useSendMessage, useSetTyping } from '@/hooks/data/use-messages';
import { cn, getRecipientPublicId } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { SendHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

type Props = { dmKey: string };

export default function ChatInput({ dmKey }: Props) {
  const t = useTranslations('ChatScreen');
  const { locale, isRtl } = useApp();

  const myPublicId = useAuthStore((state) => state.user?.publicId);
  const recipientPublicId = getRecipientPublicId(dmKey, myPublicId);

  const submitFormRef = useRef<HTMLButtonElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { mutate: setTyping } = useSetTyping();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  function textareaChangeHandler(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setMessage(value);

    if (!value.trim()) {
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping({ recipientPublicId });
    }, 700);
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  async function sendMessageHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    if (!recipientPublicId) {
      return;
    }

    sendMessage(
      { dmKey, recipientPublicId, content: trimmed },
      {
        onSuccess: () => {
          setMessage('');
          textAreaRef.current?.focus();
        },
      },
    );
  }

  function keyDownHandler(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitFormRef.current?.click();
    }
  }

  const { detectLocale } = useLocaleUtils();
  const messageLocal = detectLocale(message);

  return (
    <form
      className="z-20 flex w-full gap-2 border-t border-zinc-200 bg-zinc-100 p-2 dark:border-zinc-800 dark:bg-zinc-950"
      onSubmit={sendMessageHandler}
    >
      <Textarea
        className={cn(
          'max-h-12 min-h-12 resize-none py-3 text-sm wrap-break-word',
          fonts[message !== '' ? messageLocal : locale],
        )}
        ref={textAreaRef}
        placeholder={t('write_message')}
        name="message-field"
        value={message}
        onChange={textareaChangeHandler}
        onKeyDown={keyDownHandler}
        autoComplete="off"
        required
        disabled={isSending}
      />
      <Button
        className="min-h-12 min-w-12 bg-zinc-100 hover:bg-sky-400 dark:bg-zinc-950 dark:hover:bg-sky-500"
        variant="outline"
        size="icon"
        ref={submitFormRef}
      >
        <SendHorizontal className={cn(isRtl ? 'rotate-180' : 'rotate-0')} />
      </Button>
    </form>
  );
}
