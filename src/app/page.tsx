import Experience from '@/components/public/Experience';
import { readConfig, toPublicConfig } from '@/lib/store';

// La page reflète immédiatement les changements faits dans le studio.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { config } = await readConfig();

  // Aucune trace de l'administration ici : Sofia ne voit que le cadeau,
  // et le mot de passe ne quitte jamais le serveur.
  return <Experience config={toPublicConfig(config)} />;
}
