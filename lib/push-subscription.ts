import { withBasePath } from '@/lib/app-path';

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  const registration = await navigator.serviceWorker.getRegistration(withBasePath('/'));
  return registration?.pushManager.getSubscription() ?? null;
}

export async function unsubscribePushLocally(): Promise<void> {
  const subscription = await getCurrentPushSubscription();
  if (subscription) await subscription.unsubscribe();
}
