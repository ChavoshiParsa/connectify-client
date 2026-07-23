import { messagesService } from '@/api/messages';
import { VoiceMessageAttachment } from '@/types/messages';
import { CircleAlert, LoaderCircle, Pause, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { usePreferencesStore } from '@/stores/preferences-store';

type Props = {
  messageId: string;
  attachment: VoiceMessageAttachment;
};

export default function VoiceMessage({ messageId, attachment }: Props) {
  const t = useTranslations('ChatScreen');
  const colorTheme = usePreferencesStore((state) => state.colorTheme);
  const waveformRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [source, setSource] = useState<string>();
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(Math.max(attachment.durationMs / 1000, 0.1));

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;

    messagesService
      .getMessageMedia(messageId, attachment.fileId, controller.signal)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSource(objectUrl);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Failed to load voice message', error);
          setHasError(true);
        }
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.fileId, messageId]);

  useEffect(() => {
    if (!source || !waveformRef.current) return;

    const brandColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#0ea5e9';
    const waveSurfer = WaveSurfer.create({
      container: waveformRef.current,
      url: source,
      height: 36,
      waveColor: '#94a3b8',
      progressColor: brandColor,
      cursorColor: brandColor,
      cursorWidth: 1,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
    });
    waveSurferRef.current = waveSurfer;

    const subscriptions = [
      waveSurfer.on('ready', (duration) => setDurationSeconds(duration)),
      waveSurfer.on('timeupdate', (time) => setCurrentSeconds(time)),
      waveSurfer.on('play', () => setIsPlaying(true)),
      waveSurfer.on('pause', () => setIsPlaying(false)),
      waveSurfer.on('finish', () => {
        setIsPlaying(false);
        setCurrentSeconds(0);
        waveSurfer.seekTo(0);
      }),
      waveSurfer.on('error', () => setHasError(true)),
    ];

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
      waveSurfer.destroy();
      waveSurferRef.current = null;
    };
  }, [source, colorTheme]);

  const togglePlayback = async () => {
    if (!waveSurferRef.current || hasError) return;
    try {
      await waveSurferRef.current.playPause();
    } catch {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className="flex min-w-60 items-center gap-2 py-2 text-sm opacity-70">
        <CircleAlert className="size-5" />
        {t('voice_load_failed')}
      </div>
    );
  }

  return (
    <div className="flex min-w-60 items-center gap-3 py-1 sm:min-w-72">
      <button
        className="bg-primary text-primary-foreground hover:bg-primary/90 grid size-10 shrink-0 place-items-center rounded-full transition disabled:opacity-60"
        type="button"
        onClick={() => void togglePlayback()}
        disabled={!source}
        aria-label={isPlaying ? t('pause_voice') : t('play_voice')}
      >
        {!source ? (
          <LoaderCircle className="size-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="size-5 fill-current" />
        ) : (
          <Play className="size-5 fill-current" />
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div ref={waveformRef} className="min-h-9 w-full cursor-pointer" aria-label={t('voice_timeline')} />
        <span className="text-start text-[10px] opacity-70">
          {formatDuration(currentSeconds)} / {formatDuration(durationSeconds)}
        </span>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${String(safeSeconds % 60).padStart(2, '0')}`;
}
