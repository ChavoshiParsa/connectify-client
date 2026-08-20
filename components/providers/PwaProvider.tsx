'use client';

import {
  pushNotificationsService,
  serializePushSubscription,
  type PushSubscriptionPayload,
} from '@/api/push-notifications';
import { withBasePath } from '@/lib/app-path';
import { playMessageSound, unlockMessageSound } from '@/lib/message-sound';
import { PUBLIC_API_BASE_PATH } from '@/lib/public-api';
import { useAuthStore } from '@/stores/auth-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type PwaContextValue = {
  isInstalled: boolean;
  canPromptInstall: boolean;
  installApp: () => Promise<boolean>;
  notificationSupported: boolean;
  notificationPermission: NotificationPermission;
  notificationsEnabled: boolean;
  notificationLoading: boolean;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
};

type PushWorkerMessage = {
  type?: string;
  payload?: {
    messageId?: string;
  };
};

const PwaContext = createContext<PwaContextValue | null>(null);

function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || standaloneNavigator.standalone === true;
}

function urlBase64ToArrayBuffer(value: string): ArrayBuffer {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const bytes = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    bytes[index] = rawData.charCodeAt(index);
  }

  return bytes.buffer;
}

async function subscribeBrowser(registration: ServiceWorkerRegistration): Promise<PushSubscriptionPayload> {
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const publicKey = await pushNotificationsService.getPublicKey();
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToArrayBuffer(publicKey),
    });
  }

  return serializePushSubscription(subscription);
}

export default function PwaProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    setIsInstalled(isRunningStandalone());

    const supportsNotifications = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setNotificationSupported(supportsNotifications);
    if (supportsNotifications) setNotificationPermission(Notification.permission);

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    const handleWorkerMessage = (event: MessageEvent<PushWorkerMessage>) => {
      if (event.data?.type === 'PUSH_MESSAGE' && event.data.payload?.messageId) {
        playMessageSound(event.data.payload.messageId);
      }
    };

    const unlockAudio = () => {
      void unlockMessageSound();
    };

    const unlockAudioWhenVisible = () => {
      if (document.visibilityState === 'visible') void unlockMessageSound();
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('focus', unlockAudio);
    window.addEventListener('pageshow', unlockAudio);
    document.addEventListener('visibilitychange', unlockAudioWhenVisible);

    if ('serviceWorker' in navigator) {
      const workerUrl = `${withBasePath('/sw.js')}?apiBasePath=${encodeURIComponent(PUBLIC_API_BASE_PATH)}`;
      navigator.serviceWorker.addEventListener('message', handleWorkerMessage);
      void navigator.serviceWorker
        .register(workerUrl, { scope: withBasePath('/') })
        .then(async (workerRegistration) => {
          setRegistration(workerRegistration);
          const subscription = await workerRegistration.pushManager.getSubscription();
          setNotificationsEnabled(Boolean(subscription));
        })
        .catch((error: unknown) => {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Service worker registration failed', error);
          }
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('focus', unlockAudio);
      window.removeEventListener('pageshow', unlockAudio);
      document.removeEventListener('visibilitychange', unlockAudioWhenVisible);
      navigator.serviceWorker?.removeEventListener('message', handleWorkerMessage);
    };
  }, []);

  const syncNotifications = useCallback(async () => {
    if (!registration) return false;

    const subscription = await subscribeBrowser(registration);
    await pushNotificationsService.subscribe(subscription);
    setNotificationsEnabled(true);
    return true;
  }, [registration]);

  useEffect(() => {
    if (!isAuthenticated || notificationPermission !== 'granted' || !registration) return;

    void syncNotifications().catch((error: unknown) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Push subscription synchronization failed', error);
      }
    });
  }, [isAuthenticated, notificationPermission, registration, syncNotifications]);

  const enableNotifications = useCallback(async () => {
    if (!notificationSupported || !registration) return false;

    setNotificationLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission !== 'granted') return false;

      return await syncNotifications();
    } finally {
      setNotificationLoading(false);
    }
  }, [notificationSupported, registration, syncNotifications]);

  const disableNotifications = useCallback(async () => {
    if (!registration) return;

    setNotificationLoading(true);
    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        try {
          await pushNotificationsService.unsubscribe(subscription.endpoint);
        } finally {
          await subscription.unsubscribe();
        }
      }
      setNotificationsEnabled(false);
    } finally {
      setNotificationLoading(false);
    }
  }, [registration]);

  const installApp = useCallback(async () => {
    if (!installPrompt) return false;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    return choice.outcome === 'accepted';
  }, [installPrompt]);

  const value = useMemo<PwaContextValue>(
    () => ({
      isInstalled,
      canPromptInstall: Boolean(installPrompt),
      installApp,
      notificationSupported,
      notificationPermission,
      notificationsEnabled,
      notificationLoading,
      enableNotifications,
      disableNotifications,
    }),
    [
      disableNotifications,
      enableNotifications,
      installApp,
      installPrompt,
      isInstalled,
      notificationLoading,
      notificationPermission,
      notificationSupported,
      notificationsEnabled,
    ],
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa(): PwaContextValue {
  const value = useContext(PwaContext);
  if (!value) throw new Error('usePwa must be used inside PwaProvider');
  return value;
}
