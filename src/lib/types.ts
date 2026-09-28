export type FlowerKind = 'rose' | 'sunflower' | 'tulip';

export interface Flower {
  id: FlowerKind;
  /** Name shown under the flower */
  name: string;
  /** Heading of the poetic message */
  title: string;
  /** The love note itself */
  message: string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  /** Free text: "Summer 2023", "February 14th"… */
  date: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  /** Artwork pulled from the ID3 tags, or uploaded by hand */
  cover: string | null;
  /** Public URL of the MP3 */
  audioUrl: string | null;
}

export interface SiteConfig {
  name: string;
  /** Lock screen password — never sent to the browser */
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
    /** Fade the background music in once the gate opens */
    enabled: boolean;
  };
  updatedAt: string;
}

/** What her browser receives: everything except the password. */
export type PublicConfig = Omit<SiteConfig, 'password'>;
