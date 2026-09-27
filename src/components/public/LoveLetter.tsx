'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

import SectionTitle from '@/components/public/SectionTitle';
import type { SiteConfig } from '@/lib/types';

interface LoveLetterProps {
  letter: SiteConfig['letter'];
  name: string;
}

/** Sceau de cire : disque carmin bombé, initiale gravée, bords irréguliers. */
function WaxSeal({ initial, onClick, broken }: { initial: string; onClick: () => void; broken: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group relative block"
      whileTap={{ scale: 0.92 }}
      aria-label={broken ? 'Refermer la lettre' : 'Ouvrir la lettre'}
    >
      <motion.span
        className="absolute inset-0 -z-10 scale-[1.55] rounded-full bg-carmin/35 blur-xl"
        animate={{ opacity: broken ? 0.25 : [0.35, 0.65, 0.35] }}
        transition={{ duration: 3.2, repeat: broken ? 0 : Infinity, ease: 'easeInOut' }}
      />

      <svg viewBox="0 0 100 100" className="h-20 w-20 drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]">
        <defs>
          <radialGradient id="wax" cx="38%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#C8464F" />
            <stop offset="55%" stopColor="#9B2B34" />
            <stop offset="100%" stopColor="#6B161D" />
          </radialGradient>
        </defs>
        {/* Contour volontairement bosselé, comme de la cire pressée à la main */}
        <path
          d="M50 6 C62 6 70 12 76 18 C84 25 94 32 94 46 C94 60 86 66 80 74 C74 82 66 94 50 94 C34 94 26 82 20 74 C14 66 6 60 6 46 C6 32 16 25 24 18 C30 12 38 6 50 6 Z"
          fill="url(#wax)"
        />
        <circle cx="50" cy="50" r="31" fill="none" stroke="#5C1219" strokeWidth="1.6" opacity="0.55" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#E08A92" strokeWidth="0.9" opacity="0.3" />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-script"
          fontSize="40"
          fill="#F3D9A8"
          opacity="0.92"
        >
          {initial}
        </text>
      </svg>
    </motion.button>
  );
}

export default function LoveLetter({ letter, name }: LoveLetterProps) {
  const [open, setOpen] = useState(false);
  const initial = (name.trim()[0] ?? 'S').toUpperCase();

  return (
    <section id="lettre" className="relative px-5 py-20 sm:py-24">
      <SectionTitle
        overline="La lettre"
        title="Ce que je voulais te dire"
        description={open ? undefined : 'Brise le sceau quand tu es prête.'}
      />

      <div className="mx-auto max-w-2xl">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9 }}
        >
          {/* Le sceau, posé à cheval sur le bord supérieur du parchemin */}
          <div className="relative z-20 flex justify-center">
            <motion.div
              animate={open ? { y: 4, rotate: -13, scale: 0.82 } : { y: 0, rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 190 }}
              style={{ transformOrigin: '20% 80%' }}
            >
              <WaxSeal initial={initial} broken={open} onClick={() => setOpen((v) => !v)} />
            </motion.div>
          </div>

          <motion.article
            className="parchment grain relative -mt-10 overflow-hidden rounded-[1.75rem] px-6 pb-10 pt-16 text-cacao shadow-warm sm:px-12 sm:pt-20"
            animate={{
              height: open ? 'auto' : 190,
            }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{ boxShadow: '0 30px 70px -30px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(155,43,52,0.12)' }}
          >
            {/* Bords brûlés : ombres internes très douces */}
            <span className="pointer-events-none absolute inset-0 rounded-[1.75rem] shadow-[inset_0_0_60px_rgba(120,74,32,0.22)]" />
            {/* Pli horizontal du papier */}
            <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-noisette/25 to-transparent" />

            <h3 className="mb-6 text-center font-script text-3xl text-carmin sm:text-4xl">
              {letter.title}
            </h3>

            <div className="relative space-y-5 font-serif text-[1.06rem] leading-[1.85] text-[#4A2E19] sm:text-lg">
              {letter.body.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index} className="first:first-letter:float-left first:first-letter:mr-2 first:first-letter:font-script first:first-letter:text-[3.4rem] first:first-letter:leading-[0.82] first:first-letter:text-carmin">
                  {paragraph}
                </p>
              ))}
            </div>

            <p className="mt-9 text-right font-script text-2xl text-carmin/90 sm:text-3xl">
              {letter.signature}
            </p>

            {/* Voile de fermeture, tant que la lettre est pliée */}
            {!open && (
              <motion.button
                type="button"
                onClick={() => setOpen(true)}
                className="absolute inset-x-0 bottom-0 flex h-28 items-end justify-center pb-5"
                style={{
                  background: 'linear-gradient(to top, #EFE0C6 22%, rgba(239,224,198,0.92) 55%, transparent)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="text-[10px] uppercase tracking-[0.28em] text-carmin/70">
                  Lire la lettre
                </span>
              </motion.button>
            )}
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}
