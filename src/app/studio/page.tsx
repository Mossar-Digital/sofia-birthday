import type { Metadata } from 'next';

import Studio from '@/components/studio/Studio';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Studio',
  robots: { index: false, follow: false, nocache: true },
};

export default function StudioPage() {
  return <Studio />;
}
