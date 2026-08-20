import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useDebouncedSeenMessages } from '@/hooks/data/use-debounced-seen-messages';
import { useRoomMessages } from '@/hooks/data/use-messages';
import { useAuthStore } from '@/stores/auth-store';
import { RoomMessageItem } from '@/types/messages';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import DateSeparator from './DateSeparator';
import Message from './Message';
import NewMessagesSeparator from './NewMessagesSeparator';

type Props = { dmKey?: string };

const BOTTOM_THRESHOLD_PX = 72;
const TOP_PAGINATION_THRESHOLD_PX = 80;

export default function ChatScreen({ dmKey }: Props) {
  const t = useTranslations('ChatScreen');
  const myPublicId = useAuthStore((state) => state.user?.publicId);
  const chatRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const initialScrollRoomRef = useRef<string | undefined>(undefined);
  const unreadBoundaryRoomRef = useRef<string | undefined>(undefined);
  const previousLatestMessageIdRef = useRef<string | undefined>(undefined);
  const initialScrollCompleteRef = useRef(false);
  const isAtBottomRef = useRef(true);
  const fetchingOlderRef = useRef(false);
  const previousScrollHeightRef = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesStartId, setNewMessagesStartId] = useState<string | undefined>(undefined);
  const [replyingTo, setReplyingTo] = useState<RoomMessageItem | undefined>(undefined);
  const [messageToReveal, setMessageToReveal] = useState<string | undefined>(undefined);

  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useRoomMessages(
    dmKey,
    Boolean(dmKey),
  );

  const messages = useMemo(
    () =>
      data?.pages
        .flatMap((page) => page.messages)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) ?? [],
    [data],
  );
  const latestMessage = messages.at(-1);
  const latestMessageId = latestMessage?.id;
  const { markAsSeen, cleanup } = useDebouncedSeenMessages(dmKey || '', 500);

  const updateBottomState = useCallback((value: boolean) => {
    isAtBottomRef.current = value;
    setIsAtBottom(value);
  }, []);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const chat = chatRef.current;
      if (!chat) return;
      chat.scrollTo({ top: chat.scrollHeight, behavior });
      updateBottomState(true);
    },
    [updateBottomState],
  );

  const fetchOlderMessages = useCallback(() => {
    const chat = chatRef.current;
    if (!chat || !initialScrollCompleteRef.current || !hasNextPage || isFetchingNextPage || fetchingOlderRef.current) {
      return;
    }

    fetchingOlderRef.current = true;
    previousScrollHeightRef.current = chat.scrollHeight;
    void fetchNextPage().finally(() => {
      fetchingOlderRef.current = false;
    });
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleScroll = useCallback(() => {
    const chat = chatRef.current;
    if (!chat) return;

    const distanceFromBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight;
    updateBottomState(distanceFromBottom <= BOTTOM_THRESHOLD_PX);

    if (chat.scrollTop <= TOP_PAGINATION_THRESHOLD_PX) fetchOlderMessages();
  }, [fetchOlderMessages, updateBottomState]);

  const revealMessage = useCallback((messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (!element) return false;

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.animate([{ filter: 'brightness(1.35)' }, { filter: 'brightness(1)' }], {
      duration: 900,
      easing: 'ease-out',
    });
    return true;
  }, []);

  const navigateToMessage = useCallback(
    (messageId: string) => {
      if (!revealMessage(messageId)) setMessageToReveal(messageId);
    },
    [revealMessage],
  );

  const handleImageLoad = useCallback(
    (messageId: string) => {
      if (messageId !== latestMessageId) return;

      requestAnimationFrame(() => {
        scrollToBottom('auto');
      });
    },
    [latestMessageId, scrollToBottom],
  );

  useLayoutEffect(() => {
    initialScrollRoomRef.current = undefined;
    unreadBoundaryRoomRef.current = undefined;
    previousLatestMessageIdRef.current = undefined;
    initialScrollCompleteRef.current = false;
    fetchingOlderRef.current = false;
    previousScrollHeightRef.current = 0;
    setNewMessagesStartId(undefined);
    setReplyingTo(undefined);
    setMessageToReveal(undefined);
    updateBottomState(true);
  }, [dmKey, updateBottomState]);

  useLayoutEffect(() => {
    if (!dmKey || isPending || !chatRef.current || initialScrollRoomRef.current === dmKey) return;

    initialScrollRoomRef.current = dmKey;
    initialScrollCompleteRef.current = false;
    scrollToBottom('auto');

    const frame = requestAnimationFrame(() => {
      scrollToBottom('auto');
      initialScrollCompleteRef.current = true;
    });
    const settleTimer = setTimeout(() => {
      scrollToBottom('auto');
      initialScrollCompleteRef.current = true;
    }, 300);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
    };
  }, [dmKey, isPending, scrollToBottom]);

  useLayoutEffect(() => {
    if (!dmKey || !myPublicId || isPending || unreadBoundaryRoomRef.current === dmKey) return;

    unreadBoundaryRoomRef.current = dmKey;
    const firstUnreadIncoming = messages.find(
      (message) => message.sender.publicId !== myPublicId && message.receipts.some((receipt) => !receipt.readAt),
    );
    setNewMessagesStartId(firstUnreadIncoming?.id);
    previousLatestMessageIdRef.current = latestMessageId;
  }, [dmKey, isPending, latestMessageId, messages, myPublicId]);

  useLayoutEffect(() => {
    if (!dmKey || !initialScrollCompleteRef.current || !latestMessage || !latestMessageId) return;

    const previousLatestMessageId = previousLatestMessageIdRef.current;
    previousLatestMessageIdRef.current = latestMessageId;

    if (!previousLatestMessageId || previousLatestMessageId === latestMessageId) return;

    const frame = requestAnimationFrame(() => scrollToBottom('smooth'));
    return () => cancelAnimationFrame(frame);
  }, [dmKey, latestMessage, latestMessageId, myPublicId, scrollToBottom]);

  useLayoutEffect(() => {
    const chat = chatRef.current;
    if (isFetchingNextPage || !chat || previousScrollHeightRef.current === 0) return;

    const heightDifference = chat.scrollHeight - previousScrollHeightRef.current;
    chat.scrollTop += heightDifference;
    previousScrollHeightRef.current = 0;
  }, [isFetchingNextPage, messages.length]);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(() => {
      if (initialScrollCompleteRef.current && isAtBottomRef.current && previousScrollHeightRef.current === 0) {
        scrollToBottom('auto');
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [dmKey, scrollToBottom]);

  useEffect(() => {
    if (!messageToReveal) return;
    if (revealMessage(messageToReveal)) {
      setMessageToReveal(undefined);
      return;
    }

    if (hasNextPage) {
      if (!isFetchingNextPage) fetchOlderMessages();
      return;
    }

    toast.error(t('original_message_not_found'));
    setMessageToReveal(undefined);
  }, [fetchOlderMessages, hasNextPage, isFetchingNextPage, messageToReveal, messages.length, revealMessage, t]);

  useEffect(() => () => cleanup(), [cleanup, dmKey]);

  if (!dmKey) {
    return (
      <div className="flex size-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <h2 className="animate-pulse text-xl font-medium">{t('select_chat')}</h2>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-0 flex-col bg-zinc-100 dark:bg-zinc-950">
      <ChatHeader dmKey={dmKey} onNavigateToMessage={navigateToMessage} />

      <div
        ref={chatRef}
        className="no-scrollbar min-h-0 w-full flex-1 overflow-y-auto overscroll-contain p-2 [overflow-anchor:none]"
        onScroll={handleScroll}
      >
        <div ref={contentRef} className="flex min-h-full w-full flex-col items-center gap-1.5">
          <div className="mt-auto h-px w-full shrink-0" />
          {isFetchingNextPage && <Spinner className="size-5 shrink-0" />}

          {isPending ? (
            <Spinner />
          ) : isError ? (
            <div>{error?.message}</div>
          ) : messages.length === 0 ? (
            <div className="animate-bounce rounded-full bg-zinc-200/50 px-3 py-1 text-center text-sm text-zinc-500 dark:bg-zinc-800/50">
              {t('no_messages')}
            </div>
          ) : (
            messages.map((item, index) => {
              const uniqueKey = item.clientId || item.id || item.createdAt.toString();
              const messageDate = new Date(item.createdAt);
              const previousMessage = messages[index - 1];
              const startsNewDay =
                !previousMessage || messageDate.toDateString() !== new Date(previousMessage.createdAt).toDateString();

              return (
                <Fragment key={uniqueKey}>
                  {startsNewDay && <DateSeparator date={messageDate} />}
                  {item.id === newMessagesStartId && <NewMessagesSeparator />}
                  <Message
                    dmKey={dmKey}
                    onVisible={markAsSeen}
                    onReply={() => setReplyingTo(item)}
                    onNavigateToMessage={navigateToMessage}
                    onImageLoad={handleImageLoad}
                    {...item}
                  />
                </Fragment>
              );
            })
          )}
        </div>
      </div>

      {!isAtBottom && (
        <Button
          className="absolute inset-e-3 bottom-20 size-11 rounded-full bg-zinc-100/90 shadow-md hover:bg-zinc-200 dark:bg-zinc-950/90 dark:hover:bg-zinc-900"
          variant="outline"
          size="icon"
          onClick={() => scrollToBottom('smooth')}
          aria-label={t('scroll_to_latest')}
        >
          <ChevronDown />
        </Button>
      )}

      <ChatInput dmKey={dmKey} replyingTo={replyingTo} onCancelReply={() => setReplyingTo(undefined)} />
    </div>
  );
}
