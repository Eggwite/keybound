import type { Metadata, Viewport } from 'next';
import type * as React from 'react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://keybound.eggwite.moe'),
  title: {
    default: 'Keybound',
    template: '%s | Keybound',
  },
  description:
    'Compile-time keyboard annotations for React. WinForms-style &Save mnemonics, mod+k hotkeys, nested modal scopes, and live hint overlays with a tiny <8KB runtime.',
  keywords: [
    'react',
    'keyboard shortcuts',
    'mnemonics',
    'hotkeys',
    'accessibility',
    'nextjs',
    'vite',
    'react-keybound',
    'keybound',
    'modal scope',
    'command palette',
    'keyboard navigation',
    'focus management',
  ],
  authors: [{ name: 'Eggwite', url: 'https://github.com/Eggwite' }],
  creator: 'Eggwite',
  publisher: 'Eggwite',
  alternates: {
    canonical: 'https://keybound.eggwite.moe',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://keybound.eggwite.moe',
    siteName: 'Keybound',
    title: 'Keybound',
    description:
      'Compile-time keyboard annotations for React. WinForms-style &Save mnemonics, mod+k hotkeys, nested modal scopes, and live hint overlays.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Keybound',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keybound',
    description:
      'Compile-time keyboard annotations for React. WinForms-style &Save mnemonics, mod+k hotkeys, and modal scopes.',
    images: ['/og.png'],
    creator: '@eggwite',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#fbfaf9',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
