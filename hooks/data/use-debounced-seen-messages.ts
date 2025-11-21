import { useSeenMessages } from '@/hooks/data/use-messages';
import { useCallback, useRef } from 'react';

export function useDebouncedSeenMessages(dmKey: string, delay = 500) {
  const { mutate } = useSeenMessages();
  const pendingMessages = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const markAsSeen = useCallback(
    (messageId: string) => {
      pendingMessages.current.add(messageId);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const messageIds = Array.from(pendingMessages.current);

        if (messageIds.length > 0) {
          mutate({ messageIds });
          pendingMessages.current.clear();
        }
      }, delay);
    },
    [mutate, delay],
  );

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const messageIds = Array.from(pendingMessages.current);
    if (messageIds.length > 0) {
      mutate({ messageIds });
      pendingMessages.current.clear();
    }
  }, [mutate]);

  return { markAsSeen, cleanup };
}
