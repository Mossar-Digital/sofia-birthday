import { NextResponse } from 'next/server';

import { readConfig } from '@/lib/store';

export const dynamic = 'force-dynamic';

/** Checks the password server-side so it is never exposed to the client. */
export async function POST(request: Request) {
  let attempt = '';
  try {
    const body = (await request.json()) as { password?: unknown };
    attempt = typeof body.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { config } = await readConfig();
  const ok = attempt.trim().toLowerCase() === config.password.trim().toLowerCase();

  // A small delay: discourages brute force without annoying her.
  if (!ok) await new Promise((resolve) => setTimeout(resolve, 600));

  return NextResponse.json({ ok }, { headers: { 'Cache-Control': 'no-store' } });
}
