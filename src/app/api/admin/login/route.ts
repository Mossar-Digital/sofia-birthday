import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, createSessionToken, isAdminConfigured, isAuthenticated, verifyAdminKey } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Session state — the studio asks for this on load. */
export async function GET() {
  return NextResponse.json(
    { authenticated: await isAuthenticated(), configured: isAdminConfigured() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'ADMIN_SECRET_KEY is not set. Add it to .env.local, then restart the server.' },
      { status: 500 },
    );
  }

  let key = '';
  try {
    const body = (await request.json()) as { key?: unknown };
    key = typeof body.key === 'string' ? body.key : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!verifyAdminKey(key)) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return NextResponse.json({ error: 'Incorrect admin key' }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return response;
}
