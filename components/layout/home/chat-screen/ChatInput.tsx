import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fonts } from '@/constants/fonts';
import { useApp } from '@/hooks/app/use-app';
import { useLocaleUtils } from '@/hooks/app/use-locale-utils';
import { useVoiceRecorder } from '@/hooks/app/use-voice-recorder';
import {
  useSendFile,
  useSendImage,
  useSendMessage,
  useSendVideo,
  useSendVoice,
  useSetTyping,
} from '@/hooks/data/use-messages';
import { compressImageToTarget, dataUrlToFile } from '@/lib/image-compress';
import { cn, getPartnerPublicKey } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { FileText, Mic, Paperclip, SendHorizontal, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type Props = { dmKey: string };

export default function ChatInput({ dmKey }: Props) {
  const t = useTranslations('ChatScreen');
  const { locale, isRtl } = useApp();

  const myPublicId = useAuthStore((state) => state.user?.publicId) as string;
  const recipientPublicId = getPartnerPublicKey(myPublicId, dmKey) as string;

  const submitFormRef = useRef<HTMLButtonElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string>();
  const [selectedVideo, setSelectedVideo] = useState<{ file: File; preview: string; durationMs?: number }>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [isFinishingRecording, setIsFinishingRecording] = useState(false);

  const lastTypingEventRef = useRef<number>(0);
  const TYPING_EVENT_INTERVAL = 800;

  const setTyping = useSetTyping();
  const sendMessage = useSendMessage(textAreaRef, setMessage);
  const sendImage = useSendImage();
  const sendVoice = useSendVoice();
  const sendVideo = useSendVideo();
  const sendFile = useSendFile();
  const voiceRecorder = useVoiceRecorder();
  const isSending =
    sendMessage.isPending || sendImage.isPending || sendVoice.isPending || sendVideo.isPending || sendFile.isPending;
  const hasAttachment = Boolean(selectedImage || selectedVideo || selectedFile);

  useEffect(() => {
    const preview = selectedVideo?.preview;
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [selectedVideo?.preview]);

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

  function sendMessageHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if ((!trimmed && !hasAttachment) || !recipientPublicId) return;

    if (selectedVideo) {
      sendVideo.mutate(
        { recipientPublicId, video: selectedVideo.file, durationMs: selectedVideo.durationMs },
        {
          onSuccess: clearSelectedAttachment,
          onError: () => toast.error(t('file_send_failed')),
        },
      );
      return;
    }
    if (selectedFile) {
      sendFile.mutate(
        { recipientPublicId, file: selectedFile },
        {
          onSuccess: clearSelectedAttachment,
          onError: () => toast.error(t('file_send_failed')),
        },
      );
      return;
    }

    if (selectedImage) {
      sendImage.mutate(
        { recipientPublicId, image: selectedImage, content: trimmed },
        {
          onSuccess: () => {
            setMessage('');
            clearSelectedImage();
            textAreaRef.current?.focus();
          },
          onError: () => toast.error(t('image_send_failed')),
        },
      );
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

  async function prepareImage(file: File) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error(t('image_invalid_type'));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error(t('image_too_large'));
      return;
    }

    setIsPreparingImage(true);
    try {
      const { dataUrl, mime } = await compressImageToTarget(file, {
        targetKB: 1500,
        maxWidth: 2048,
        maxHeight: 2048,
      });
      const extension = mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1];
      setSelectedImage(dataUrlToFile(dataUrl, `chat-image-${Date.now()}.${extension}`));
      setImagePreview(dataUrl);
    } catch {
      toast.error(t('image_prepare_failed'));
    } finally {
      setIsPreparingImage(false);
    }
  }

  async function attachmentInputHandler(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) return toast.error(t('file_too_large'));
    clearSelectedAttachment();
    if (file.type.startsWith('image/')) return void prepareImage(file);
    if (file.type.startsWith('video/')) {
      if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type))
        return toast.error(t('video_invalid_type'));
      const preview = URL.createObjectURL(file);
      const durationMs = await getVideoDuration(file).catch(() => undefined);
      setSelectedVideo({ file, preview, durationMs });
      setMessage('');
      return;
    }
    setSelectedFile(file);
    setMessage('');
  }

  function pasteHandler(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith('image/'));
    const image = imageItem?.getAsFile();
    if (!image) return;

    event.preventDefault();
    void prepareImage(image);
  }

  function clearSelectedImage() {
    setSelectedImage(undefined);
    setImagePreview(undefined);
  }

  function clearSelectedAttachment() {
    if (selectedVideo?.preview) URL.revokeObjectURL(selectedVideo.preview);
    clearSelectedImage();
    setSelectedVideo(undefined);
    setSelectedFile(undefined);
  }

  async function startVoiceRecording() {
    try {
      await voiceRecorder.startRecording();
    } catch (error: unknown) {
      const errorName = error instanceof DOMException ? error.name : '';
      toast.error(errorName === 'NotAllowedError' ? t('microphone_permission_denied') : t('voice_record_failed'));
    }
  }

  async function sendVoiceRecording() {
    if (!recipientPublicId) return;

    setIsFinishingRecording(true);
    try {
      const recording = await voiceRecorder.stopRecording();
      if (recording.durationMs > 5 * 60 * 1000) {
        toast.error(t('voice_too_long'));
        return;
      }

      sendVoice.mutate(
        {
          recipientPublicId,
          voice: recording.file,
          durationMs: recording.durationMs,
        },
        { onError: () => toast.error(t('voice_send_failed')) },
      );
    } catch {
      toast.error(t('voice_record_failed'));
    } finally {
      setIsFinishingRecording(false);
    }
  }

  const { detectLocale } = useLocaleUtils();
  const messageLocal = detectLocale(message);

  return (
    <form
      className="z-10 flex w-full flex-col gap-2 border-t border-zinc-200 bg-zinc-100 p-2 dark:border-zinc-800 dark:bg-zinc-950"
      onSubmit={sendMessageHandler}
    >
      {imagePreview && (
        <div className="relative w-fit rounded-xl border bg-zinc-200 p-1 dark:bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="max-h-40 max-w-64 rounded-lg object-contain" src={imagePreview} alt={t('image_preview')} />
          <Button
            className="absolute -top-2 -right-2 size-7 rounded-full"
            type="button"
            variant="destructive"
            size="icon"
            onClick={clearSelectedImage}
            aria-label={t('remove_image')}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
      {selectedVideo && (
        <div className="relative w-fit rounded-xl border p-1">
          <video className="max-h-40 max-w-64 rounded-lg" src={selectedVideo.preview} />
          <Button
            className="absolute -top-2 -right-2 size-7 rounded-full"
            type="button"
            variant="destructive"
            size="icon"
            onClick={clearSelectedAttachment}
          >
            <X />
          </Button>
        </div>
      )}
      {selectedFile && (
        <div className="flex max-w-sm items-center gap-3 rounded-xl border p-3">
          <FileText className="shrink-0" />
          <span className="min-w-0 flex-1 truncate text-sm">{selectedFile.name}</span>
          <Button type="button" variant="ghost" size="icon-sm" onClick={clearSelectedAttachment}>
            <X />
          </Button>
        </div>
      )}

      {voiceRecorder.isRecording ? (
        <div className="flex min-h-12 w-full items-center gap-3 rounded-xl border bg-zinc-50 px-2 dark:bg-zinc-900">
          <Button
            className="shrink-0"
            type="button"
            variant="ghost"
            size="icon"
            onClick={voiceRecorder.cancelRecording}
            disabled={isFinishingRecording}
            aria-label={t('cancel_voice')}
          >
            <Trash2 className="text-destructive" />
          </Button>
          <span className="size-2.5 animate-pulse rounded-full bg-red-500" />
          <span className="min-w-12 text-sm font-medium tabular-nums">
            {formatRecordingTime(voiceRecorder.durationMs)}
          </span>
          <div className="mx-1 h-0.5 flex-1 overflow-hidden rounded-full bg-zinc-300 dark:bg-zinc-700">
            <div className="h-full w-full origin-left animate-pulse bg-red-500" />
          </div>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
            type="button"
            size="icon"
            onClick={() => void sendVoiceRecording()}
            disabled={isFinishingRecording}
            aria-label={t('send_voice')}
          >
            <SendHorizontal className={cn(isRtl ? 'rotate-180' : 'rotate-0')} />
          </Button>
        </div>
      ) : (
        <div className="flex w-full gap-2">
          <input
            ref={imageInputRef}
            className="hidden"
            type="file"
            onChange={(event) => void attachmentInputHandler(event)}
          />
          <Button
            className="min-h-12 min-w-12 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            type="button"
            variant="outline"
            size="icon"
            disabled={isSending || isPreparingImage}
            onClick={() => imageInputRef.current?.click()}
            aria-label={t('attach_file')}
          >
            <Paperclip />
          </Button>
          <Button
            className="min-h-12 min-w-12 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            type="button"
            variant="outline"
            size="icon"
            disabled={isSending || isPreparingImage || hasAttachment}
            onClick={() => void startVoiceRecording()}
            aria-label={t('record_voice')}
          >
            <Mic />
          </Button>
          <Textarea
            className={cn(
              'max-h-12 min-h-12 resize-none py-3 text-sm wrap-break-word',
              fonts[message !== '' ? messageLocal : locale],
            )}
            ref={textAreaRef}
            placeholder={selectedImage ? t('write_caption') : t('write_message')}
            name="message-field"
            value={message}
            onChange={textareaChangeHandler}
            onKeyDown={keyDownHandler}
            onPaste={pasteHandler}
            autoComplete="off"
            required={!hasAttachment}
            disabled={isSending || Boolean(selectedVideo || selectedFile)}
          />
          <Button
            className="hover:bg-primary/20 min-h-12 min-w-12 bg-zinc-100 dark:bg-zinc-950"
            variant="outline"
            size="icon"
            ref={submitFormRef}
            disabled={isSending || isPreparingImage || (!message.trim() && !hasAttachment)}
          >
            <SendHorizontal className={cn(isRtl ? 'rotate-180' : 'rotate-0')} />
          </Button>
        </div>
      )}
    </form>
  );
}

function formatRecordingTime(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      resolve(Math.round(duration * 1000));
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Invalid video'));
    };
    video.src = url;
  });
}
