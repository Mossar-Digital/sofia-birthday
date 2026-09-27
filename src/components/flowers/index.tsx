import type React from 'react';

import type { FlowerKind } from '@/lib/types';

interface FlowerProps {
  className?: string;
}

const STEM = '#4E6B3A';
const STEM_DARK = '#3C5430';
const LEAF = '#5C7C42';

/** Tige commune, dessinée avant les pétales pour passer dessous. */
function Stem({ leftLeaf = true, rightLeaf = true }: { leftLeaf?: boolean; rightLeaf?: boolean }) {
  return (
    <g>
      <path d="M50 62 Q52 90 50 124" stroke={STEM} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      {leftLeaf && (
        <path d="M50 88 Q33 80 26 92 Q38 100 50 94 Z" fill={LEAF} />
      )}
      {rightLeaf && (
        <path d="M50 104 Q67 96 74 108 Q62 116 50 110 Z" fill={STEM_DARK} />
      )}
    </g>
  );
}

function Rose({ className }: FlowerProps) {
  return (
    <svg viewBox="0 0 100 130" className={className} role="presentation">
      <Stem />
      {/* Pétales extérieurs, puis la spirale du cœur */}
      <g>
        <ellipse cx="50" cy="38" rx="26" ry="24" fill="#8E2029" />
        <path d="M24 38 Q30 16 50 14 Q46 30 42 40 Z" fill="#A82B35" />
        <path d="M76 38 Q70 16 50 14 Q54 30 58 40 Z" fill="#A82B35" />
        <path d="M26 46 Q38 62 50 62 Q42 52 38 44 Z" fill="#7A1A23" />
        <path d="M74 46 Q62 62 50 62 Q58 52 62 44 Z" fill="#7A1A23" />
        <ellipse cx="50" cy="37" rx="17" ry="16" fill="#BE3F49" />
        <path
          d="M50 25 Q62 30 60 40 Q58 50 48 49 Q39 48 40 40 Q41 33 50 33 Q56 34 55 39 Q54 44 49 43"
          fill="none"
          stroke="#6E141C"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <ellipse cx="50" cy="35" rx="5.5" ry="5" fill="#D8636C" opacity="0.65" />
      </g>
    </svg>
  );
}

function Tournesol({ className }: FlowerProps) {
  // 18 pétales générés en cercle : un tournesol dessiné à la main serait irrégulier.
  const petals = Array.from({ length: 18 }, (_, i) => (i * 360) / 18);
  return (
    <svg viewBox="0 0 100 130" className={className} role="presentation">
      <Stem />
      <g>
        {petals.map((angle, i) => (
          <ellipse
            key={angle}
            cx="50"
            cy="14"
            rx="5.2"
            ry="16"
            fill={i % 2 === 0 ? '#E0A62F' : '#C88A22'}
            transform={`rotate(${angle} 50 38)`}
          />
        ))}
        <circle cx="50" cy="38" r="15" fill="#5A3317" />
        <circle cx="50" cy="38" r="11" fill="#40230F" />
        {/* Grains : spirale de Fermat, comme sur un vrai capitule */}
        {Array.from({ length: 26 }, (_, i) => {
          const t = i * 2.39996;
          const r = 1.9 * Math.sqrt(i);
          return (
            <circle
              key={i}
              cx={50 + r * Math.cos(t)}
              cy={38 + r * Math.sin(t)}
              r="1.15"
              fill="#7A4A1F"
            />
          );
        })}
      </g>
    </svg>
  );
}

function Tulipe({ className }: FlowerProps) {
  return (
    <svg viewBox="0 0 100 130" className={className} role="presentation">
      <path d="M50 54 Q52 90 50 124" stroke={STEM} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M50 84 Q30 74 22 92 Q36 104 50 92 Z" fill={LEAF} />
      <path d="M50 100 Q70 92 77 110 Q62 120 50 108 Z" fill={STEM_DARK} />
      <g>
        {/* Calice fermé. Les trois lobes se recouvrent largement : sans ce
            chevauchement, le fond sombre formerait deux fentes dures. */}
        <path d="M30 26 Q28 54 50 64 Q72 54 70 26 Q60 38 50 36 Q40 38 30 26 Z" fill="#B5333F" />
        <path d="M30 26 Q31 12 41 7 Q40 24 48 36 Q37 37 30 26 Z" fill="#C34350" />
        <path d="M70 26 Q69 12 59 7 Q60 24 52 36 Q63 37 70 26 Z" fill="#C34350" />
        <path d="M41 7 Q50 2 59 7 Q57 26 50 38 Q43 26 41 7 Z" fill="#D45A64" />
        <ellipse cx="50" cy="50" rx="13" ry="10" fill="#8E2029" opacity="0.26" />
      </g>
    </svg>
  );
}

function Pivoine({ className }: FlowerProps) {
  const outer = Array.from({ length: 12 }, (_, i) => (i * 360) / 12);
  const inner = Array.from({ length: 8 }, (_, i) => (i * 360) / 8 + 22);
  return (
    <svg viewBox="0 0 100 130" className={className} role="presentation">
      <Stem />
      <g>
        {outer.map((angle) => (
          <ellipse
            key={`o-${angle}`}
            cx="50"
            cy="21"
            rx="11"
            ry="15"
            fill="#D98C9A"
            opacity="0.92"
            transform={`rotate(${angle} 50 38)`}
          />
        ))}
        {inner.map((angle) => (
          <ellipse
            key={`i-${angle}`}
            cx="50"
            cy="28"
            rx="8.5"
            ry="11"
            fill="#C2687A"
            transform={`rotate(${angle} 50 38)`}
          />
        ))}
        {/* Cœur froissé, signature de la pivoine */}
        <circle cx="50" cy="38" r="9" fill="#AD4E61" />
        <path
          d="M44 38 Q47 32 50 38 Q53 32 56 38 Q53 44 50 39 Q47 44 44 38 Z"
          fill="#E8AFB9"
          opacity="0.85"
        />
        <circle cx="50" cy="38" r="2.6" fill="#F2D4A8" />
      </g>
    </svg>
  );
}

function Lavande({ className }: FlowerProps) {
  // Trois épis de hauteurs différentes, chacun garni de fleurons alternés.
  const spikes = [
    { x: 50, top: 8, h: 44, w: 5.2 },
    { x: 34, top: 20, h: 34, w: 4.4 },
    { x: 66, top: 24, h: 30, w: 4.4 },
  ];
  return (
    <svg viewBox="0 0 100 130" className={className} role="presentation">
      {spikes.map((s) => (
        <path
          key={`stem-${s.x}`}
          d={`M${s.x} ${s.top + s.h} Q${s.x + (50 - s.x) * 0.25} 90 50 124`}
          stroke={STEM}
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <path d="M46 92 Q28 84 21 100 Q36 110 48 98 Z" fill={LEAF} />
      <path d="M54 102 Q72 96 78 112 Q62 120 52 108 Z" fill={STEM_DARK} />
      {spikes.map((s) =>
        Array.from({ length: 9 }, (_, i) => {
          const y = s.top + (i * s.h) / 9;
          const offset = i % 2 === 0 ? -s.w * 0.72 : s.w * 0.72;
          return (
            <ellipse
              key={`${s.x}-${i}`}
              cx={s.x + offset}
              cy={y}
              rx={s.w * 0.82}
              ry={s.w * 0.62}
              fill={i % 3 === 0 ? '#8B6FBF' : i % 3 === 1 ? '#7558A8' : '#9C86CC'}
            />
          );
        }),
      )}
    </svg>
  );
}

export const FLOWER_ART: Record<FlowerKind, (props: FlowerProps) => React.ReactElement> = {
  rose: Rose,
  tournesol: Tournesol,
  tulipe: Tulipe,
  pivoine: Pivoine,
  lavande: Lavande,
};

/** Teinte d'accent associée à chaque fleur, utilisée par les modales. */
export const FLOWER_ACCENT: Record<FlowerKind, string> = {
  rose: '#BE3F49',
  tournesol: '#E0A62F',
  tulipe: '#C9424E',
  pivoine: '#D98C9A',
  lavande: '#8B6FBF',
};
