import { messagesService } from '@/api/messages';
import { ImageMessageAttachment } from '@/types/messages';
import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  messageId: string;
  attachment: ImageMessageAttachment;
};

export default function MessageImage({ messageId, attachment }: Props) {
  const [source, setSource] = useState<string>();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;

    messagesService
      .getMessageImage(messageId, attachment.fileId, controller.signal)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSource(objectUrl);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Failed to load message image', error);
          setHasError(true);
        }
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.fileId, messageId]);

  if (hasError) {
    return (
      <div className="flex h-44 w-64 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10">
        <ImageOff className="size-8 opacity-60" />
      </div>
    );
  }

  if (!source) return <div className="h-44 w-64 animate-pulse rounded-xl bg-black/10 dark:bg-white/10" />;

  return (
    // The authenticated GridFS response is converted to a local blob URL, so next/image cannot optimize it.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="max-h-96 w-full min-w-48 rounded-xl object-contain"
      src={source}
      alt={attachment.fileName}
      loading="lazy"
    />
  );
}
