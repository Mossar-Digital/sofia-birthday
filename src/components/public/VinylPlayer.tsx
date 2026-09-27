'use client';

import { motion } from 'framer-motion';
import { Disc3, Music4, Pause, Play } from 'lucide-react';

import SectionTitle from '@/components/public/SectionTitle';
import { useSiteAudio } from '@/components/public/AudioProvider';
import type { Song } from '@/lib/types';

interface VinylPlayerProps {
  songs: Song[];
}

/** Le disque : sillons concentriques, étiquette centrale ou pochette. */
function Record({ cover, spinning }: { cover: string | null; spinning: boolean }) {
  return (
    <div className="relative aspect-square w-full">
      {/* Sillons */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'repeating-radial-gradient(circle at 50% 50%, #100804 0 2px, #1c1109 2px 3.5px), radial-gradient(circle at 50% 50%, #241509, #0d0603)',
          boxShadow: '0 18px 44px -14px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(200,163,76,0.14)',
        }}
        animate={spinning ? { rotate: 360 } : { rotate: 0 }}
        transition={
          spinning
            ? { duration: 1.9, repeat: Infinity, ease: 'linear' }
            : { duration: 0.6, ease: 'easeOut' }
        }
      >
        {/* Reflet fixe qui balaie le vinyle */}
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-45"
          style={{
            background:
              'conic-gradient(from 210deg at 50% 50%, transparent 0deg, rgba(240,223,198,0.16) 26deg, transparent 62deg, transparent 180deg, rgba(240,223,198,0.1) 208deg, transparent 250deg)',
          }}
        />

        {/* Étiquette centrale : la pochette extraite du MP3 */}
        <div className="absolute inset-[30%] overflow-hidden rounded-full ring-2 ring-espresso/70">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-carmin to-moka">
              <Music4 className="h-1/3 w-1/3 text-creme/55" strokeWidth={1.4} />
            </div>
          )}
        </div>

        {/* Trou central */}
        <span className="absolute left-1/2 top-1/2 h-[4.5%] w-[4.5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-espresso ring-1 ring-black/60" />
      </motion.div>
    </div>
  );
}

export default function VinylPlayer({ songs }: VinylPlayerProps) {
  const { currentSongId, playSong, songProgress } = useSiteAudio();

  const playable = songs.filter((song) => song.audioUrl);
  const current = songs.find((song) => song.id === currentSongId) ?? null;
  const spinning = Boolean(current);

  return (
    <section id="chansons" className="relative px-5 py-20 sm:py-24">
      <SectionTitle
        overline="Le top 3"
        title="Nos chansons"
        description="Les trois morceaux qui te ressemblent le plus. Pose l'aiguille."
      />

      <div className="mx-auto max-w-2xl">
        {/* La platine */}
        <motion.div
          className="grain relative overflow-hidden rounded-[1.75rem] border border-dore/20 bg-gradient-to-b from-moka/70 to-cacao/90 p-6 shadow-warm sm:p-8"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85 }}
        >
          <div className="relative mx-auto max-w-[17rem]">
            <Record cover={current?.cover ?? null} spinning={spinning} />

            {/* Bras de lecture : pivote vers le disque à la lecture, puis
                progresse lentement vers le centre avec le morceau. */}
            <motion.div
              className="absolute -right-2 -top-3 origin-top-right sm:-right-4"
              animate={{ rotate: spinning ? 20 + songProgress * 12 : -6 }}
              transition={{ type: 'spring', damping: 20, stiffness: 90 }}
            >
              {/* Hauteur en pixels : le parent est en position absolue et n'a
                  pas de hauteur propre, un pourcentage ne résoudrait rien. */}
              <svg viewBox="0 0 40 150" className="h-44 w-auto sm:h-52">
                {/* Pivot */}
                <circle cx="30" cy="12" r="9" fill="#3A2412" stroke="#C8A34C" strokeWidth="1" opacity="0.95" />
                <circle cx="30" cy="12" r="3.5" fill="#C8A34C" opacity="0.8" />
                {/* Tube */}
                <rect x="27" y="12" width="4" height="106" rx="2" fill="#8C7A5E" />
                <rect x="28.2" y="12" width="1.2" height="106" fill="#D8C9A6" opacity="0.6" />
                {/* Cellule et pointe */}
                <path d="M22 116 h14 v14 l-7 8 -7 -8 Z" fill="#2B1A0C" stroke="#C8A34C" strokeWidth="0.8" />
                <circle cx="29" cy="134" r="1.6" fill="#E6C879" />
              </svg>
            </motion.div>
          </div>

          {/* Étiquette du morceau en cours */}
          <div className="mt-7 flex min-h-[3.25rem] items-center justify-center gap-3 text-center">
            {current ? (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <p className="font-serif text-lg text-creme">{current.title}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-dore/70">
                  {current.artist}
                </p>
              </motion.div>
            ) : (
              <p className="text-xs uppercase tracking-[0.24em] text-latte/45">
                {playable.length ? 'Choisis un morceau' : 'Aucun morceau pour le moment'}
              </p>
            )}
          </div>
        </motion.div>

        {/* Les trois pistes */}
        <ul className="mt-5 space-y-3">
          {songs.map((song, index) => {
            const isCurrent = song.id === currentSongId;
            const disabled = !song.audioUrl;

            return (
              <motion.li
                key={song.id}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => song.audioUrl && playSong(song.id, song.audioUrl)}
                  className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition ${
                    isCurrent
                      ? 'border-dore/55 bg-dore/10'
                      : 'border-dore/15 bg-cacao/45 hover:border-dore/35'
                  } ${disabled ? 'cursor-not-allowed opacity-45' : 'active:scale-[0.99]'}`}
                >
                  <span className="w-4 shrink-0 text-center font-serif text-sm text-dore/55 tabular-nums">
                    {index + 1}
                  </span>

                  {/* Vignette de pochette */}
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-moka/60 ring-1 ring-dore/20">
                    {song.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={song.cover} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">
                        <Disc3
                          className={`h-5 w-5 text-dore/45 ${isCurrent ? 'animate-spin-slow' : ''}`}
                          strokeWidth={1.5}
                        />
                      </span>
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-[1.02rem] text-creme/92">
                      {song.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-latte/60">{song.artist}</span>
                  </span>

                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                      isCurrent ? 'bg-dore text-espresso' : 'bg-espresso/55 text-dore/80'
                    }`}
                  >
                    {isCurrent ? (
                      <Pause className="h-4 w-4" fill="currentColor" />
                    ) : (
                      <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                    )}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
