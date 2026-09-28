import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost, Parisienne } from 'next/font/google';

import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
});

const parisienne = Parisienne({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'For you',
  description: 'A gift.',
  // The gift stays private: no indexing, no social preview.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#231309',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} ${parisienne.variable}`}>
      <body>{children}</body>
    </html>
  );
}
