import type { MetadataRoute } from 'next';
import { withBasePath } from '@/lib/app-path';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Connectify',
    short_name: 'Connectify',
    description: 'Fast, private messaging wherever you are.',
    id: withBasePath('/'),
    start_url: withBasePath('/home'),
    scope: withBasePath('/'),
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#0ea5e9',
    orientation: 'any',
    categories: ['social', 'communication'],
    icons: [
      {
        src: withBasePath('/icons/icon-192x192.png'),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: withBasePath('/icons/icon-512x512.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: withBasePath('/icons/icon-maskable-512x512.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
