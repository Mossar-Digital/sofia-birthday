'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Disc3, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useSiteAudio } from '@/components/public/AudioProvider';

/**
 * Bouton flottant de musique d'ambiance. Discret, en bas à droite,
 * au-dessus de la zone sûre des téléphones.
 */
export default function BgmToggle() {
  const { bgmAvailable, bgmPlaying, toggleBgm } = useSiteAudio();
  const [showLabel, setShowLabel] = useState(false);

  // La première fois, une étiquette explique le bouton puis s'effface.
  useEffect(() => {
    if (!bgmAvailable) return;
    const appear = setTimeout(() => setShowLabel(true), 2600);
    const vanish = setTimeout(() => setShowLabel(false), 7200);
    return () => {
      clearTimeout(appear);
      clearTimeout(vanish);
    };
  }, [bgmAvailable]);

  if (!bgmAvailable) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 safe-b">
      <AnimatePresence>
        {showLabel && (
          <motion.span
            initial={{ opacity: 0, x: 10, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.94 }}
            className="rounded-full border border-dore/25 bg-cacao/90 px-3.5 py-2 text-[10px] uppercase tracking-[0.18em] text-creme/80 backdrop-blur"
          >
            {bgmPlaying ? 'La musique joue' : 'Musique coupée'}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => {
          toggleBgm();
          setShowLabel(false);
        }}
        className="relative flex items-center justify-center rounded-full border border-dore/35 bg-cacao/85 text-dore shadow-warm backdrop-blur-md"
        style={{ height: 52, width: 52 }}
        whileTap={{ scale: 0.9 }}
        aria-label={bgmPlaying ? "Couper la musique d'ambiance" : "Relancer la musique d'ambiance"}
        aria-pressed={bgmPlaying}
      >
        {/* Ondes qui pulsent doucement pendant la lecture */}
        <AnimatePresence>
          {bgmPlaying && (
            <motion.span
              className="absolute inset-0 rounded-full border border-dore/40"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.7, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {bgmPlaying ? (
          <Disc3 className="h-5 w-5 animate-spin-slow" strokeWidth={1.7} />
        ) : (
          <VolumeX className="h-5 w-5 text-latte/70" strokeWidth={1.7} />
        )}
      </motion.button>
    </div>
  );
}
