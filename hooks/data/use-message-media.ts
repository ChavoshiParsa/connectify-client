import { messagesService } from '@/api/messages';
import { useEffect, useState } from 'react';

export function useMessageMedia(messageId: string, fileId: string) {
  const [source, setSource] = useState<string>();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    setHasError(false);
    setSource(undefined);

    messagesService
      .getMessageMedia(messageId, fileId, controller.signal)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSource(objectUrl);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasError(true);
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId, messageId]);

  return { source, hasError };
}
