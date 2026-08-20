import { resolvePublicUrl } from '@/lib/public-api';

export function resolveAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl) return '';
  if (/^(?:data:|blob:|https?:\/\/)/.test(avatarUrl)) return avatarUrl;
  return resolvePublicUrl(avatarUrl);
}
