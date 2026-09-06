import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Keybound',
    short_name: 'Keybound',
    description: 'Desktop-grade keyboard interactions for modern React applications.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbfaf9',
    theme_color: '#fbfaf9',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/logo.png',
        sizes: '256x256',
        type: 'image/png',
      },
    ],
  };
}
