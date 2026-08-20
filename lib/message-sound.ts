let audioContext: AudioContext | null = null;
let audioUnlocked = false;
const recentlyPlayed = new Map<string, number>();

const MESSAGE_DEDUPLICATION_MS = 10_000;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const AudioContextConstructor =
    window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextConstructor) return null;
  audioContext ??= new AudioContextConstructor();
  return audioContext;
}

export async function unlockMessageSound(): Promise<void> {
  const context = getAudioContext();
  if (!context) return;

  if (context.state === 'suspended') {
    try {
      await context.resume();
    } catch {
      audioUnlocked = false;
      return;
    }
  }

  audioUnlocked = context.state === 'running';
}

export function playMessageSound(messageId: string): void {
  const now = Date.now();

  for (const [id, playedAt] of recentlyPlayed) {
    if (now - playedAt > MESSAGE_DEDUPLICATION_MS) recentlyPlayed.delete(id);
  }

  const context = getAudioContext();
  if (!audioUnlocked || !context || recentlyPlayed.has(messageId)) return;

  recentlyPlayed.set(messageId, now);

  const playChime = () => {
    if (context.state !== 'running') {
      recentlyPlayed.delete(messageId);
      return;
    }

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.24);
    gain.connect(context.destination);

    const firstTone = context.createOscillator();
    firstTone.type = 'sine';
    firstTone.frequency.setValueAtTime(880, context.currentTime);
    firstTone.connect(gain);
    firstTone.start(context.currentTime);
    firstTone.stop(context.currentTime + 0.12);

    const secondTone = context.createOscillator();
    secondTone.type = 'sine';
    secondTone.frequency.setValueAtTime(1174.66, context.currentTime + 0.09);
    secondTone.connect(gain);
    secondTone.start(context.currentTime + 0.09);
    secondTone.stop(context.currentTime + 0.24);
  };

  if (context.state === 'suspended') {
    void context
      .resume()
      .then(playChime)
      .catch(() => recentlyPlayed.delete(messageId));
    return;
  }

  playChime();
}
