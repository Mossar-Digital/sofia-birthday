import type { FlowerKind, SiteConfig } from './types';

/**
 * Ids used before the garden was translated and trimmed to three flowers.
 * Without this mapping, a config saved under the old ids would silently lose
 * its text and fall back to the defaults.
 */
const LEGACY_FLOWER_IDS: Record<string, FlowerKind> = {
  tournesol: 'sunflower',
  tulipe: 'tulip',
};

export const DEFAULT_CONFIG: SiteConfig = {
  name: 'Sofia',
  password: 'sofia',
  hint: 'The name I whisper when nobody else is listening.',
  greeting: 'Happy Birthday Sofia',
  subtitle: 'A little garden I planted just for you.',
  gardenIntro:
    'Three flowers, three things I can never quite say well enough. Touch them, one by one.',
  letter: {
    title: 'My Sofia,',
    body: `There are mornings when I wake up before you, just to have a moment to realise how lucky I am.

You came into my life like light through half-closed shutters: without warning, and suddenly everything had colour. I didn't know you could get used to happiness without ever growing tired of it.

Today you are a year older, and I am a year deeper in love with you. It's the only birthday I really celebrate.

I wish you everything you don't yet dare to ask for. And if you'll have me, I'd like to be there to watch it arrive.`,
    signature: 'Yours, always.',
  },
  flowers: [
    {
      id: 'rose',
      name: 'The Rose',
      title: 'For the first time',
      message:
        "I remember the exact day I knew. You were laughing at something silly I hadn't meant to be funny, and I thought: there it is, that's the laugh I want to hear grow old. The rose is that certainty. Red, whole, needing no explanation.",
    },
    {
      id: 'sunflower',
      name: 'The Sunflower',
      title: 'For your light',
      message:
        'A sunflower spends its whole life looking for the sun. I never had to look: you walked into the room. You have this gift of making ordinary days bearable and hard days crossable. Thank you for being my direction.',
    },
    {
      id: 'tulip',
      name: 'The Tulip',
      title: 'For your softness',
      message:
        "There's a tenderness in you that you think is nothing special, and it undoes me: the way you check that I've eaten, the way you remember small details, the way you forgive quickly. A tulip is simple and perfect. Like you, when you're not trying.",
    },
  ],
  photos: [],
  songs: [
    { id: 'song-1', title: 'Our first song', artist: 'To be filled in', cover: null, audioUrl: null },
    { id: 'song-2', title: 'The one from the car', artist: 'To be filled in', cover: null, audioUrl: null },
    { id: 'song-3', title: 'The one from the last slow dance', artist: 'To be filled in', cover: null, audioUrl: null },
  ],
  bgm: { url: null, enabled: true },
  updatedAt: new Date(0).toISOString(),
};

/** Normalises a partial config (older version, incomplete JSON…) */
export function mergeConfig(partial: unknown): SiteConfig {
  const base = structuredClone(DEFAULT_CONFIG);
  if (!partial || typeof partial !== 'object') return base;
  const p = partial as Partial<SiteConfig>;

  return {
    ...base,
    ...p,
    letter: { ...base.letter, ...(p.letter ?? {}) },
    bgm: { ...base.bgm, ...(p.bgm ?? {}) },
    // Driven by `base`, so a flower removed from the defaults disappears even
    // if an older saved config still carries it.
    flowers: base.flowers.map((flower) => {
      const found = p.flowers?.find(
        (f) => f.id === flower.id || LEGACY_FLOWER_IDS[f.id] === flower.id,
      );
      return found ? { ...flower, ...found, id: flower.id } : flower;
    }),
    photos: Array.isArray(p.photos) ? p.photos.filter((ph) => ph && ph.url) : base.photos,
    songs: base.songs.map((song, i) => {
      const found = p.songs?.[i];
      return found ? { ...song, ...found, id: song.id } : song;
    }),
  };
}
