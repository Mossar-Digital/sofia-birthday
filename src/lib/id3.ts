'use client';

export interface ExtractedTags {
  title: string | null;
  artist: string | null;
  album: string | null;
  /** Pochette en data URL, si le MP3 en contient une. */
  cover: string | null;
}

const EMPTY: ExtractedTags = { title: null, artist: null, album: null, cover: null };

function clean(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  // Les tags ID3 traînent souvent des octets nuls en fin de chaîne.
  const trimmed = value.replace(/\u0000/g, '').trim();
  return trimmed.length ? trimmed : null;
}

function pictureToDataUrl(picture: { format?: string; data?: number[] } | undefined): string | null {
  if (!picture?.data?.length) return null;

  const bytes = new Uint8Array(picture.data);
  let binary = '';
  // Par tranches : une pochette fait souvent plusieurs centaines de ko et
  // String.fromCharCode(...bytes) ferait exploser la pile d'appels.
  const CHUNK = 8192;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }

  const format = picture.format && picture.format.includes('/') ? picture.format : 'image/jpeg';
  return `data:${format};base64,${window.btoa(binary)}`;
}

/**
 * Lit les tags ID3 d'un MP3 côté navigateur via jsmediatags.
 * Ne rejette jamais : un MP3 sans tags renvoie simplement des champs nuls,
 * l'admin complète alors à la main.
 */
export async function readAudioTags(file: File): Promise<ExtractedTags> {
  try {
    const jsmediatags = (await import('jsmediatags/dist/jsmediatags.min.js')).default;

    return await new Promise<ExtractedTags>((resolve) => {
      // Garde-fou : un fichier corrompu peut ne déclencher aucun callback.
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

/** Devine un titre lisible depuis le nom de fichier, quand les tags manquent. */
export function guessTitleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
