'use client';

import { Disc3, FileAudio, ImageUp, Music4, Sparkles, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { Card, Notice, Spinner, Toggle } from '@/components/studio/ui';
import { guessTitleFromFilename, readAudioTags } from '@/lib/id3';
import { fileToDataUrl, uploadAsset } from '@/lib/uploads';
import type { SiteConfig, Song } from '@/lib/types';

interface MusicTabProps {
  songs: Song[];
  bgm: SiteConfig['bgm'];
  onSongsChange: (songs: Song[]) => void;
  onBgmChange: (bgm: SiteConfig['bgm']) => void;
}

/** Au-delà de cette taille, la pochette part dans Storage plutôt qu'en data URL. */
const MAX_INLINE_COVER_BYTES = 180 * 1024;

function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  return Math.floor((base64.length * 3) / 4);
}

/** Bloc d'édition d'un des trois morceaux. */
function SongEditor({
  song,
  index,
  onChange,
}: {
  song: Song;
  index: number;
  onChange: (song: Song) => void;
}) {
  const audioInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'audio' | 'cover' | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAudio(file: File | undefined) {
    if (!file) return;

    setBusy('audio');
    setError(null);
    setStatus('Lecture des tags ID3…');

    try {
      // 1. On lit les tags dans le navigateur, avant tout envoi réseau.
      const tags = await readAudioTags(file);

      let cover = song.cover;
      if (tags.cover) {
        // Une pochette lourde irait gonfler la ligne de configuration :
        // au-delà du seuil, on l'envoie dans Storage et on garde l'URL.
        if (estimateDataUrlBytes(tags.cover) > MAX_INLINE_COVER_BYTES) {
          setStatus('Envoi de la pochette extraite…');
          const blob = await (await fetch(tags.cover)).blob();
          const extension = blob.type.includes('png') ? 'png' : 'jpg';
          cover = await uploadAsset(
            new File([blob], `cover-${index + 1}.${extension}`, { type: blob.type }),
            'cover',
          );
        } else {
          cover = tags.cover;
        }
      }

      setStatus('Envoi du MP3…');
      const audioUrl = await uploadAsset(file, 'audio');

      onChange({
        ...song,
        audioUrl,
        cover,
        title: tags.title ?? guessTitleFromFilename(file.name),
        artist: tags.artist ?? song.artist,
      });

      setStatus(
        tags.cover
          ? 'Pochette, titre et artiste extraits du MP3.'
          : tags.title
            ? "Titre et artiste extraits — pas de pochette dans ce MP3, ajoutez-la à la main."
            : 'Aucun tag ID3 trouvé — complétez les champs ci-dessous.',
      );
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Téléversement impossible');
      setStatus(null);
    } finally {
      setBusy(null);
      if (audioInput.current) audioInput.current.value = '';
    }
  }

  async function handleCover(file: File | undefined) {
    if (!file) return;

    setBusy('cover');
    setError(null);

    try {
      const cover =
        file.size > MAX_INLINE_COVER_BYTES
          ? await uploadAsset(file, 'cover')
          : await fileToDataUrl(file);
      onChange({ ...song, cover });
      setStatus('Pochette remplacée.');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Téléversement impossible');
    } finally {
      setBusy(null);
      if (coverInput.current) coverInput.current.value = '';
    }
  }

  return (
    <div className="rounded-2xl border border-dore/18 bg-espresso/35 p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dore/15 font-serif text-xs text-dore">
          {index + 1}
        </span>
        <span className="text-[11px] uppercase tracking-[0.2em] text-latte/55">
          Morceau {index + 1}
        </span>
      </div>

      <div className="flex gap-4">
        {/* Pochette + remplacement manuel */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => coverInput.current?.click()}
            disabled={busy !== null}
            className="group relative h-24 w-24 overflow-hidden rounded-xl bg-moka/50 ring-1 ring-dore/20 transition hover:ring-dore/50 disabled:opacity-60"
            aria-label="Changer la pochette"
          >
            {song.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={song.cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                <Music4 className="h-6 w-6 text-dore/40" strokeWidth={1.5} />
              </span>
            )}

            <span className="absolute inset-0 flex items-center justify-center bg-espresso/75 opacity-0 transition group-hover:opacity-100">
              {busy === 'cover' ? (
                <Spinner className="h-4 w-4 text-dore" />
              ) : (
                <ImageUp className="h-5 w-5 text-dore" />
              )}
            </span>
          </button>
          <input
            ref={coverInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => void handleCover(event.target.files?.[0])}
          />
          {song.cover && (
            <button
              type="button"
              onClick={() => onChange({ ...song, cover: null })}
              className="mt-1.5 flex w-full items-center justify-center gap-1 text-[10px] text-latte/45 transition hover:text-carminClair"
            >
              <Trash2 className="h-3 w-3" /> Retirer
            </button>
          )}
        </div>

        {/* Titre / artiste / MP3 */}
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={song.title}
            onChange={(event) => onChange({ ...song, title: event.target.value })}
            placeholder="Titre"
            className="w-full rounded-lg border border-dore/20 bg-cacao/40 px-3 py-2 text-sm text-creme placeholder:text-latte/40 focus:border-dore/50"
          />
          <input
            value={song.artist}
            onChange={(event) => onChange({ ...song, artist: event.target.value })}
            placeholder="Artiste"
            className="w-full rounded-lg border border-dore/20 bg-cacao/40 px-3 py-2 text-sm text-latte/85 placeholder:text-latte/40 focus:border-dore/50"
          />

          <input
            ref={audioInput}
            type="file"
            accept="audio/mpeg,audio/*"
            hidden
            onChange={(event) => void handleAudio(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => audioInput.current?.click()}
            disabled={busy !== null}
            className="btn-ghost w-full !py-2 text-xs disabled:opacity-60"
          >
            {busy === 'audio' ? <Spinner className="h-3.5 w-3.5" /> : <FileAudio className="h-3.5 w-3.5" />}
            {song.audioUrl ? 'Remplacer le MP3' : 'Choisir le MP3'}
          </button>
        </div>
      </div>

      {song.audioUrl && (
        <audio
          controls
          preload="none"
          src={song.audioUrl}
          className="mt-3 h-9 w-full"
          aria-label={`Écouter ${song.title}`}
        />
      )}

      {status && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-dore/75">
          <Sparkles className="mt-px h-3 w-3 shrink-0" />
          {status}
        </p>
      )}
      {error && (
        <p className="mt-3 text-[11px] leading-snug text-carminClair">{error}</p>
      )}
    </div>
  );
}

export default function MusicTab({ songs, bgm, onSongsChange, onBgmChange }: MusicTabProps) {
  const bgmInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBgm(file: File | undefined) {
    if (!file) return;

    setBusy(true);
    setError(null);

    try {
      const url = await uploadAsset(file, 'audio');
      onBgmChange({ ...bgm, url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Téléversement impossible');
    } finally {
      setBusy(false);
      if (bgmInput.current) bgmInput.current.value = '';
    }
  }

  return (
    <div className="space-y-5">
      <Card
        title="Musique de fond"
        description="Lancée en fondu au déverrouillage, et pilotée par le bouton flottant."
      >
        <div className="space-y-3">
          <input
            ref={bgmInput}
            type="file"
            accept="audio/mpeg,audio/*"
            hidden
            onChange={(event) => void handleBgm(event.target.files?.[0])}
          />

          <button
            type="button"
            onClick={() => bgmInput.current?.click()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-dore/30 px-5 py-6 text-sm text-creme/85 transition hover:border-dore/60 hover:bg-dore/5 disabled:opacity-60"
          >
            {busy ? <Spinner className="h-4 w-4 text-dore" /> : <Upload className="h-4 w-4 text-dore/70" />}
            {busy ? 'Téléversement…' : bgm.url ? 'Remplacer bgm.mp3' : 'Choisir bgm.mp3'}
          </button>

          {bgm.url && (
            <div className="flex items-center gap-3 rounded-xl border border-dore/15 bg-espresso/35 p-3">
              <Disc3 className="h-5 w-5 shrink-0 text-dore/70" strokeWidth={1.6} />
              <audio controls preload="none" src={bgm.url} className="h-9 min-w-0 flex-1" />
              <button
                type="button"
                onClick={() => onBgmChange({ ...bgm, url: null })}
                aria-label="Retirer la musique de fond"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-carminClair/70 transition hover:bg-carmin/15 hover:text-carminClair"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <Toggle
            label="Démarrage automatique"
            description="Au déverrouillage, en fondu. Certains navigateurs mobiles peuvent le refuser — le bouton flottant reste là."
            checked={bgm.enabled}
            onChange={(enabled) => onBgmChange({ ...bgm, enabled })}
          />

          {error && <Notice tone="warn">{error}</Notice>}
        </div>
      </Card>

      <Card
        title="Top 3 des chansons"
        description="Choisissez le MP3 : la pochette, le titre et l'artiste sont extraits automatiquement des tags ID3. Tout reste modifiable."
      >
        <div className="space-y-4">
          {songs.map((song, index) => (
            <SongEditor
              key={song.id}
              song={song}
              index={index}
              onChange={(next) => onSongsChange(songs.map((s, i) => (i === index ? next : s)))}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
