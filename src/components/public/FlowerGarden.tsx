'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

import { FLOWER_ACCENT, FLOWER_ART } from '@/components/flowers';
import Modal from '@/components/public/Modal';
import SectionTitle from '@/components/public/SectionTitle';
import type { Flower } from '@/lib/types';

interface FlowerGardenProps {
  flowers: Flower[];
  intro: string;
}

export default function FlowerGarden({ flowers, intro }: FlowerGardenProps) {
  const [active, setActive] = useState<Flower | null>(null);
  const accent = active ? FLOWER_ACCENT[active.id] : '#C8A34C';
  const ActiveArt = active ? FLOWER_ART[active.id] : null;

  return (
    <section id="jardin" className="relative px-5 py-20 sm:py-24">
      <SectionTitle overline="Le jardin" title="Cinq fleurs pour toi" description={intro} />

      {/* Deux colonnes sur mobile, cinq alignées à partir du desktop. */}
      <ul className="mx-auto grid max-w-4xl grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        {flowers.map((flower, index) => {
          const Art = FLOWER_ART[flower.id];
          const isLastOdd = flowers.length % 2 === 1 && index === flowers.length - 1;

          return (
            <li key={flower.id} className={isLastOdd ? 'col-span-2 sm:col-span-1' : undefined}>
              <motion.button
                type="button"
                onClick={() => setActive(flower)}
                className="group relative flex w-full flex-col items-center gap-3 rounded-3xl px-2 py-5 transition"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: index * 0.09 }}
                whileTap={{ scale: 0.94 }}
                aria-label={`${flower.name} — lire le message`}
              >
                {/* Lueur qui apparaît au survol / à l'appui */}
                <span
                  className="pointer-events-none absolute inset-x-4 bottom-4 top-2 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-40"
                  style={{ background: FLOWER_ACCENT[flower.id] }}
                />

                <motion.div
                  className="relative"
                  animate={{ rotate: [-2.4, 2.4, -2.4] }}
                  transition={{
                    duration: 5.5 + index * 0.7,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.4,
                  }}
                >
                  <Art className="h-32 w-auto drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-[1.07] sm:h-36" />
                </motion.div>

                <span className="relative font-serif text-base text-creme/90 transition group-hover:text-creme">
                  {flower.name}
                </span>
                <span className="relative text-[9px] uppercase tracking-[0.2em] text-dore/50 transition group-hover:text-dore/85">
                  Touche-moi
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        label={active?.name}
        className="max-w-md"
      >
        {active && ActiveArt && (
          <div
            className="grain relative overflow-hidden rounded-t-3xl border border-dore/25 bg-cacao/95 px-6 pb-9 pt-11 text-center backdrop-blur-xl sm:rounded-3xl sm:px-8"
            style={{
              backgroundImage: `radial-gradient(110% 70% at 50% 0%, ${accent}2e, transparent 62%)`,
            }}
          >
            <div className="relative mx-auto mb-5 w-fit">
              <span
                className="absolute inset-0 -z-10 scale-[1.7] rounded-full blur-2xl"
                style={{ background: `${accent}55` }}
              />
              <ActiveArt className="h-28 w-auto" />
            </div>

            <p
              className="mb-2 text-[10px] uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              {active.name}
            </p>
            <h3 className="heading-serif mb-5 text-2xl text-creme">{active.title}</h3>

            <span
              className="mx-auto mb-5 block h-px w-14"
              style={{ background: `${accent}80` }}
            />

            <p className="whitespace-pre-line text-left font-serif text-[1.03rem] leading-[1.75] text-creme/88">
              {active.message}
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
}
