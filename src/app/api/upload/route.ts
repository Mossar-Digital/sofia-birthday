import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_BYTES = 4 * 1024 * 1024; // headroom under the 4.5 MB function limit

function safeExtension(name: string): string {
  const ext = path.extname(name).toLowerCase();
  return /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : '';
}

/**
 * Development fallback: writes into `public/uploads`.
 * In production the studio uploads straight to Supabase Storage, which
 * sidesteps the serverless function body limit.
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get('file');
  const folder = String(form.get('folder') ?? 'divers').replace(/[^a-z0-9_-]/gi, '') || 'divers';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file received' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: `File too large for local mode (${(file.size / 1024 / 1024).toFixed(1)} MB, max 4 MB). Configure Supabase Storage for larger files.`,
      },
      { status: 413 },
    );
  }

  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${safeExtension(file.name)}`;
  const target = path.join(UPLOAD_DIR, folder);

  try {
    await fs.mkdir(target, { recursive: true });
    await fs.writeFile(path.join(target, filename), Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    console.error('[upload]', error);
    return NextResponse.json(
      { error: 'Cannot write (read-only file system). Configure Supabase Storage.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: `/uploads/${folder}/${filename}` });
}
