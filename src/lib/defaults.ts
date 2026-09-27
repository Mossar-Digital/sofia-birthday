import type { SiteConfig } from './types';

export const DEFAULT_CONFIG: SiteConfig = {
  name: 'Sofia',
  password: 'sofia',
  hint: "Le prénom que je murmure quand personne n'écoute.",
  greeting: 'Joyeux Anniversaire Sofia',
  subtitle: "Un petit jardin que j'ai planté rien que pour toi.",
  gardenIntro:
    "Cinq fleurs, cinq choses que je n'arrive jamais à dire assez bien. Touche-les, une par une.",
  letter: {
    title: 'Ma Sofia,',
    body: `Il y a des matins où je me réveille avant toi, juste pour avoir le temps de réaliser ma chance.

Tu es arrivée dans ma vie comme la lumière entre deux volets : sans prévenir, et tout d'un coup tout avait une couleur. Je ne savais pas qu'on pouvait s'habituer au bonheur sans jamais s'en lasser.

Aujourd'hui tu as un an de plus, et moi j'ai un an de plus à t'aimer. C'est le seul anniversaire que je fête vraiment.

Je te souhaite tout ce que tu n'oses pas encore demander. Et si tu veux bien, je resterai là pour le voir arriver avec toi.`,
    signature: 'Pour toujours, à toi.',
  },
  flowers: [
    {
      id: 'rose',
      name: 'La Rose',
      title: 'Pour la première fois',
      message:
        "Je me souviens du jour exact où j'ai su. Tu riais d'une bêtise que j'avais dite sans le vouloir, et j'ai pensé : voilà, c'est ce rire que je veux entendre vieillir. La rose, c'est cette évidence-là. Rouge, entière, sans explication.",
    },
    {
      id: 'tournesol',
      name: 'Le Tournesol',
      title: 'Pour ta lumière',
      message:
        "Le tournesol passe sa vie à chercher le soleil. Moi je n'ai pas eu à chercher : tu es entrée dans la pièce. Tu as ce don de rendre les jours ordinaires supportables, et les jours difficiles traversables. Merci d'être ma direction.",
    },
    {
      id: 'tulipe',
      name: 'La Tulipe',
      title: 'Pour ta douceur',
      message:
        "Il y a une tendresse chez toi que tu crois banale et qui me bouleverse : la façon dont tu vérifies que j'ai mangé, dont tu retiens les détails, dont tu pardonnes vite. La tulipe est simple et parfaite. Comme toi, quand tu ne fais pas exprès.",
    },
    {
      id: 'pivoine',
      name: 'La Pivoine',
      title: 'Pour ta beauté',
      message:
        "La pivoine ne s'ouvre pas à moitié. Elle prend toute la place, et personne ne s'en plaint. Tu es belle d'une manière qui n'a rien à voir avec les miroirs — belle dans la façon dont tu écoutes, dont tu t'emportes, dont tu t'endors sur mon épaule.",
    },
    {
      id: 'lavande',
      name: 'La Lavande',
      title: 'Pour notre calme',
      message:
        "La lavande, c'est le soir. C'est la maison. C'est le silence confortable à deux, quand on n'a plus rien à prouver. Si je devais choisir un seul endroit au monde, ce serait celui-là : toi, moi, et rien de prévu.",
    },
  ],
  photos: [],
  songs: [
    { id: 'song-1', title: 'Notre première chanson', artist: 'À compléter', cover: null, audioUrl: null },
    { id: 'song-2', title: 'Celle de la voiture', artist: 'À compléter', cover: null, audioUrl: null },
    { id: 'song-3', title: 'Celle du dernier slow', artist: 'À compléter', cover: null, audioUrl: null },
  ],
  bgm: { url: null, enabled: true },
  updatedAt: new Date(0).toISOString(),
};

/** Normalise une config partielle (vieille version, JSON incomplet…) */
export function mergeConfig(partial: unknown): SiteConfig {
  const base = structuredClone(DEFAULT_CONFIG);
  if (!partial || typeof partial !== 'object') return base;
  const p = partial as Partial<SiteConfig>;

  return {
    ...base,
    ...p,
    letter: { ...base.letter, ...(p.letter ?? {}) },
    bgm: { ...base.bgm, ...(p.bgm ?? {}) },
    flowers: base.flowers.map((flower) => {
      const found = p.flowers?.find((f) => f.id === flower.id);
      return found ? { ...flower, ...found } : flower;
    }),
    photos: Array.isArray(p.photos) ? p.photos.filter((ph) => ph && ph.url) : base.photos,
    songs: base.songs.map((song, i) => {
      const found = p.songs?.[i];
      return found ? { ...song, ...found, id: song.id } : song;
    }),
  };
}
