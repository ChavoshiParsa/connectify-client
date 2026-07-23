import { messagesService } from '@/api/messages';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ImageMessageAttachment } from '@/types/messages';
import { Download, Expand, ImageOff, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type Props = {
  messageId: string;
  attachment: ImageMessageAttachment;
  onLoad?: () => void;
};

export default function MessageImage({ messageId, attachment, onLoad }: Props) {
  const t = useTranslations('ChatScreen');
  const [source, setSource] = useState<string>();
  const [hasError, setHasError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = source;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      <button
        className="group/image relative min-w-48 cursor-zoom-in overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t('open_image')}
      >
        {/* The authenticated GridFS response is a local blob URL, so next/image cannot optimize it. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="max-h-96 w-full rounded-xl object-contain"
          src={source}
          alt={attachment.fileName}
          onLoad={onLoad}
        />
        <span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition group-hover/image:bg-black/25 group-hover/image:opacity-100 group-focus-visible/image:bg-black/25 group-focus-visible/image:opacity-100">
          <Expand className="size-8 drop-shadow" />
        </span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="inset-0 top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black/95 p-0 text-white sm:max-w-none"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{attachment.fileName}</DialogTitle>

          <header className="z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4">
            <span className="min-w-0 truncate text-sm text-white/80">{attachment.fileName}</span>
            <div className="flex shrink-0 gap-2">
              <Button
                className="border-white/20 bg-black/20 text-white hover:bg-white/15 hover:text-white"
                type="button"
                variant="outline"
                onClick={downloadImage}
              >
                <Download />
                <span className="hidden sm:inline">{t('download_image')}</span>
              </Button>
              <DialogClose asChild>
                <Button
                  className="border-white/20 bg-black/20 text-white hover:bg-white/15 hover:text-white"
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t('close_image')}
                >
                  <X />
                </Button>
              </DialogClose>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="max-h-full max-w-full object-contain"
              src={source}
              alt={attachment.fileName}
              draggable={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
