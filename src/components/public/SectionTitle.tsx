'use client';

import { motion } from 'framer-motion';

interface SectionTitleProps {
  overline: string;
  title: string;
  description?: string;
}

/** En-tête de section commun : surtitre doré, titre serif, filet, texte. */
export default function SectionTitle({ overline, title, description }: SectionTitleProps) {
  return (
    <motion.div
      className="mx-auto mb-11 max-w-xl text-center"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8 }}
    >
      <p className="mb-3 text-[10px] uppercase tracking-[0.36em] text-dore/65">{overline}</p>
      <h2 className="heading-serif mb-4 text-3xl text-creme sm:text-4xl">{title}</h2>
      <span className="mx-auto mb-4 block h-px w-12 bg-dore/45" />
      {description && (
        <p className="mx-auto max-w-[24rem] text-sm leading-relaxed text-latte/75">{description}</p>
      )}
    </motion.div>
  );
}
