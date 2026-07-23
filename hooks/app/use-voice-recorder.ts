import { useCallback, useEffect, useRef, useState } from 'react';

export type RecordedVoice = {
  file: File;
  durationMs: number;
};

const MIME_TYPE_PREFERENCES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'];

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const recorderRef = useRef<MediaRecorder | undefined>(undefined);
  const isStartingRef = useRef(false);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const stopResolverRef = useRef<((recording: RecordedVoice) => void) | null>(null);
  const stopRejecterRef = useRef<((reason?: unknown) => void) | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = undefined;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = undefined;
    recorderRef.current = undefined;
    chunksRef.current = [];
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      throw new Error('VOICE_RECORDING_UNSUPPORTED');
    }
    if (recorderRef.current || isStartingRef.current) return;

    isStartingRef.current = true;
    let stream: MediaStream | undefined;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MIME_TYPE_PREFERENCES.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      setDurationMs(0);
      setIsRecording(true);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = (event) => {
        stopRejecterRef.current?.(event);
        stopResolverRef.current = null;
        stopRejecterRef.current = null;
        cleanup();
      };

      recorder.onstop = () => {
        const finalDurationMs = Math.max(1, Date.now() - startedAtRef.current);
        const finalMimeType = recorder.mimeType || chunksRef.current[0]?.type || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: finalMimeType });
        const extension = extensionForMimeType(finalMimeType);
        const recording = new File([blob], `voice-${Date.now()}.${extension}`, { type: finalMimeType });

        stopResolverRef.current?.({ file: recording, durationMs: finalDurationMs });
        stopResolverRef.current = null;
        stopRejecterRef.current = null;
        cleanup();
      };

      recorder.start(250);
      timerRef.current = setInterval(() => setDurationMs(Date.now() - startedAtRef.current), 200);
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      throw error;
    } finally {
      isStartingRef.current = false;
    }
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return Promise.reject(new Error('NO_ACTIVE_RECORDING'));

    return new Promise<RecordedVoice>((resolve, reject) => {
      stopResolverRef.current = resolve;
      stopRejecterRef.current = reject;
      recorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    stopResolverRef.current = null;
    stopRejecterRef.current = null;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    else cleanup();
  }, [cleanup]);

  useEffect(() => cancelRecording, [cancelRecording]);

  return { isRecording, durationMs, startRecording, stopRecording, cancelRecording };
}

function extensionForMimeType(mimeType: string): string {
  const normalized = mimeType.split(';')[0];
  if (normalized === 'audio/mp4' || normalized === 'audio/x-m4a') return 'm4a';
  if (normalized === 'audio/ogg') return 'ogg';
  if (normalized === 'audio/wav') return 'wav';
  if (normalized === 'audio/mpeg') return 'mp3';
  return 'webm';
}
