import { Button } from '@/components/ui/button';
import { useMessageMedia } from '@/hooks/data/use-message-media';
import { VideoMessageAttachment } from '@/types/messages';
import { Download, VideoOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function VideoMessage({
  messageId,
  attachment,
}: {
  messageId: string;
  attachment: VideoMessageAttachment;
}) {
  const t = useTranslations('ChatScreen');
  const { source, hasError } = useMessageMedia(messageId, attachment.fileId);
  const download = () => {
    if (!source) return;
    const link = document.createElement('a');
    link.href = source;
    link.download = attachment.fileName;
    link.click();
  };

  if (hasError)
    return (
      <div className="flex h-40 w-64 items-center justify-center rounded-xl bg-black/10">
        <VideoOff />
      </div>
    );
  if (!source) return <div className="h-40 w-64 animate-pulse rounded-xl bg-black/10" />;

  return (
    <div className="relative overflow-hidden rounded-xl bg-black">
      <video className="max-h-96 w-full min-w-56" src={source} controls preload="metadata" />
      <Button
        className="absolute top-2 right-2 bg-black/60 text-white hover:bg-black/80"
        type="button"
        size="icon-sm"
        onClick={download}
        aria-label={t('download_file')}
      >
        <Download />
      </Button>
    </div>
  );
}
