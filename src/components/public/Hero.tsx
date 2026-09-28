'use client';

import { motion } from 'framer-motion';

interface HeroProps {
  greeting: string;
  subtitle: string;
}

/** Splits the greeting so each word can animate in on its own. */
function words(text: string): string[] {
  return text.trim().split(/\s+/);
}

export default function Hero({ greeting, subtitle }: HeroProps) {
  const parts = words(greeting);

  return (
    <header className="relative flex min-h-[86dvh] flex-col items-center justify-center px-6 pt-16 text-center">
      <motion.p
        className="mb-6 text-[10px] uppercase tracking-[0.42em] text-dore/65"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15 }}
      >
        Today is your day
      </motion.p>

      {/* The title is split into words for the animation; `aria-label` keeps
          one readable sentence for screen readers and for copy-paste. */}
      <h1
        aria-label={greeting}
        className="heading-serif mb-7 text-[2.65rem] leading-[1.06] sm:text-6xl md:text-7xl"
      >
        {parts.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            aria-hidden
            className="mr-[0.28em] inline-block text-gilded"
            initial={{ opacity: 0, y: 26, filter: 'blur(7px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              duration: 1,
              delay: 0.3 + index * 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        ))}
      </h1>

      {/* Gold rule with a small diamond at its centre */}
      <motion.div
        className="mb-7 flex items-center gap-3"
        initial={{ opacity: 0, scaleX: 0.3 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1.1, delay: 0.3 + parts.length * 0.16 }}
      >
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-dore/60" />
        <span className="h-1.5 w-1.5 rotate-45 bg-dore/80" />
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-dore/60" />
      </motion.div>

      <motion.p
        className="max-w-[22rem] font-serif text-lg leading-relaxed text-creme/85 sm:text-xl"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 + parts.length * 0.16 }}
      >
        {subtitle}
      </motion.p>

      {/* Nudge to scroll */}
      <motion.div
        className="absolute bottom-9 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.9 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-latte/45">Scroll</span>
          <span className="h-9 w-px bg-gradient-to-b from-dore/55 to-transparent" />
        </motion.div>
      </motion.div>
    </header>
  );
}
