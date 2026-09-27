import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'sofia_studio';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 h

function adminSecret(): string {
  return process.env.ADMIN_SECRET_KEY ?? '';
}

export function isAdminConfigured(): boolean {
  return adminSecret().length > 0;
}

function sign(payload: string): string {
  return createHmac('sha256', adminSecret()).update(payload).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Compare la clé saisie à ADMIN_SECRET_KEY, en temps constant. */
export function verifyAdminKey(candidate: string): boolean {
  const secret = adminSecret();
  if (!secret) return false;
  return safeEqual(candidate, secret);
}

/** Jeton `expiration.signature` — inutilisable sans ADMIN_SECRET_KEY. */
export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  return `${expires}.${sign(String(expires))}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !adminSecret()) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature) return false;
  if (Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}

/** À appeler dans les routes d'API : true si la requête vient du studio. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}
