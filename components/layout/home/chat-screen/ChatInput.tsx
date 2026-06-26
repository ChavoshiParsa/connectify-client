import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fonts } from '@/constants/fonts';
import { useApp } from '@/hooks/app/use-app';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { useSendMessage, useSetTyping } from '@/hooks/data/use-messages';
import { cn, getPartnerPublicKey } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { SendHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

type Props = { dmKey: string };

export default function ChatInput({ dmKey }: Props) {
  const t = useTranslations('ChatScreen');
  const { locale, isRtl } = useApp();

  const myPublicId = useAuthStore((state) => state.user?.publicId) as string;
  const recipientPublicId = getPartnerPublicKey(myPublicId, dmKey) as string;

  const submitFormRef = useRef<HTMLButtonElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState('');

  const lastTypingEventRef = useRef<number>(0);
  const TYPING_EVENT_INTERVAL = 800;

  const setTyping = useSetTyping();
  const sendMessage = useSendMessage(textAreaRef, setMessage);

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

  async function sendMessageHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }
    if (!recipientPublicId) {
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

  const { detectLocale } = useLocaleUtils();
  const messageLocal = detectLocale(message);

  return (
    <form
      className="z-10 flex w-full gap-2 border-t border-zinc-200 bg-zinc-100 p-2 dark:border-zinc-800 dark:bg-zinc-950"
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
        disabled={sendMessage.isPending}
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
