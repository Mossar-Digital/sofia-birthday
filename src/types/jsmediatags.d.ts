declare module 'jsmediatags/dist/jsmediatags.min.js' {
  export interface PictureTag {
    format: string;
    type: string;
    description: string;
    data: number[];
  }

  export interface Id3Tags {
    title?: string;
    artist?: string;
    album?: string;
    year?: string;
    picture?: PictureTag;
    [key: string]: unknown;
  }

  export interface ReadResult {
    type: string;
    tags: Id3Tags;
  }

  export function read(
    file: File | Blob | string,
    callbacks: {
      onSuccess: (result: ReadResult) => void;
      onError: (error: { type: string; info: string }) => void;
    },
  ): void;

  const jsmediatags: { read: typeof read };
  export default jsmediatags;
}
