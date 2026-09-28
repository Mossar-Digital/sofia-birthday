'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import Modal from '@/components/public/Modal';
import SectionTitle from '@/components/public/SectionTitle';
import type { Photo } from '@/lib/types';

interface GalleryProps {
  photos: Photo[];
}

/** Fixed tilt per position: a scrapbook, not a grid. */
const TILTS = [-2.6, 1.9, -1.4, 2.8, -2.1, 1.3, -3.1, 2.2];

export default function Gallery({ photos }: GalleryProps) {
  const [index, setIndex] = useState<number | null>(null);
  const active = index === null ? null : photos[index];

  const go = useCallback(
    (direction: 1 | -1) => {
      setIndex((current) => {
        if (current === null) return current;
        return (current + direction + photos.length) % photos.length;
      });
    },
    [photos.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, go]);

  return (
    <section id="souvenirs" className="relative px-5 py-20 sm:py-24">
      <SectionTitle
        overline="The memories"
        title="Our little album"
        description="A few moments I keep within reach."
      />

      {photos.length === 0 ? (
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 rounded-3xl border border-dashed border-dore/25 px-6 py-12 text-center">
          <ImageOff className="h-6 w-6 text-dore/45" />
          <p className="text-sm text-latte/65">
            The album is still empty — the best pages are yet to come.
          </p>
        </div>
      ) : (
        <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
          {photos.map((photo, i) => (
            <motion.li
              key={photo.id}
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: TILTS[i % TILTS.length] }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65, delay: (i % 6) * 0.07 }}
            >
              <motion.button
                type="button"
                onClick={() => setIndex(i)}
                className="group block w-full text-left"
                whileHover={{ rotate: 0, scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', damping: 18, stiffness: 260 }}
                aria-label={photo.caption || 'Enlarge the photo'}
              >
                {/* Polaroid frame: thin margin on top, wide one below */}
                <div className="rounded-[4px] bg-gradient-to-b from-[#FBF5EA] to-[#EBDCC3] p-2.5 pb-11 shadow-polaroid">
                  <div className="relative aspect-square overflow-hidden bg-cacao/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Memory'}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                    />
                    {/* Diagonal sheen, like a real print */}
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-white/14" />
                  </div>

                  <div className="px-1 pt-2.5">
                    <p className="truncate font-script text-[1.05rem] leading-tight text-[#4A2E19]">
                      {photo.caption}
                    </p>
                    {photo.date && (
                      <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-noisette/65">
                        {photo.date}
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            </motion.li>
          ))}
        </ul>
      )}

      <Modal
        open={active !== null}
        onClose={() => setIndex(null)}
        label={active?.caption}
        className="max-w-lg px-3 sm:px-0"
      >
        {active && (
          <div className="rounded-[6px] bg-gradient-to-b from-[#FBF5EA] to-[#EBDCC3] p-3 pb-6 shadow-warm">
            <div className="relative overflow-hidden bg-cacao/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.url}
                alt={active.caption || 'Memory'}
                className="max-h-[62dvh] w-full object-contain"
              />
            </div>

            <div className="flex items-end justify-between gap-3 px-2 pt-4">
              <div className="min-w-0">
                <p className="font-script text-xl leading-tight text-[#4A2E19]">{active.caption}</p>
                {active.date && (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-noisette/70">
                    {active.date}
                  </p>
                )}
              </div>

              {photos.length > 1 && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous photo"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-cacao/10 text-cacao transition hover:bg-cacao/20"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-1 text-[10px] tabular-nums text-noisette/70">
                    {(index ?? 0) + 1}/{photos.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next photo"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-cacao/10 text-cacao transition hover:bg-cacao/20"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
