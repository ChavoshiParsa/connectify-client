function normalizeOrigin(origin?: string): string {
  return (origin ?? '').replace(/\/+$/, '');
}

function normalizeBasePath(path?: string): string {
  const normalized = (path || '/api').replace(/^\/?/, '/').replace(/\/+$/, '');
  return normalized || '/api';
}

const legacyApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const legacyApiUrl = (() => {
  if (!legacyApiBaseUrl) return null;

  try {
    const isAbsolute = /^https?:\/\//i.test(legacyApiBaseUrl);
    const url = new URL(legacyApiBaseUrl, 'http://connectify.local');
    return {
      origin: isAbsolute ? url.origin : '',
      basePath: url.pathname.replace(/\/v1\/?$/, ''),
    };
  } catch {
    return null;
  }
})();

export const PUBLIC_API_ORIGIN = normalizeOrigin(process.env.NEXT_PUBLIC_API_ORIGIN ?? legacyApiUrl?.origin);
export const PUBLIC_API_BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_API_BASE_PATH ?? legacyApiUrl?.basePath);
export const PUBLIC_API_V1_URL = `${PUBLIC_API_ORIGIN}${PUBLIC_API_BASE_PATH}/v1`;

export function resolvePublicUrl(path: string): string {
  if (/^(?:data:|blob:|https?:\/\/)/i.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const publicPath =
    normalizedPath === '/api' || normalizedPath.startsWith('/api/')
      ? `${PUBLIC_API_BASE_PATH}${normalizedPath.slice('/api'.length)}`
      : normalizedPath;

  return `${PUBLIC_API_ORIGIN}${publicPath}`;
}
