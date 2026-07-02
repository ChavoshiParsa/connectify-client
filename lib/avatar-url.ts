import { BACKEND_URL } from '@/api/api-client';

export function resolveAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl) return '';
  if (/^(?:data:|blob:|https?:\/\/)/.test(avatarUrl)) return avatarUrl;
  if (!BACKEND_URL) return avatarUrl;

  try {
    return new URL(avatarUrl, new URL(BACKEND_URL).origin).toString();
  } catch {
    return avatarUrl;
  }
}
