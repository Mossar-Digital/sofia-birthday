import { NextResponse } from 'next/server';

import { isAuthenticated } from '@/lib/auth';
import { mergeConfig } from '@/lib/defaults';
import { readConfig, toPublicConfig, writeConfig } from '@/lib/store';

export const dynamic = 'force-dynamic';

/** Config publique — sans le mot de passe. Le studio reçoit tout. */
export async function GET() {
  const { config, backend } = await readConfig();
  const admin = await isAuthenticated();
  return NextResponse.json(
    { config: admin ? config : toPublicConfig(config), backend, admin },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const incoming = mergeConfig((body as { config?: unknown })?.config ?? body);

  // Un mot de passe vide verrouillerait Sofia dehors : on garde l'ancien.
  if (!incoming.password.trim()) {
    const { config: current } = await readConfig();
    incoming.password = current.password;
  }

  const { config, backend } = await writeConfig(incoming);
  return NextResponse.json({ config, backend });
}
