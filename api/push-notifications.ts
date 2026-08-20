import { api } from '@/api/api-client';
import { withBasePath } from '@/lib/app-path';

export type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export const pushNotificationsService = {
  getPublicKey: async () => {
    const { data } = await api.get<{ publicKey: string }>('/push/public-key');
    return data.publicKey;
  },

  subscribe: async (subscription: PushSubscriptionPayload) => {
    await api.post('/push/subscriptions', subscription);
  },

  unsubscribe: async (endpoint: string) => {
    await api.delete('/push/subscriptions', { data: { endpoint } });
  },

  sendTest: async () => {
    const { data } = await api.post<{ success: boolean; sent: number }>('/push/test');
    return data;
  },
};

export async function unsubscribeCurrentPushSubscription(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration(withBasePath('/'));
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  try {
    await pushNotificationsService.unsubscribe(subscription.endpoint);
  } finally {
    await subscription.unsubscribe();
  }
}

export function serializePushSubscription(subscription: PushSubscription): PushSubscriptionPayload {
  const serialized = subscription.toJSON();
  const endpoint = serialized.endpoint;
  const p256dh = serialized.keys?.p256dh;
  const auth = serialized.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    throw new Error('The browser returned an invalid push subscription');
  }

  return {
    endpoint,
    expirationTime: serialized.expirationTime ?? null,
    keys: { p256dh, auth },
  };
}
