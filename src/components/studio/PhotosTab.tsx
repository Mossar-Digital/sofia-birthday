'use client';

import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { Card, Notice, Spinner } from '@/components/studio/ui';
import { uploadAsset } from '@/lib/uploads';
import type { Photo } from '@/lib/types';

interface PhotosTabProps {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
}

function newId(): string {
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function PhotosTab({ photos, onChange }: PhotosTabProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    setBusy(true);
    setError(null);

    const added: Photo[] = [];
    const list = Array.from(files);

    for (const [index, file] of list.entries()) {
      setProgress(`${index + 1} / ${list.length}`);
      try {
        const url = await uploadAsset(file, 'photo');
        added.push({ id: newId(), url, caption: '', date: '' });
      } catch (uploadError) {
        setError(
          `“${file.name}”: ${
            uploadError instanceof Error ? uploadError.message : 'upload failed'
          }`,
        );
      }
    }

    if (added.length) onChange([...photos, ...added]);
    setBusy(false);
    setProgress('');
    if (inputRef.current) inputRef.current.value = '';
  }

  function update(id: string, patch: Partial<Photo>) {
    onChange(photos.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo)));
  }

  function remove(id: string) {
    onChange(photos.filter((photo) => photo.id !== id));
  }

  /** Moves a photo one slot, to set the order of the album. */
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-5">
      <Card
        title="Memory gallery"
        description="Photos show up as Polaroids, in this order. Caption and date are free text."
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => void handleFiles(event.target.files)}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-dore/30 px-6 py-9 transition hover:border-dore/60 hover:bg-dore/5 disabled:opacity-60"
        >
          {busy ? (
            <>
              <Spinner className="h-5 w-5 text-dore" />
              <span className="text-sm text-creme/85">Uploading… {progress}</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-dore/70" strokeWidth={1.6} />
              <span className="text-sm text-creme/85">Add photos</span>
              <span className="text-[11px] text-latte/50">
Several files at once, any image format
              </span>
            </>
          )}
        </button>

        {error && (
          <div className="mt-4">
            <Notice tone="warn">{error}</Notice>
          </div>
        )}
      </Card>

      {photos.length > 0 && (
        <Card title={`${photos.length} photo${photos.length > 1 ? 's' : ''}`}>
          <ul className="space-y-3">
            {photos.map((photo, index) => (
              <li
                key={photo.id}
                className="flex gap-3 rounded-xl border border-dore/15 bg-espresso/35 p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-lg object-cover ring-1 ring-dore/20"
                />

                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    value={photo.caption}
                    onChange={(event) => update(photo.id, { caption: event.target.value })}
                    placeholder="Caption…"
                    className="w-full rounded-lg border border-dore/20 bg-cacao/40 px-3 py-2 text-sm text-creme placeholder:text-latte/40 focus:border-dore/50"
                  />
                  <input
                    value={photo.date}
                    onChange={(event) => update(photo.id, { date: event.target.value })}
                    placeholder="Date — “Summer 2023”, “February 14th”…"
                    className="w-full rounded-lg border border-dore/20 bg-cacao/40 px-3 py-2 text-xs text-latte/85 placeholder:text-latte/40 focus:border-dore/50"
                  />
                </div>

                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-latte/60 transition hover:bg-dore/10 hover:text-dore disabled:opacity-25"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === photos.length - 1}
                    aria-label="Move down"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-latte/60 transition hover:bg-dore/10 hover:text-dore disabled:opacity-25"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(photo.id)}
                    aria-label="Delete"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-carminClair/70 transition hover:bg-carmin/15 hover:text-carminClair"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
