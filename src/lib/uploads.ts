'use client';

import { AUDIO_BUCKET, PHOTOS_BUCKET, getBrowserSupabase } from './supabase';

export type AssetKind = 'photo' | 'audio' | 'cover';

const BUCKETS: Record<AssetKind, string> = {
  photo: PHOTOS_BUCKET,
  cover: PHOTOS_BUCKET,
  audio: AUDIO_BUCKET,
};

function slug(name: string): string {
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : '';
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .toLowerCase();
  return `${Date.now()}-${base || 'file'}${ext}`;
}

/**
 * Uploads a file and returns its public URL.
 *
 * Supabase configured → browser uploads straight to Storage (no 4.5 MB cap).
 * Otherwise           → falls back to /api/upload, writing to public/uploads (dev).
 */
export async function uploadAsset(file: File, kind: AssetKind): Promise<string> {
  const supabase = getBrowserSupabase();

  if (supabase) {
    const bucket = BUCKETS[kind];
    const key = `${kind}/${slug(file.name)}`;
    const { error } = await supabase.storage.from(bucket).upload(key, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) throw new Error(`Supabase Storage : ${error.message}`);
    const { data } = supabase.storage.from(bucket).getPublicUrl(key);
    return data.publicUrl;
  }

  const form = new FormData();
  form.append('file', file);
  form.append('folder', kind);

  const response = await fetch('/api/upload', { method: 'POST', body: form });
  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !payload.url) throw new Error(payload.error ?? 'Upload failed');
  return payload.url;
}

/** Turns a file into a data URL — used for lightweight artwork. */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });
}
