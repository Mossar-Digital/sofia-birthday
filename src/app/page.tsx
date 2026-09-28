import Experience from '@/components/public/Experience';
import { readConfig, toPublicConfig } from '@/lib/store';

// The page reflects studio changes immediately.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { config } = await readConfig();

  // No trace of the admin side here: she only ever sees the gift,
  // and the password never leaves the server.
  return <Experience config={toPublicConfig(config)} />;
}
