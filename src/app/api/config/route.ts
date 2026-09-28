import { NextResponse } from 'next/server';

import { isAuthenticated } from '@/lib/auth';
import { mergeConfig } from '@/lib/defaults';
import { readConfig, toPublicConfig, writeConfig } from '@/lib/store';

export const dynamic = 'force-dynamic';

/** Public config — password stripped. The studio receives everything. */
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
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const incoming = mergeConfig((body as { config?: unknown })?.config ?? body);

  // An empty password would lock her out: keep the previous one.
  if (!incoming.password.trim()) {
    const { config: current } = await readConfig();
    incoming.password = current.password;
  }

  const { config, backend } = await writeConfig(incoming);
  return NextResponse.json({ config, backend });
}
