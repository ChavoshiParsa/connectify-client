import { messagesService } from '@/api/messages';
import { Button } from '@/components/ui/button';
import { FileMessageAttachment } from '@/types/messages';
import { Download, FileText, LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function FileMessage({
  messageId,
  attachment,
}: {
  messageId: string;
  attachment: FileMessageAttachment;
}) {
  const t = useTranslations('ChatScreen');
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async () => {
    setIsDownloading(true);
    try {
      const blob = await messagesService.getMessageMedia(messageId, attachment.fileId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex min-w-60 items-center gap-3 rounded-xl bg-black/10 p-3 dark:bg-white/10">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/50 dark:bg-black/30">
        <FileText />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{attachment.fileName}</p>
        <p className="text-xs opacity-60">{formatFileSize(attachment.size)}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => void download()}
        disabled={isDownloading}
        aria-label={t('download_file')}
      >
        {isDownloading ? <LoaderCircle className="animate-spin" /> : <Download />}
      </Button>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
