export type FlowerKind = 'rose' | 'tournesol' | 'tulipe' | 'pivoine' | 'lavande';

export interface Flower {
  id: FlowerKind;
  /** Nom affiché sous la fleur */
  name: string;
  /** Titre du message poétique */
  title: string;
  /** Le message d'amour lui-même */
  message: string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  /** Texte libre : « Été 2023 », « 14 février »… */
  date: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  /** Pochette extraite des tags ID3 ou téléversée à la main */
  cover: string | null;
  /** URL publique du MP3 */
  audioUrl: string | null;
}

export interface SiteConfig {
  name: string;
  /** Mot de passe de l'écran de verrouillage — jamais envoyé au client */
  password: string;
  hint: string;
  greeting: string;
  subtitle: string;
  gardenIntro: string;
  letter: {
    title: string;
    body: string;
    signature: string;
  };
  flowers: Flower[];
  photos: Photo[];
  songs: Song[];
  bgm: {
    url: string | null;
    /** Démarrage automatique en douceur au déverrouillage */
    enabled: boolean;
  };
  updatedAt: string;
}

/** Ce que le navigateur de Sofia reçoit : tout, sauf le mot de passe. */
export type PublicConfig = Omit<SiteConfig, 'password'>;
