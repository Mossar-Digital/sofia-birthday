'use client';

export interface ExtractedTags {
  title: string | null;
  artist: string | null;
  album: string | null;
  /** Artwork as a data URL, when the MP3 carries one. */
  cover: string | null;
}

const EMPTY: ExtractedTags = { title: null, artist: null, album: null, cover: null };

function clean(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  // ID3 tags often trail null bytes at the end of a string.
  const trimmed = value.replace(/\u0000/g, '').trim();
  return trimmed.length ? trimmed : null;
}

function pictureToDataUrl(picture: { format?: string; data?: number[] } | undefined): string | null {
  if (!picture?.data?.length) return null;

  const bytes = new Uint8Array(picture.data);
  let binary = '';
  // In chunks: artwork often runs to several hundred KB and
  // String.fromCharCode(...bytes) would blow the call stack.
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }

  const format = picture.format && picture.format.includes('/') ? picture.format : 'image/jpeg';
  return `data:${format};base64,${window.btoa(binary)}`;
}

/**
 * Reads a MP3's ID3 tags in the browser via jsmediatags.
 * Never rejects: an untagged MP3 simply returns null fields, and the admin
 * fills them in by hand.
 */
export async function readAudioTags(file: File): Promise<ExtractedTags> {
  try {
    const jsmediatags = (await import('jsmediatags/dist/jsmediatags.min.js')).default;

    return await new Promise<ExtractedTags>((resolve) => {
      // Guard: a corrupt file may never fire either callback.
      const timeout = setTimeout(() => resolve(EMPTY), 10_000);

      jsmediatags.read(file, {
        onSuccess: ({ tags }) => {
          clearTimeout(timeout);
          resolve({
            title: clean(tags.title),
            artist: clean(tags.artist),
            album: clean(tags.album),
            cover: pictureToDataUrl(tags.picture),
          });
        },
        onError: () => {
          clearTimeout(timeout);
          resolve(EMPTY);
        },
      });
    });
  } catch {
    return EMPTY;
  }
}

/** Guesses a readable title from the filename when tags are missing. */
export function guessTitleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
