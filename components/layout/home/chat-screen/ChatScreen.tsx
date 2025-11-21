import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useDebouncedSeenMessages } from '@/hooks/data/use-debounced-seen-messages';
import { useRoomMessages } from '@/hooks/data/use-messages';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import Message from './Message';

type Props = { dmKey?: string };

export default function ChatScreen({ dmKey }: Props) {
  const t = useTranslations('ChatScreen');
  const endRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isEndInView, setIsEndInView] = useState(true);
  const [firstRender, setFirstRender] = useState(true);
  const previousScrollHeight = useRef(0);
  const isAutoScrolling = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior });
    }
  }, []);

  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useRoomMessages(
    dmKey as string,
  );

  const messages = data?.pages
    .flatMap((page) => page.messages)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const { markAsSeen, cleanup } = useDebouncedSeenMessages(dmKey || '', 500);

  useEffect(() => {
    if (chatRef.current && !isPending) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [isPending]);

  useEffect(() => {
    if (firstRender) {
      setTimeout(() => setFirstRender(false), 0);
      return;
    }
    if (isEndInView) {
      isAutoScrolling.current = true;
      scrollToBottom('smooth');
      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    if (chatRef.current && isFetchingNextPage === false && previousScrollHeight.current > 0) {
      const newScrollHeight = chatRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeight.current;
      chatRef.current.scrollTop += scrollDiff;
      previousScrollHeight.current = 0;
    }
  }, [isFetchingNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!isAutoScrolling.current) {
          setIsEndInView(entry.isIntersecting);
        }
      },
      {
        root: containerRef.current,
        threshold: 1.0,
      },
    );

    const current = endRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [containerRef]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          if (chatRef.current) {
            previousScrollHeight.current = chatRef.current.scrollHeight;
          }
          fetchNextPage();
        }
      },
      { root: containerRef.current, threshold: 1.0 },
    );

    const current = topRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Cleanup debounced messages on unmount or dmKey change
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup, dmKey]);

  if (!dmKey)
    return (
      <div className="flex size-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <h2 className="animate-pulse text-xl font-medium">{t('select_chat')}</h2>
      </div>
    );

  return (
    <div
      ref={containerRef}
      className="relative flex size-full flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-950"
    >
      <ChatHeader dmKey={dmKey} />

      <div className="no-scrollbar mt-auto -mb-1.5 flex w-full overflow-y-auto p-2" ref={chatRef}>
        <div className="flex h-fit w-full flex-col items-center justify-end gap-1.5">
          <div ref={topRef} />
          {isFetchingNextPage && <Spinner className="size-5" />}
          {isPending ? (
            <Spinner />
          ) : isError ? (
            <div>{error?.message}</div>
          ) : (
            messages?.map((item) => {
              const uniqueKey = item.clientId || item.id || item.createdAt.toString();
              return <Message key={uniqueKey} dmKey={dmKey} onVisible={markAsSeen} {...item} />;
            })
          )}
          <div ref={endRef} />
        </div>
      </div>

      {!isEndInView && (
        <Button
          className="absolute end-2 bottom-[72px] size-11 rounded-full bg-zinc-100 opacity-90 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          variant="outline"
          size="icon"
          onClick={() => scrollToBottom('smooth')}
        >
          <ChevronDown />
        </Button>
      )}

      <ChatInput dmKey={dmKey} />
    </div>
  );
}
