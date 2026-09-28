'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import AmbientCanvas from '@/components/public/AmbientCanvas';
import AudioProvider, { useSiteAudio } from '@/components/public/AudioProvider';
import BgmToggle from '@/components/public/BgmToggle';
import FlowerGarden from '@/components/public/FlowerGarden';
import Gallery from '@/components/public/Gallery';
import Hero from '@/components/public/Hero';
import LoveLetter from '@/components/public/LoveLetter';
import PasswordGate from '@/components/public/PasswordGate';
import VinylPlayer from '@/components/public/VinylPlayer';
import type { PublicConfig } from '@/lib/types';

const UNLOCK_KEY = 'sofia:unlocked';

/** The gift itself, once the gate has been passed. */
function Unlocked({ config }: { config: PublicConfig }) {
  const { fadeInBgm } = useSiteAudio();

  // Gently start the background music, if it was enabled in the studio.
  useEffect(() => {
    if (config.bgm.enabled && config.bgm.url) {
      const timer = setTimeout(fadeInBgm, 500);
      return () => clearTimeout(timer);
    }
  }, [config.bgm.enabled, config.bgm.url, fadeInBgm]);

  return (
    <motion.main
      className="relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      <Hero greeting={config.greeting} subtitle={config.subtitle} />
      <FlowerGarden flowers={config.flowers} intro={config.gardenIntro} />
      <LoveLetter letter={config.letter} name={config.name} />
      <Gallery photos={config.photos} />
      <VinylPlayer songs={config.songs} />

      <footer className="relative px-6 pb-16 pt-6 text-center safe-b">
        <span className="mx-auto mb-6 block h-px w-20 bg-gradient-to-r from-transparent via-dore/40 to-transparent" />
        <motion.div
          animate={{ scale: [1, 1.14, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-4 inline-block"
        >
          <Heart className="h-5 w-5 text-carminClair" fill="currentColor" strokeWidth={0} />
        </motion.div>
        <p className="font-script text-2xl text-dore/80">Joyeux anniversaire, {config.name}.</p>
      </footer>

      <BgmToggle />
    </motion.main>
  );
}

export default function Experience({ config }: { config: PublicConfig }) {
  // `null` = not known yet (avoids a flash of the gate on reload).
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setUnlocked(window.sessionStorage.getItem(UNLOCK_KEY) === '1');
    } catch {
      setUnlocked(false);
    }
  }, []);

  const unlock = useCallback(() => {
    try {
      window.sessionStorage.setItem(UNLOCK_KEY, '1');
    } catch {
      // Private browsing: the gate returns on next load, which is harmless.
    }
    setUnlocked(true);
  }, []);

  return (
    <AudioProvider bgmUrl={config.bgm.url}>
      <AmbientCanvas />

      <AnimatePresence mode="wait">
        {unlocked === false && (
          <PasswordGate key="gate" hint={config.hint} onUnlocked={unlock} />
        )}
      </AnimatePresence>

      {unlocked === true && <Unlocked config={config} />}
    </AudioProvider>
  );
}
